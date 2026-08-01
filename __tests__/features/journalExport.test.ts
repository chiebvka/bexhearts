import {
  buildExportDocument,
  DEFAULT_EXPORT_OPTIONS,
  type ExportOptions,
  type ExportSources,
} from '@/features/journal/export';
import { renderExportHtml, escapeHtml, isSafeImageUrl } from '@/features/journal/exportHtml';

const ME = 'user-me';
const PARTNER = 'user-partner';

const sources: ExportSources = {
  memories: [
    {
      id: 'm1',
      title: 'Beach day',
      description: 'We drove out at sunrise.',
      memory_date: '2026-05-02',
      memory_images: [
        { image_url: 'https://cdn.example.com/b.jpg', position: 2 },
        { image_url: 'https://cdn.example.com/a.jpg', position: 1 },
      ],
    },
  ],
  milestones: [{ id: 'ms1', title: 'Engaged', event_date: '2026-03-14', icon: '💍' }],
  prayers: [
    {
      id: 'p1',
      title: 'Grandma’s surgery',
      body: 'It went well.',
      is_answered: true,
      answered_at: '2026-04-10T10:00:00Z',
      created_at: '2026-04-01T10:00:00Z',
    },
    {
      id: 'p2',
      title: 'The job search',
      body: 'Still waiting.',
      is_answered: false,
      created_at: '2026-06-01T10:00:00Z',
    },
    {
      id: 'p3',
      title: 'Something I only told God',
      is_answered: false,
      is_private: true,
      author_id: PARTNER,
      created_at: '2026-06-02T10:00:00Z',
    },
  ],
  completedDates: [
    {
      id: 'd1',
      completed_at: '2026-02-01T18:00:00Z',
      custom_title: 'Tacos and a walk',
      notes: 'Talked for hours.',
    },
  ],
  boundaries: [
    {
      id: 'b1',
      type: 'temptation',
      title: 'Late-night scrolling',
      description: 'It pulls me somewhere I do not want to go.',
      action_plan: 'Phone charges in the kitchen.',
      author_id: ME,
      created_at: '2026-01-05T10:00:00Z',
    },
    {
      id: 'b2',
      type: 'boundary',
      title: 'My partner’s private covenant',
      author_id: PARTNER,
      created_at: '2026-01-06T10:00:00Z',
    },
  ],
};

const withOptions = (o: Partial<ExportOptions> = {}): ExportOptions => ({
  ...DEFAULT_EXPORT_OPTIONS,
  ...o,
});

describe('journal export — what goes in', () => {
  it('always includes moments, milestones, dates and answered prayers', () => {
    const doc = buildExportDocument(sources, withOptions(), ME);
    const kinds = doc.entries.map((e) => e.kind);

    expect(kinds).toContain('memory');
    expect(kinds).toContain('milestone');
    expect(kinds).toContain('date');
    expect(kinds).toContain('prayer_answered');
  });

  it('EXCLUDES active prayers by default', () => {
    const doc = buildExportDocument(sources, withOptions(), ME);
    expect(doc.entries.map((e) => e.kind)).not.toContain('prayer_active');
    expect(doc.counts.activePrayers).toBe(0);
  });

  it('includes active prayers only when opted in', () => {
    const doc = buildExportDocument(sources, withOptions({ includeActivePrayers: true }), ME);
    expect(doc.counts.activePrayers).toBe(1); // p2 only — p3 is the partner's private one
    expect(doc.entries.some((e) => e.title === 'The job search')).toBe(true);
  });

  it('EXCLUDES boundaries and temptation plans by default', () => {
    const doc = buildExportDocument(sources, withOptions(), ME);
    expect(doc.boundaries).toEqual([]);
    expect(doc.counts.boundaries).toBe(0);
  });

  it('includes boundaries only when opted in, and keeps them out of the story', () => {
    const doc = buildExportDocument(sources, withOptions({ includeBoundaries: true }), ME);
    expect(doc.counts.boundaries).toBe(1);
    // The appendix is separate on purpose — a temptation plan must never be
    // mistaken for a memory by someone skimming the PDF.
    expect(doc.entries.some((e) => e.title === 'Late-night scrolling')).toBe(false);
  });
});

describe('journal export — who can export what', () => {
  it('never exports the PARTNER’s boundaries, even when opted in', () => {
    const doc = buildExportDocument(sources, withOptions({ includeBoundaries: true }), ME);
    const titles = doc.boundaries.map((b) => b.title);

    expect(titles).toContain('Late-night scrolling');
    expect(titles).not.toContain('My partner’s private covenant');
  });

  it('gives the other partner their OWN boundaries, not mine', () => {
    const doc = buildExportDocument(sources, withOptions({ includeBoundaries: true }), PARTNER);
    expect(doc.boundaries.map((b) => b.title)).toEqual(['My partner’s private covenant']);
  });

  it('never exports the partner’s PERSONAL prayer', () => {
    const doc = buildExportDocument(sources, withOptions({ includeActivePrayers: true }), ME);
    expect(doc.entries.some((e) => e.title === 'Something I only told God')).toBe(false);
  });

  it('exports shared content for EITHER partner — it belongs to both', () => {
    const mine = buildExportDocument(sources, withOptions(), ME);
    const theirs = buildExportDocument(sources, withOptions(), PARTNER);

    expect(theirs.counts.memories).toBe(mine.counts.memories);
    expect(theirs.counts.milestones).toBe(mine.counts.milestones);
    expect(theirs.counts.answeredPrayers).toBe(mine.counts.answeredPrayers);
  });
});

