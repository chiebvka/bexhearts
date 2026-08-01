// The printable document. Kept separate from `export.ts` so the inclusion
// rules can be tested without dragging a page of CSS through every assertion.
//
// Print-first, not screen-first: cream/ink on white, serif headings matching
// the app's identity, page breaks that never orphan a photo from its entry.

import type { ExportDocument, ExportEntryKind } from './export';

/**
 * Escape user content before it becomes markup.
 *
 * This is the security boundary of the whole feature. Journal entries, prayer
 * titles and photo URLs are user-authored text going into an HTML document
 * that a WebView then renders — the exact shape of an injection bug. A memory
 * titled `<script>…` or a description containing `</div>` must print as those
 * characters, not execute or break the layout.
 */
export function escapeHtml(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Preserve the line breaks someone typed, after escaping. */
function paragraphs(value: string | null | undefined): string {
  const escaped = escapeHtml(value);
  if (!escaped.trim()) return '';
  return escaped
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

/**
 * Only http(s) images are embedded. A `javascript:` or `data:` URL in an
 * image slot has no legitimate reason to exist here, and this is the one
 * place a stored URL gets executed by a renderer.
 */
export function isSafeImageUrl(url: string): boolean {
  return /^https:\/\//i.test(url) || /^http:\/\//i.test(url);
}

const KIND_LABEL: Record<ExportEntryKind, string> = {
  memory: 'Moment',
  milestone: 'Milestone',
  date: 'Date',
  prayer_answered: 'Answered prayer',
  prayer_active: 'Prayer request',
};

function formatDate(ymd: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return '';
  // Parsed as UTC deliberately: these are date-only values, and letting the
  // device timezone shift them would print the day before someone's memory.
  const date = new Date(`${ymd}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

const STYLES = `
  @page { margin: 44px 40px; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
    color: #141517;
    background: #ffffff;
    font-size: 12px;
    line-height: 1.55;
    margin: 0;
  }
  h1, h2, h3 { font-family: Georgia, 'Times New Roman', serif; margin: 0; }
  .cover { padding: 120px 0 0; text-align: center; page-break-after: always; }
  .cover h1 { font-size: 34px; color: #9747FF; margin-bottom: 10px; }
  .cover .names { font-size: 16px; margin-bottom: 4px; }
  .cover .range { font-size: 12px; color: #6b6b70; margin-bottom: 32px; }
  .summary { display: inline-block; text-align: left; border-top: 1px solid #DAD7D0;
             border-bottom: 1px solid #DAD7D0; padding: 14px 20px; }
  .summary div { font-size: 11px; color: #4a4a50; }
  .cover .footnote { margin-top: 36px; font-size: 10px; color: #8b8b90; }
  .entry { page-break-inside: avoid; margin-bottom: 22px; padding-bottom: 16px;
           border-bottom: 1px solid #eceae6; }
  .entry .meta { font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase;
                 color: #9747FF; margin-bottom: 3px; }
  .entry h3 { font-size: 16px; margin-bottom: 5px; }
  .entry p { margin: 0 0 7px; }
  .photos { margin-top: 9px; }
  .photos img { max-width: 47%; max-height: 300px; margin: 0 6px 6px 0;
                border: 1px solid #DAD7D0; padding: 4px; background: #fff; }
  .section-title { font-size: 20px; color: #9747FF; margin: 0 0 6px; }
  .appendix { page-break-before: always; }
  .notice { background: #F8F4EC; border-left: 3px solid #9747FF; padding: 11px 14px;
            font-size: 11px; margin-bottom: 20px; }
  .empty { color: #6b6b70; font-style: italic; }
`;

export interface ExportMeta {
  /** e.g. "AJ & Bexoni" — falls back gracefully when a name is missing. */
  coupleNames?: string | null;
  /** ISO string for the "generated on" line. */
  generatedAt?: string;
}

export function renderExportHtml(doc: ExportDocument, meta: ExportMeta = {}): string {
  const { counts, range } = doc;
  const names = escapeHtml(meta.coupleNames?.trim() || 'Our story');
  const generated = meta.generatedAt ? new Date(meta.generatedAt) : new Date();

  const summaryRows = [
    counts.memories ? `${counts.memories} moment${counts.memories === 1 ? '' : 's'}` : null,
    counts.photos ? `${counts.photos} photo${counts.photos === 1 ? '' : 's'}` : null,
    counts.milestones
      ? `${counts.milestones} milestone${counts.milestones === 1 ? '' : 's'}`
      : null,
    counts.dates ? `${counts.dates} date${counts.dates === 1 ? '' : 's'}` : null,
    counts.answeredPrayers ? `${counts.answeredPrayers} answered prayer${counts.answeredPrayers === 1 ? '' : 's'}` : null,
    counts.activePrayers ? `${counts.activePrayers} prayer request${counts.activePrayers === 1 ? '' : 's'}` : null,
  ].filter(Boolean) as string[];

  const cover = `
    <div class="cover">
      <h1>Bexhearts</h1>
      <div class="names">${names}</div>
      ${
        range
          ? `<div class="range">${escapeHtml(formatDate(range.from))} — ${escapeHtml(
              formatDate(range.to)
            )}</div>`
          : '<div class="range">Your story is just beginning</div>'
      }
      ${
        summaryRows.length
          ? `<div class="summary">${summaryRows
              .map((row) => `<div>${escapeHtml(row)}</div>`)
              .join('')}</div>`
          : ''
      }
      <div class="footnote">Exported ${escapeHtml(
        generated.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      )} · This copy is yours to keep.</div>
    </div>
  `;

  const entriesHtml = doc.entries.length
    ? doc.entries
        .map((entry) => {
          const photos = entry.imageUrls.filter(isSafeImageUrl);
          return `
            <div class="entry">
              <div class="meta">${escapeHtml(KIND_LABEL[entry.kind])}${
                formatDate(entry.date) ? ` · ${escapeHtml(formatDate(entry.date))}` : ''
              }</div>
              <h3>${escapeHtml(entry.title)}</h3>
              ${paragraphs(entry.body)}
              ${
                photos.length
                  ? `<div class="photos">${photos
                      .map((url) => `<img src="${escapeHtml(url)}" />`)
                      .join('')}</div>`
                  : ''
              }
            </div>
          `;
        })
        .join('')
    : '<p class="empty">No entries yet — every story starts somewhere.</p>';

  // The appendix is a separate, explicitly-labelled section rather than part
  // of the story, so a boundary or temptation plan can never be mistaken for
  // a memory by someone skimming the PDF.
  const appendix = doc.boundaries.length
    ? `
      <div class="appendix">
        <h2 class="section-title">Private appendix</h2>
        <div class="notice">
          You chose to include your boundaries and temptation plans. These are
          yours alone — only entries you wrote appear here. Treat this document
          accordingly.
        </div>
        ${doc.boundaries
          .map(
            (b) => `
              <div class="entry">
                <div class="meta">${
                  b.kind === 'temptation' ? 'Temptation plan' : 'Boundary'
                }${formatDate(b.date) ? ` · ${escapeHtml(formatDate(b.date))}` : ''}</div>
                <h3>${escapeHtml(b.title)}</h3>
                ${paragraphs(b.body)}
                ${b.actionPlan ? `<p><strong>Plan:</strong> ${escapeHtml(b.actionPlan)}</p>` : ''}
              </div>
            `
          )
          .join('')}
      </div>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>Bexhearts — ${names}</title><style>${STYLES}</style></head>
<body>
  ${cover}
  <h2 class="section-title">Our story</h2>
  ${entriesHtml}
  ${appendix}
</body>
</html>`;
}
