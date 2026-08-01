/* eslint-disable import/no-unresolved */
// Edge Function: notification-sweep (G3, 2026-07-19)
// The hourly scheduled-notification brain. pg_cron (00029) POSTs here once an
// hour with the service key; this function:
//   1. loads every couple + members + today's signals (service role),
//   2. computes each couple's LOCAL hour/date (couples.timezone — the same
//      day rule as the streak engine),
//   3. runs the sweep planner (mirrored from src/features/notifications/
//      sweep.ts, canonical + tested there) to decide who gets what,
//   4. dedupes against notifications already sent in the last 20h
//      (same recipient + category + route), then
//   5. dispatches each action through send-notification, so prefs, quiet
//      hours, push debounce, and token pruning all apply unchanged.
//
// Jobs (local time): 9am devotional reminder + grace notice · 10am milestone
// countdowns (3 days / day-of) · 12pm the ONE daily prayer digest (locked
// 2026-06-29) · Sun 6pm weekly check-in reminder · 7pm streak-at-risk
// (streak ≥ 3 only). Copy carries names/counts, never content.
//
// Auth: service key ONLY (cron is the caller; there is no user context).
// Idempotent: re-running within the hour re-sends nothing (dedupe window).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ——— mirrored from src/features/notifications/sweep.ts — keep in sync ———
const SWEEP_HOURS = {
  devotionalReminder: 9,
  graceNotice: 9,
  milestone: 10,
  prayerDigest: 12,
  checkInReminder: 18,
  streakAtRisk: 19,
} as const;
const CHECK_IN_DOW = 0;
const STREAK_RISK_MIN = 3;

interface SweepMember {
  id: string;
  devotionalDoneToday: boolean;
  checkInThisWeek: boolean;
}
interface SweepCoupleInput {
  coupleId: string;
  localHour: number;
  localDow: number;
  localDate: string;
  streakCount: number;
  members: SweepMember[];
  activeSharedPrayers: number;
  milestones: { title: string; icon: string | null; event_date: string }[];
  graceUsedRecently: boolean;
}
interface SweepAction {
  recipientId: string;
  category: string;
  title: string;
  body: string | null;
  route: string;
}

function daysUntil(eventDate: string, localDate: string): number {
  const event = Date.parse(`${eventDate}T00:00:00Z`);
  const today = Date.parse(`${localDate}T00:00:00Z`);
  if (Number.isNaN(event) || Number.isNaN(today)) return NaN;
  return Math.round((event - today) / 86_400_000);
}

function planCoupleSweep(input: SweepCoupleInput): SweepAction[] {
  const actions: SweepAction[] = [];
  const {
    localHour,
    localDow,
    localDate,
    streakCount,
    members,
    activeSharedPrayers,
    milestones,
    graceUsedRecently,
  } = input;

  if (localHour === SWEEP_HOURS.devotionalReminder) {
    for (const m of members) {
      if (!m.devotionalDoneToday) {
        actions.push({
          recipientId: m.id,
          category: 'daily_reminder',
          title: "Today's devotional is ready 🕊️",
          body: 'A few quiet minutes together — light the flame.',
          route: '/(tabs)/devotional',
        });
      }
    }
    if (graceUsedRecently) {
      for (const m of members) {
        actions.push({
          recipientId: m.id,
          category: 'streak_alert',
          title: '🕊️ Grace covered you yesterday',
          body: 'One missed day is held — the flame is still lit.',
          route: '/modal/us-hub',
        });
      }
    }
  }

  if (localHour === SWEEP_HOURS.milestone) {
    for (const milestone of milestones) {
      const days = daysUntil(milestone.event_date, localDate);
      if (days !== 0 && days !== 3) continue;
      const icon = milestone.icon || '🎉';
      const title =
        days === 0
          ? `${icon} ${milestone.title} is today 🎉`
          : `${icon} ${milestone.title} is in 3 days`;
      for (const m of members) {
        actions.push({
          recipientId: m.id,
          category: 'milestone',
          title,
          body: null,
          route: '/(tabs)/journal',
        });
      }
    }
  }

  if (localHour === SWEEP_HOURS.prayerDigest && activeSharedPrayers > 0) {
    const n = activeSharedPrayers;
    for (const m of members) {
      actions.push({
        recipientId: m.id,
        category: 'daily_reminder',
        title: 'A moment for prayer 🙏',
        body: `${n} shared request${n === 1 ? '' : 's'} ${n === 1 ? 'is' : 'are'} waiting for you two.`,
        route: '/(tabs)/connect/prayers',
      });
    }
  }

  if (localHour === SWEEP_HOURS.checkInReminder && localDow === CHECK_IN_DOW) {
    for (const m of members) {
      if (!m.checkInThisWeek) {
        actions.push({
          recipientId: m.id,
          category: 'daily_reminder',
          title: 'Your weekly check-in is open 💬',
          body: "Five minutes tonight — see each other's week.",
          route: '/(tabs)/connect',
        });
      }
    }
  }

  if (localHour === SWEEP_HOURS.streakAtRisk && streakCount >= STREAK_RISK_MIN) {
    for (const m of members) {
      if (!m.devotionalDoneToday) {
        actions.push({
          recipientId: m.id,
          category: 'streak_alert',
          title: `🔥 Your ${streakCount}-day streak is on the line`,
          body: "Finish today's devotional to keep the flame.",
          route: '/(tabs)/devotional',
        });
      }
    }
  }

  return actions;
}
// ——— end mirror ———

