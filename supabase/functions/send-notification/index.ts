/* eslint-disable import/no-unresolved */
// Edge Function: send-notification (G1, 2026-07-18)
// The ONE door every notification goes through — G2's partner-activity
// events and G3's cron jobs all call this. It:
//   1. writes the inbox row (source of truth — powers the bell + page),
//   2. checks the recipient's prefs (category muted → inbox only? NO —
//      muted category = neither inbox nor push; quiet hours = inbox yes,
//      push no),
//   3. sends the Expo push (if the recipient has a token),
//   4. prunes dead tokens (DeviceNotRegistered → push_token cleared).
//
// CALLERS:
//   - An authenticated USER (JWT): may only notify their own partner
//     (same couple) — powers praying-for-you etc. from the app directly.
//   - The service role (cron jobs / DB webhooks, G3): may notify anyone;
//     pass { recipientId, ... } and the service key as the bearer.
//
// Payload privacy rule (owner-locked): title/body must NEVER contain prayer,
// journal, or check-in content — generic wording only; content stays behind
// the tap. Callers are responsible; keep copy generic.
//
// Contract: POST {
//   recipientId: string, category: 'partner_activity'|'daily_reminder'|
//   'streak_alert'|'milestone'|'system', title: string, body?: string,
//   route?: string  // in-app path opened on tap
// }
// Secrets: none beyond the auto-injected SUPABASE_* vars.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CATEGORIES = [
  'partner_activity',
  'daily_reminder',
  'streak_alert',
  'milestone',
  'system',
] as const;
type Category = (typeof CATEGORIES)[number];

// ——— mirrored from src/features/notifications/prefs.ts (canonical + tested
// there; keep in sync) ———
type QuietHours = { start: number; end: number };
type Prefs = {
  partner_activity?: boolean;
  daily_reminders?: boolean;
  streak_alerts?: boolean;
  milestones?: boolean;
  quiet_hours?: QuietHours | null;
};

const PREF_KEY: Record<Exclude<Category, 'system'>, keyof Prefs> = {
  partner_activity: 'partner_activity',
  daily_reminder: 'daily_reminders',
  streak_alert: 'streak_alerts',
  milestone: 'milestones',
};

function isCategoryEnabled(prefs: Prefs | null, category: Category): boolean {
  if (category === 'system') return true;
  return prefs?.[PREF_KEY[category]] !== false;
}

function isInQuietHours(prefs: Prefs | null, hour: number): boolean {
  const w = prefs?.quiet_hours;
  if (!w || w.start === w.end) return false;
  if (w.start < w.end) return hour >= w.start && hour < w.end;
  return hour >= w.start || hour < w.end;
}

// G2·M2 — max one PUSH per category per window (inbox always written).
const PUSH_DEBOUNCE_HOURS: Record<Category, number> = {
  partner_activity: 2,
  daily_reminder: 0,
  streak_alert: 0,
  milestone: 0,
  system: 0,
};

