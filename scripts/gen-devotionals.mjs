// Bexhearts devotional draft generator — the monthly content-cadence tool.
// (Promoted into the repo 2026-07-10 after being recreated from the HANDOFF
// spec twice; session scratchpads don't survive.)
//
// What it does: batches themed prompts to the Anthropic API (Sonnet) and
// writes drafts.json next to this file, checkpointing after every batch so a
// failed batch can resume. Titles already in the pool are extracted from the
// seed migrations automatically and passed as an anti-duplicate rule.
//
// Usage (from the repo root):
//   node scripts/gen-devotionals.mjs
// Then validate + convert drafts.json into the next numbered
// supabase/migrations/000NN_devotional_drafts_seed_N.sql (see 00021/00024 for
// the format: INSERT INTO devotional_drafts, approved = false, '' escaping).
// The owner reviews in Studio → approved = true → promote_approved_devotionals().
//
// Edit BATCHES each run: ~30/month, themes rotated into untouched corners.
// Seasonal overrides (Advent, Lent, Valentine's) are generated the same way
// but promoted with a publish_date instead of a sequence.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const out = join(here, 'drafts.json');

const envFile = readFileSync(join(root, 'supabase/functions/.env'), 'utf8');
const API_KEY = envFile.match(/^ANTHROPIC_API_KEY=(.+)$/m)?.[1]?.trim();
if (!API_KEY) throw new Error('ANTHROPIC_API_KEY not found in supabase/functions/.env');

const MODEL = 'claude-sonnet-5';
const CATEGORIES = ['communication','growth','forgiveness','trust','service','faith','love','patience','prayer','purity'];
const FOCUS = ['prayer','communication','intimacy','spiritual_growth','conflict','quality_time'];

// Every title already drafted, across all seed migrations.
const migDir = join(root, 'supabase/migrations');
const EXISTING_TITLES = readdirSync(migDir)
  .filter((f) => /devotional_drafts_seed/.test(f))
  .flatMap((f) => {
    const src = readFileSync(join(migDir, f), 'utf8');
    return [...src.matchAll(/\n\('((?:[^']|'')+)',/g)].map((m) => m[1].replaceAll("''", "'"));
  });

// EDIT EACH RUN: themes for this batch (aim ~30/month; 5 per theme works well).
const BATCHES = [
  // { theme: 'describe the corner of couple life this batch covers', n: 5 },
];

const SYSTEM = `You write daily devotionals for Bexhearts, an app for Christian couples (dating, engaged, or married). Voice: warm, couple-focused, practical, non-denominational — encouragement, never doctrine-policing or shame. Scripture quotations MUST be from the World English Bible (WEB, public domain), quoted accurately.

Return ONLY a JSON array. Each element:
{
  "title": "3-7 word evocative title",
  "scripture_reference": "Book C:V (or C:V-V)",
  "scripture_text": "the exact WEB text of that reference",
  "reflection": "280-380 words, written to the couple ('you two', 'both of you'), concrete and honest, ending with gentle conviction — never saccharine",
  "couple_action": "one specific thing to do together today, 1-2 sentences, doable in under 15 minutes",
  "category": "one of: ${CATEGORIES.join(', ')}",
  "focus_tags": ["1-2 of: ${FOCUS.join(', ')}"]
}

Rules: valid JSON only — inside string values NEVER use straight double-quote characters; use curly quotes (“ ”) or rephrase. Every devotional must use a DIFFERENT scripture reference; titles must be unique and must NOT duplicate or closely paraphrase any of these existing titles:
${EXISTING_TITLES.join('; ')}`;

async function generate(theme, n) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Write ${n} devotionals on this theme: ${theme}. JSON array only.` }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content.map((b) => b.text ?? '').join('');
  return JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
}

if (!BATCHES.length) {
  console.log('Edit BATCHES in this file first — add the themes for this run.');
  process.exit(1);
}
const all = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : [];
const doneThemes = new Set(all.map((d) => d._theme));
for (const { theme, n } of BATCHES) {
  if (doneThemes.has(theme)) { console.log('skip (done):', theme.slice(0, 40)); continue; }
  console.log('generating:', theme.slice(0, 60), '…');
  let batch;
  try {
    batch = await generate(theme, n);
  } catch (e) {
    console.log('  parse/API failure, retrying once:', e.message.slice(0, 80));
    batch = await generate(theme, n);
  }
  for (const d of batch) d._theme = theme;
  all.push(...batch);
  writeFileSync(out, JSON.stringify(all, null, 2));
  console.log(`  +${batch.length} (total ${all.length})`);
}
console.log('DONE:', all.length, 'drafts in', out);
