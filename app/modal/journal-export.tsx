import { useState } from 'react';
import { View, Switch, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card, Button, ModalHeader } from '@/components/ui';
import { useUIStore } from '@/stores/ui.store';
import { useMyProfile } from '@/api/profiles';
import { usePartnerProfile } from '@/api/couples';
import { useExportJournal, shareExportedPdf } from '@/api/journalExport';
import { DEFAULT_EXPORT_OPTIONS, type ExportOptions } from '@/features/journal/export';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

// Journal PDF export.
//
// The screen's real job is INFORMED CONSENT, not configuration. Two toggles
// and a confirmation is the whole UI, because the risk here isn't complexity
// — it's someone exporting their temptation plans without noticing, then
// sharing the file with a family group chat.
export default function JournalExportModal() {
  const insets = useSafeAreaInsets();
  const showToast = useUIStore((s) => s.showToast);
  const { data: profile } = useMyProfile();
  const { data: partner } = usePartnerProfile();
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const exportJournal = useExportJournal();

  const coupleNames = [profile?.full_name?.split(' ')[0], partner?.full_name?.split(' ')[0]]
    .filter(Boolean)
    .join(' & ');

  // Turning boundaries ON asks; turning them OFF never does. A confirmation on
  // the safe direction is just noise that teaches people to tap through.
  const toggleBoundaries = (next: boolean) => {
    if (!next) {
      setOptions((o) => ({ ...o, includeBoundaries: false }));
      return;
    }
    Alert.alert(
      'Include your boundaries?',
      'Your boundaries and temptation plans are the most private things you keep here. ' +
        'Only the ones you wrote will be included, in a clearly marked section at the end. ' +
        'Once the PDF leaves the app, anyone who opens it can read them.',
      [
        { text: 'Leave them out', style: 'cancel' },
        {
          text: 'Include them',
          style: 'destructive',
          onPress: () => setOptions((o) => ({ ...o, includeBoundaries: true })),
        },
      ]
    );
  };

  const onExport = async () => {
    try {
      const { uri, doc } = await exportJournal.mutateAsync({ options, coupleNames });
      const shared = await shareExportedPdf(uri);
      if (!shared) {
        showToast('Your PDF is ready, but sharing isn’t available here.', 'info');
        return;
      }
      showToast(
        doc.entries.length
          ? `Exported ${doc.entries.length} ${doc.entries.length === 1 ? 'entry' : 'entries'}.`
          : 'Exported — your story is just beginning.',
        'success'
      );
    } catch {
      showToast('We couldn’t build your PDF. Try again in a moment.', 'error');
    }
  };

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <ModalHeader title="Export your journal" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.intro}>
          A PDF of your story in order — moments and their photos, milestones,
          dates you finished, and prayers that were answered. It’s yours to keep,
          print, or hold on to.
        </Text>

        <Card variant="outlined" padding="md" style={styles.card}>
          <Text variant="labelLarge" style={styles.cardTitle}>
            Always included
          </Text>
          {['Moments and their photos', 'Milestones', 'Completed dates', 'Answered prayers'].map(
            (item) => (
              <Text key={item} variant="bodySmall" color={colors.text.secondary}>
                • {item}
              </Text>
            )
          )}
        </Card>

        <Card variant="outlined" padding="md" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="labelLarge">Prayers you’re still praying</Text>
              <Text variant="bodySmall" color={colors.text.secondary}>
                Requests that haven’t been answered yet.
              </Text>
            </View>
            <Switch
              value={options.includeActivePrayers}
              onValueChange={(v) => setOptions((o) => ({ ...o, includeActivePrayers: v }))}
              trackColor={{ true: colors.primary[400], false: colors.neutral[300] }}
              accessibilityLabel="Include prayers you're still praying"
            />
          </View>

          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowText}>
              <Text variant="labelLarge">Boundaries & temptation plans</Text>
              <Text variant="bodySmall" color={colors.text.secondary}>
                Off by default. Only entries you wrote — never your partner’s.
              </Text>
            </View>
            <Switch
              value={options.includeBoundaries}
              onValueChange={toggleBoundaries}
              trackColor={{ true: colors.primary[400], false: colors.neutral[300] }}
              accessibilityLabel="Include boundaries and temptation plans"
            />
          </View>
        </Card>

        <Button
          title="Create my PDF"
          onPress={onExport}
          loading={exportJournal.isPending}
          fullWidth
        />
        <Text variant="labelSmall" color={colors.text.tertiary} style={styles.footnote}>
          Built on your device and shared straight from here — nothing is uploaded
          anywhere to make it.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  intro: {
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
    gap: 2,
  },
  cardTitle: {
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  footnote: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
}));