describe('journal export — the document', () => {
  it('is chronological, oldest first, so it reads as a story', () => {
    const doc = buildExportDocument(sources, withOptions(), ME);
    const dates = doc.entries.map((e) => e.date);
    expect([...dates].sort()).toEqual(dates);
    expect(dates[0]).toBe('2026-02-01');
  });

  it('orders a moment’s photos by position and counts them', () => {
    const doc = buildExportDocument(sources, withOptions(), ME);
    const memory = doc.entries.find((e) => e.kind === 'memory')!;
    expect(memory.imageUrls).toEqual([
      'https://cdn.example.com/a.jpg',
      'https://cdn.example.com/b.jpg',
    ]);
    expect(doc.counts.photos).toBe(2);
  });

  it('reports the date range for the cover page', () => {
    const doc = buildExportDocument(sources, withOptions(), ME);
    expect(doc.range).toEqual({ from: '2026-02-01', to: '2026-05-02' });
  });

  it('handles a couple with nothing yet', () => {
    const doc = buildExportDocument({}, withOptions(), ME);
    expect(doc.entries).toEqual([]);
    expect(doc.range).toBeNull();
    expect(() => renderExportHtml(doc)).not.toThrow();
    expect(renderExportHtml(doc)).toContain('Your story is just beginning');
  });

  it('sinks undated entries to the end rather than corrupting the order', () => {
    const doc = buildExportDocument(
      {
        ...sources,
        completedDates: [
          ...(sources.completedDates ?? []),
          { id: 'x', completed_at: null, custom_title: 'Undated' },
        ],
      },
      withOptions(),
      ME
    );
    expect(doc.entries[doc.entries.length - 1].title).toBe('Undated');
  });
});

describe('journal export — HTML safety', () => {
  it('escapes user content instead of rendering it as markup', () => {
    // The whole feature funnels user-authored text into a WebView. A memory
    // titled with a script tag must print as characters.
    const doc = buildExportDocument(
      {
        memories: [
          {
            id: 'evil',
            title: '<script>alert(1)</script>',
            description: 'She said "hello" & <b>left</b>',
            memory_date: '2026-01-01',
          },
        ],
      },
      withOptions(),
      ME
    );
    const html = renderExportHtml(doc);

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
    expect(html).not.toContain('<b>left</b>');
  });

  it('escapes the couple names on the cover', () => {
    const html = renderExportHtml(buildExportDocument({}, withOptions(), ME), {
      coupleNames: '<img onerror=x>',
    });
    expect(html).not.toContain('<img onerror=x>');
    expect(html).toContain('&lt;img');
  });

  it('embeds only http(s) images', () => {
    expect(isSafeImageUrl('https://cdn.example.com/a.jpg')).toBe(true);
    expect(isSafeImageUrl('http://cdn.example.com/a.jpg')).toBe(true);
    expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeImageUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
    expect(isSafeImageUrl('file:///etc/passwd')).toBe(false);
  });

  it('drops an unsafe image URL from the rendered document', () => {
    const doc = buildExportDocument(
      {
        memories: [
          {
            id: 'm',
            title: 'Trip',
            memory_date: '2026-01-01',
            memory_images: [{ image_url: 'javascript:alert(1)', position: 1 }],
          },
        ],
      },
      withOptions(),
      ME
    );
    expect(renderExportHtml(doc)).not.toContain('javascript:alert(1)');
  });

  it('escapes each of the five HTML-significant characters', () => {
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;');
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('prints the memory’s own date, not the day before in another timezone', () => {
    // Date-only values parsed in local time can slip backwards a day west of
    // UTC — someone's anniversary printing as the 1st is not acceptable.
    const doc = buildExportDocument(
      { memories: [{ id: 'm', title: 'Anniversary', memory_date: '2026-05-02' }] },
      withOptions(),
      ME
    );
    expect(renderExportHtml(doc)).toContain('May 2, 2026');
  });

  it('labels the appendix so boundaries can’t be mistaken for memories', () => {
    const doc = buildExportDocument(sources, withOptions({ includeBoundaries: true }), ME);
    const html = renderExportHtml(doc);
    expect(html).toContain('Private appendix');
    expect(html).toContain('Temptation plan');
  });
});
