import { View, Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '@/components/ui';
import { SignOutLink } from '@/features/auth';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

// Owner-picked welcome redesign (2026-07-12): B+C+D hybrid — fanned polaroids
// (the Journal identity), the Ecclesiastes 4:12 anchor, and the points chip.
// PHOTOS: drop two licensed couple photos into assets/ and require() them here
// (owner has the rights sorted); until then the tinted placeholders render.
const PHOTOS: (ImageSourcePropType | null)[] = [null, null];

const PILLS = ['📖 Daily devotionals', '🙏 Pray together', '🔥 One shared streak'];

function Polaroid({
  source,
  rotate,
  tint,
  emoji,
}: {
  source: ImageSourcePropType | null;
  rotate: string;
  tint: string;
  emoji: string;
}) {
  return (
    <View style={[styles.polaroid, { transform: [{ rotate }] }]}>
      {source ? (
        <Image source={source} style={styles.polaroidPhoto} resizeMode="cover" />
      ) : (
        <View style={[styles.polaroidPhoto, { backgroundColor: tint }]}>
          <Text style={styles.polaroidEmoji}>{emoji}</Text>
        </View>
      )}
    </View>
  );
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <Text variant="headlineSmall" style={styles.wordmark}>
        Bexhearts
      </Text>

      <View style={styles.content}>
        <View style={styles.collage}>
          <Polaroid source={PHOTOS[0]} rotate="-7deg" tint={colors.primary[100]} emoji="💜" />
          <Polaroid source={PHOTOS[1]} rotate="6deg" tint={colors.secondary[100]} emoji="🤍" />
        </View>

        <View style={styles.pillRow}>
          {PILLS.map((pill) => (
            <View key={pill} style={styles.pill}>
              <Text variant="labelSmall" color={colors.text.secondary} style={styles.pillText}>
                {pill}
              </Text>
            </View>
          ))}
        </View>

        <Text variant="displayMedium" style={styles.verse}>
          “A cord of three strands is not quickly broken.”
        </Text>
        <Text variant="labelMedium" color={colors.primary[500]} style={styles.verseRef}>
          ECCLESIASTES 4:12
        </Text>
        <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subline}>
          You, your person, and God — woven together daily.
        </Text>

        <View style={styles.pointsChip}>
          <Text variant="labelSmall" color={colors.primary[600]} style={styles.pointsChipText}>
            ✨ Earn your first 10 points together today
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          title="Get Started"
          onPress={() => router.push('/(onboarding)/profile-setup')}
          fullWidth
        />
        <SignOutLink />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  wordmark: {
    textAlign: 'center',
    color: colors.primary[500],
    fontFamily: fonts.serif.bold,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  collage: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  polaroid: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral[300],
    padding: 8,
    paddingBottom: 26,
    marginHorizontal: -10,
  },
  polaroidPhoto: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  polaroidEmoji: {
    fontSize: 40,
    lineHeight: 52,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  pill: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral[300],
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    lineHeight: 16,
  },
  verse: {
    textAlign: 'center',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  verseRef: {
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  subline: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  pointsChip: {
    alignSelf: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pointsChipText: {
    lineHeight: 16,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
