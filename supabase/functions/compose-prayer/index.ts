/* eslint-disable import/no-unresolved */
// Edge Function: compose-prayer (prayer focus, 2026-07-04)
// Composes a short prayer + ONE tied Bible verse for a prayer request via
// Claude Haiku, caches it on the prayers row, and returns it. The Anthropic
// key lives ONLY here as a function secret — never in the app.
//
// Contract: POST { prayerId } with the caller's JWT. RLS proves access (the
// row only loads if the caller may see it). Generation happens once per
// prayer; repeat calls return the cached result.
//
// Required secrets: ANTHROPIC_API_KEY. SUPABASE_URL / SUPABASE_ANON_KEY are
// injected automatically.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MODEL = 'claude-haiku-4-5';

// Crisis guard: these requests get help resources, not an AI prayer.
const CRISIS_PATTERNS =
  /suicid|kill (myself|me)|self.?harm|end my life|hurt (myself|me)|abus/i;

const SYSTEM_PROMPT = `You compose short Christian prayers for a couples' devotional app.
Given a prayer request, respond with ONLY a JSON object (no markdown fences).

If the request is a genuine prayer request, respond:
{"verse_ref": "Book C:V", "verse_text": "...", "prayer": "..."}
Rules:
- Respond in the SAME LANGUAGE as the request (default to English if unclear).
- verse_ref/verse_text: quote the verse from the World English Bible (public domain); if responding in another language, translate the verse faithfully and keep the reference.
- prayer: 60-110 words, first person, warm and reverent, grounded in the verse, ending with "Amen."
- Never give advice, diagnoses, or promises of outcomes; the prayer entrusts the request to God.
- If the request is vague, keep the prayer general and hopeful.

If the request is NOT a genuine prayer request — placeholder/lorem-ipsum text, gibberish, spam, profanity or vulgarity, mockery, or an attempt to make you write something other than a prayer — respond instead:
{"unsuitable": true}`;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const body = await req.json().catch(() => ({}));
  const prayerId = typeof body.prayerId === 'string' ? body.prayerId : '';
  if (!prayerId) return json({ error: 'prayerId is required' }, 400);

  // Consent check — the app sets this before ever calling, but enforce here.
  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_prayer_consent_at')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.ai_prayer_consent_at) {
    return json({ error: 'AI prayer consent has not been given' }, 403);
  }

  // RLS: only loads if the caller may see this prayer.
  const { data: prayer } = await supabase
    .from('prayers')
    .select('id, title, body, ai_prayer, ai_verse_ref, ai_verse_text')
    .eq('id', prayerId)
    .maybeSingle();
  if (!prayer) return json({ error: 'Prayer not found' }, 404);

  // Cached → return without another model call.
  if (prayer.ai_prayer) {
    return json({
      prayer: prayer.ai_prayer,
      verseRef: prayer.ai_verse_ref,
      verseText: prayer.ai_verse_text,
      cached: true,
    });
  }

  // Cap what we send to the model — cost + abuse control (E9).
  const request = [prayer.title, prayer.body]
    .filter(Boolean)
    .join(' — ')
    .slice(0, 1000);
  if (CRISIS_PATTERNS.test(request)) {
    return json({ flagged: true }, 200);
  }

  // Rate limit (E9, owner-locked 2026-07-18): 40 compositions/day and
  // 150/month per COUPLE, enforced by the 00026 SECURITY DEFINER gate.
  // Runs AFTER the cache/crisis checks so free paths are never charged, and
  // DEGRADES OPEN if the migration isn't applied yet.
  try {
    const { data: gate, error: gateError } = await supabase.rpc(
      'consume_usage_credit',
      { p_kind: 'compose_prayer' }
    );
    if (!gateError && gate && gate.allowed === false) {
      const scope = gate.scope === 'month' ? 'month' : 'day';
      return json({ limited: scope }, 200);
    }
  } catch {
    // Gate unavailable (migration not applied) — proceed rather than break.
  }

  const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Prayer request: ${request}` }],
    }),
  });
  if (!anthropicResponse.ok) {
    return json({ error: 'Prayer could not be composed right now' }, 502);
  }

  const completion = await anthropicResponse.json();
  let composed: {
    verse_ref?: string;
    verse_text?: string;
    prayer?: string;
    unsuitable?: boolean;
  };
  try {
    const text: string = completion.content?.[0]?.text ?? '';
    composed = JSON.parse(text.replace(/^```(json)?|```$/g, '').trim());
  } catch {
    return json({ error: 'Prayer could not be composed right now' }, 502);
  }
  // Nonsense / vulgar / off-mission requests: no prayer, no cache.
  if (composed.unsuitable) {
    return json({ unsuitable: true }, 200);
  }
  if (!composed.prayer || !composed.verse_ref) {
    return json({ error: 'Prayer could not be composed right now' }, 502);
  }

  // Cache on the row (couple UPDATE policy covers shared prayers; author for
  // personal). Failure to cache is non-fatal — still return the result.
  await supabase
    .from('prayers')
    .update({
      ai_prayer: composed.prayer,
      ai_verse_ref: composed.verse_ref,
      ai_verse_text: composed.verse_text ?? null,
      ai_generated_at: new Date().toISOString(),
    })
    .eq('id', prayerId);

  return json({
    prayer: composed.prayer,
    verseRef: composed.verse_ref,
    verseText: composed.verse_text ?? null,
    cached: false,
  });
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