function localParts(tz: string, now: Date): { hour: number; dow: number; date: string } {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const dowMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    return {
      hour: parseInt(get('hour'), 10) % 24,
      dow: dowMap[get('weekday').slice(0, 3)] ?? 0,
      date: `${get('year')}-${get('month')}-${get('day')}`,
    };
  } catch {
    const iso = now.toISOString();
    return { hour: now.getUTCHours(), dow: now.getUTCDay(), date: iso.slice(0, 10) };
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const url = Deno.env.get('SUPABASE_URL')!;
  const bearer = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (bearer !== serviceKey) return json({ error: 'Unauthorized' }, 401);

  const admin = createClient(url, serviceKey);
  const now = new Date();

  // ——— 1) load the world (couple counts are small pre-launch; optimize later)
  const [couplesRes, profilesRes, activityRes, prayersRes, milestonesRes, eventsRes, sentRes] =
    await Promise.all([
      admin.from('couples').select('id, timezone, streak_count'),
      admin.from('profiles').select('id, couple_id').not('couple_id', 'is', null),
      admin
        .from('activity_log')
        .select('couple_id, user_id, activity_type, activity_date')
        .in('activity_type', ['devotional', 'check_in'])
        .gte('activity_date', new Date(now.getTime() - 8 * 86_400_000).toISOString().slice(0, 10)),
      admin
        .from('prayers')
        .select('couple_id')
        .eq('is_answered', false)
        .eq('is_archived', false)
        .eq('is_private', false),
      admin
        .from('couple_milestones')
        .select('couple_id, title, icon, event_date')
        .gte('event_date', new Date(now.getTime() - 2 * 86_400_000).toISOString().slice(0, 10))
        .lte('event_date', new Date(now.getTime() + 5 * 86_400_000).toISOString().slice(0, 10)),
      admin
        .from('couple_events')
        .select('couple_id, created_at')
        .eq('event_type', 'grace_used')
        .gte('created_at', new Date(now.getTime() - 26 * 3_600_000).toISOString()),
      admin
        .from('notifications')
        .select('recipient_id, category, route')
        .gte('created_at', new Date(now.getTime() - 20 * 3_600_000).toISOString()),
    ]);

  if (couplesRes.error) return json({ error: 'couples query failed' }, 500);

  const membersByCouple = new Map<string, string[]>();
  for (const p of profilesRes.data ?? []) {
    const list = membersByCouple.get(p.couple_id) ?? [];
    list.push(p.id);
    membersByCouple.set(p.couple_id, list);
  }
  const prayerCount = new Map<string, number>();
  for (const p of prayersRes.data ?? []) {
    prayerCount.set(p.couple_id, (prayerCount.get(p.couple_id) ?? 0) + 1);
  }
  const milestonesByCouple = new Map<string, { title: string; icon: string | null; event_date: string }[]>();
  for (const m of milestonesRes.data ?? []) {
    const list = milestonesByCouple.get(m.couple_id) ?? [];
    list.push({ title: m.title, icon: m.icon, event_date: m.event_date });
    milestonesByCouple.set(m.couple_id, list);
  }
  const graceCouples = new Set((eventsRes.data ?? []).map((e) => e.couple_id));
  const alreadySent = new Set(
    (sentRes.data ?? []).map((n) => `${n.recipient_id}|${n.category}|${n.route ?? ''}`)
  );

  // ——— 2) plan per couple
  const actions: SweepAction[] = [];
  for (const couple of couplesRes.data ?? []) {
    const memberIds = membersByCouple.get(couple.id) ?? [];
    if (memberIds.length === 0) continue;
    const { hour, dow, date } = localParts(couple.timezone || 'UTC', now);

    const members: SweepMember[] = memberIds.map((id) => ({
      id,
      devotionalDoneToday: (activityRes.data ?? []).some(
        (a) =>
          a.user_id === id && a.activity_type === 'devotional' && a.activity_date === date
      ),
      checkInThisWeek: (activityRes.data ?? []).some(
        (a) =>
          a.user_id === id &&
          a.activity_type === 'check_in' &&
          daysUntil(date, a.activity_date) <= 6 // activity within the last 6 days
      ),
    }));

    actions.push(
      ...planCoupleSweep({
        coupleId: couple.id,
        localHour: hour,
        localDow: dow,
        localDate: date,
        streakCount: couple.streak_count ?? 0,
        members,
        activeSharedPrayers: prayerCount.get(couple.id) ?? 0,
        milestones: milestonesByCouple.get(couple.id) ?? [],
        graceUsedRecently: graceCouples.has(couple.id),
      })
    );
  }

  // ——— 3) dedupe + dispatch through send-notification (prefs/quiet-hours/
  // debounce/token-pruning all live there — one door).
  let sent = 0;
  let skipped = 0;
  for (const action of actions) {
    const key = `${action.recipientId}|${action.category}|${action.route}`;
    if (alreadySent.has(key)) {
      skipped++;
      continue;
    }
    alreadySent.add(key); // also guards duplicates within this run
    try {
      const res = await fetch(`${url}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });
      if (res.ok) sent++;
      else skipped++;
    } catch {
      skipped++;
    }
  }

  return json({ planned: actions.length, sent, skipped });
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