function shouldDebouncePush(
  category: Category,
  lastPushedAtIso: string | null | undefined,
  now: Date = new Date()
): boolean {
  const hours = PUSH_DEBOUNCE_HOURS[category];
  if (!hours || !lastPushedAtIso) return false;
  const last = new Date(lastPushedAtIso).getTime();
  if (Number.isNaN(last)) return false;
  return now.getTime() - last < hours * 60 * 60 * 1000;
}
// ——— end mirror ———

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const url = Deno.env.get('SUPABASE_URL')!;
  const authHeader = req.headers.get('Authorization') ?? '';
  const bearer = authHeader.replace(/^Bearer\s+/i, '');

  // Service client for reads/writes that must bypass RLS (inbox INSERT has
  // no policy by design).
  const admin = createClient(url, serviceKey);

  // Who is calling?
  let senderId: string | null = null;
  const isServiceCall = bearer === serviceKey;
  if (!isServiceCall) {
    const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await caller.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);
    senderId = user.id;
  }

  const body = await req.json().catch(() => ({}));
  const recipientId = typeof body.recipientId === 'string' ? body.recipientId : '';
  const category = CATEGORIES.includes(body.category) ? (body.category as Category) : null;
  const title = typeof body.title === 'string' ? body.title.slice(0, 120) : '';
  const message = typeof body.body === 'string' ? body.body.slice(0, 300) : null;
  const route = typeof body.route === 'string' ? body.route.slice(0, 200) : null;
  if (!recipientId || !category || !title) {
    return json({ error: 'recipientId, category and title are required' }, 400);
  }

  // Load the recipient (prefs + token + couple).
  const { data: recipient } = await admin
    .from('profiles')
    .select('id, couple_id, push_token, notification_prefs')
    .eq('id', recipientId)
    .maybeSingle();
  if (!recipient) return json({ error: 'Recipient not found' }, 404);

  // A user caller may ONLY notify their own partner (same couple, not self).
  if (senderId) {
    const { data: sender } = await admin
      .from('profiles')
      .select('id, couple_id')
      .eq('id', senderId)
      .maybeSingle();
    const sameCouple =
      sender?.couple_id && sender.couple_id === recipient.couple_id;
    if (!sameCouple || senderId === recipientId) {
      return json({ error: 'You can only notify your partner' }, 403);
    }
  }

  const prefs = (recipient.notification_prefs ?? null) as Prefs | null;

  // Muted category → nothing at all (owner rule: mute means mute).
  if (!isCategoryEnabled(prefs, category)) {
    return json({ delivered: false, reason: 'category_muted' });
  }

  // 1) Inbox row — always written for enabled categories.
  const { data: inserted, error: insertError } = await admin
    .from('notifications')
    .insert({
      recipient_id: recipientId,
      couple_id: recipient.couple_id,
      category,
      title,
      body: message,
      route,
    })
    .select('id')
    .single();
  if (insertError) {
    // Table missing (00027 not applied) → degrade with a clear reason.
    return json({ delivered: false, reason: 'inbox_unavailable' }, 200);
  }

  // 2) Quiet hours (recipient's couple timezone) suppress the PUSH only.
  let hourLocal = new Date().getUTCHours();
  if (recipient.couple_id) {
    const { data: couple } = await admin
      .from('couples')
      .select('timezone')
      .eq('id', recipient.couple_id)
      .maybeSingle();
    const tz = couple?.timezone || 'UTC';
    try {
      hourLocal = parseInt(
        new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          hour12: false,
          timeZone: tz,
        }).format(new Date()),
        10
      ) % 24;
    } catch {
      // bad tz string → UTC fallback already in hourLocal
    }
  }
  if (isInQuietHours(prefs, hourLocal)) {
    return json({ delivered: true, inboxId: inserted.id, push: false, reason: 'quiet_hours' });
  }

  // 3) OS push via Expo (no-op without a token — sims/Expo Go have none).
  if (!recipient.push_token) {
    return json({ delivered: true, inboxId: inserted.id, push: false, reason: 'no_token' });
  }

  // G2·M2 debounce: was a push already sent for this category recently?
  // (Column arrives with 00028 — a query error degrades to "not debounced".)
  try {
    const { data: lastPushed, error: debounceError } = await admin
      .from('notifications')
      .select('pushed_at')
      .eq('recipient_id', recipientId)
      .eq('category', category)
      .not('pushed_at', 'is', null)
      .order('pushed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!debounceError && shouldDebouncePush(category, lastPushed?.pushed_at)) {
      return json({ delivered: true, inboxId: inserted.id, push: false, reason: 'debounced' });
    }
  } catch {
    // 00028 not applied — send without debounce.
  }

  try {
    const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        to: recipient.push_token,
        title,
        body: message ?? undefined,
        sound: 'default',
        data: { route, category },
      }),
    });
    const result = await pushResponse.json().catch(() => null);
    const ticket = result?.data?.[0] ?? result?.data ?? null;

    // 4) Dead token → prune so we stop sending to it.
    if (ticket?.details?.error === 'DeviceNotRegistered') {
      await admin
        .from('profiles')
        .update({ push_token: null })
        .eq('id', recipientId);
      return json({ delivered: true, inboxId: inserted.id, push: false, reason: 'token_pruned' });
    }

    const pushed = ticket?.status === 'ok';
    if (pushed) {
      // Stamp for the debounce window (00028; ignore failure pre-migration).
      await admin
        .from('notifications')
        .update({ pushed_at: new Date().toISOString() })
        .eq('id', inserted.id);
    }
    return json({
      delivered: true,
      inboxId: inserted.id,
      push: pushed,
    });
  } catch {
    // Push infra hiccup — the inbox row already landed, so still a success.
    return json({ delivered: true, inboxId: inserted.id, push: false, reason: 'push_failed' });
  }
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
