import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import {
  buildExportDocument,
  type ExportOptions,
  type ExportDocument,
} from '@/features/journal/export';
import { renderExportHtml } from '@/features/journal/exportHtml';
import { track, ANALYTICS_EVENTS } from '@/services/analytics/events';

export interface ExportResult {
  uri: string;
  doc: ExportDocument;
}

/**
 * Build and share the journal PDF.
 *
 * Everything is fetched on demand rather than reusing the timeline query:
 * the export needs full bodies, prayer state and (optionally) boundaries,
 * none of which the timeline carries, and none of which should be pulled
 * into the persisted cache just to support a rare action.
 *
 * The boundaries query is only issued when the user has explicitly opted in
 * — the sensitive rows are never fetched "just in case".
 */
export function useExportJournal() {
  const coupleId = useCoupleStore((s) => s.coupleId);
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation<ExportResult, Error, { options: ExportOptions; coupleNames?: string | null }>({
    // This one owns its errors — the screen shows a specific message.
    meta: { suppressGlobalError: true },
    mutationFn: async ({ options, coupleNames }) => {
      if (!coupleId || !userId) throw new Error('No couple to export');

      const [memories, milestones, prayers, dates] = await Promise.all([
        supabase
          .from('memories')
          .select('id, title, description, memory_date, memory_images(image_url, position)')
          .eq('couple_id', coupleId),
        supabase
          .from('couple_milestones')
          .select('id, title, event_date, icon')
          .eq('couple_id', coupleId),
        supabase
          .from('prayers')
          .select('id, title, body, is_answered, answered_at, created_at, is_private, author_id')
          .eq('couple_id', coupleId),
        supabase
          .from('couple_dates')
          .select('id, completed_at, custom_title, notes, date_ideas(title)')
          .eq('couple_id', coupleId)
          .not('completed_at', 'is', null),
      ]);

      const boundaries = options.includeBoundaries
        ? await supabase
            .from('boundaries')
            .select('id, type, title, description, action_plan, author_id, created_at, is_active')
            .eq('couple_id', coupleId)
            // Author-only, at the query as well as in buildExportDocument.
            .eq('author_id', userId)
        : null;

      const firstError =
        memories.error ||
        milestones.error ||
        prayers.error ||
        dates.error ||
        boundaries?.error;
      if (firstError) throw firstError;

      const doc = buildExportDocument(
        {
          memories: memories.data ?? [],
          milestones: milestones.data ?? [],
          prayers: prayers.data ?? [],
          completedDates: (dates.data ?? []) as never,
          boundaries: boundaries?.data ?? [],
        },
        options,
        userId
      );

      const html = renderExportHtml(doc, {
        coupleNames,
        generatedAt: new Date().toISOString(),
      });

      // Lazy-required so the print module is only loaded when someone actually
      // exports — it is otherwise dead weight on every cold start.
      const Print = await import('expo-print');
      const { uri } = await Print.printToFileAsync({ html, base64: false });

      // Structural only: how much was exported and which optional sections
      // were included. Never a title, never a body.
      track(ANALYTICS_EVENTS.JOURNAL_EXPORTED, {
        count: doc.entries.length,
        result: 'success',
      });

      return { uri, doc };
    },
  });
}

/**
 * Hand the finished PDF to the OS share sheet.
 *
 * Sharing is a separate step from generating on purpose: the export screen
 * shows what the document contains BEFORE it leaves the app, which matters
 * most in the case this feature exists for — someone exporting boundaries or
 * a temptation plan.
 */
export async function shareExportedPdf(uri: string): Promise<boolean> {
  const Sharing = await import('expo-sharing');
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Your Bexhearts journal',
  });
  return true;
}
