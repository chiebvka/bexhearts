import { useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '@/components/ui';
import { useIdeaCountryStats } from '@/api/dates';
import {
  ideaCountries,
  countryRatingLabel,
  isGlobal,
  GLOBAL_TAG,
  type Country,
} from '../countries';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

interface CountryChipsProps {
  dateIdeaId: string;
  countryTags: string[] | null | undefined;
  contextNote: string | null | undefined;
}

// E13 — the origin tags on an idea. React Native has no hover, so the
// "tooltip" is a tap: the chip opens a sheet with what the idea is, where it
// comes from, how couples THERE rated it, and a way to see more from there.
export function CountryChips({ dateIdeaId, countryTags, contextNote }: CountryChipsProps) {
  const [open, setOpen] = useState<Country | null>(null);
  const countries = ideaCountries(countryTags);
  const { data: stats } = useIdeaCountryStats(open ? dateIdeaId : undefined);

  const global = isGlobal(countryTags);

  return (
    <>
      <View style={styles.row}>
        {countries.map((country) => (
          <Pressable
            key={country.code}
            onPress={() => setOpen(country)}
            accessibilityRole="button"
            accessibilityLabel={`About ${country.name}`}
            style={styles.chip}
          >
            <Text variant="labelSmall" color={colors.text.link}>
              {country.flag} {country.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Modal
        visible={!!open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(null)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text variant="headlineSmall" style={styles.sheetTitle}>
              {open?.flag} {open?.name}
            </Text>

            <Text variant="bodyMedium" color={colors.text.secondary} style={styles.note}>
              {contextNote ??
                (global
                  ? 'This one needs nothing special — it works wherever you are.'
                  : `A date couples in ${open?.name} know well.`)}
            </Text>

            {open && open.code !== GLOBAL_TAG.code ? (
              <Text variant="labelMedium" color={colors.text.tertiary} style={styles.rating}>
                {countryRatingLabel(
                  stats?.find((s) => s.country_code === open.code),
                  open.name
                )}
              </Text>
            ) : null}

            {open && open.code !== GLOBAL_TAG.code ? (
              <Button
                title={`See more ideas from ${open.name}`}
                variant="outline"
                fullWidth
                onPress={() => {
                  const code = open.code;
                  setOpen(null);
                  router.push(`/dates?country=${code}`);
                }}
                style={styles.action}
              />
            ) : null}

            <Button
              title="Close"
              variant="ghost"
              fullWidth
              onPress={() => setOpen(null)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = themedStyles(() => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  sheetTitle: {
    marginBottom: spacing.xs,
  },
  note: {
    marginBottom: spacing.xs,
  },
  rating: {
    marginBottom: spacing.md,
  },
  action: {
    marginBottom: spacing.xs,
  },
}));
