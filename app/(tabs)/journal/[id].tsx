import { useEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator, Keyboard } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BackButton, Text, EmptyState } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { FannedPolaroids, PhotoViewer, sortImageUrls } from '@/features/journal';
import { useMemory, useReactToMemory, useAddMemoryImages } from '@/api/journal';
import { useAuthStore } from '@/stores/auth.store';
import { usePendingUploads } from '@/stores/uploads.store';
import { pendingUploadLabel } from '@/features/uploads/outbox';
import { useUIStore } from '@/stores/ui.store';
import { pickImages } from '@/lib/imagePicker';
import { formatDate } from '@/lib/dates';
import { selectionHaptic, successHaptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

const REACTIONS = [
  { key: 'heart', icon: 'heart' as const },
  { key: 'pray', icon: 'hand-left' as const },
];

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: memory, isLoading } = useMemory(id);
  const react = useReactToMemory(id);
  const addImages = useAddMemoryImages();
  const showToast = useUIStore((s) => s.showToast);
  const pendingUploads = usePendingUploads(id);
  const [note, setNote] = useState('');
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // Prefill with the note you already left so editing is obvious.
  const myNote = memory?.memory_reactions.find((r) => r.user_id === userId)?.note;
  useEffect(() => {
    if (myNote) setNote(myNote);
  }, [myNote]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }
  if (!memory) return <EmptyState title="Memory not found" />;

  const mine = memory.memory_reactions.find((r) => r.user_id === userId);
  const partnerReactions = memory.memory_reactions.filter((r) => r.user_id !== userId);
  const imageUrls = sortImageUrls(memory.memory_images);

  const toggleReaction = (key: string) => {
    selectionHaptic();
    react.mutate({ reaction: mine?.reaction === key ? null : key, note: mine?.note ?? null });
  };

  const handleAddPhotos = async () => {
    const picked = await pickImages().catch(() => []);
    if (picked.length) {
      addImages.mutate(
        {
          memoryId: memory.id,
          images: picked,
          startPosition: memory.memory_images.length,
        },
        {
          // H2·M2 — photos are queued into the outbox and upload in the
          // background (retried on bad networks), so "added" lands instantly.
          onSuccess: () => {
            successHaptic();
            showToast(
              picked.length > 1 ? 'Photos saving 📷' : 'Photo saving 📷',
              'success'
            );
          },
          onError: () => showToast("Couldn't queue the photos — try again.", 'error'),
        }
      );
    }
  };

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <BackButton />

      <Text variant="displayMedium" style={styles.title}>
        {memory.title}
      </Text>
      <Text variant="labelMedium" color={colors.text.tertiary} style={styles.date}>
        {formatDate(memory.memory_date)}
      </Text>

      <View style={styles.photosRow}>
        {imageUrls.length > 0 && (
          <FannedPolaroids imageUrls={imageUrls} onPress={(i) => setViewerIndex(i)} />
        )}
        <Pressable
          onPress={handleAddPhotos}
          style={styles.addPhotos}
          hitSlop={6}
          accessibilityLabel="Add photos"
        >
          {addImages.isPending ? (
            <ActivityIndicator size="small" color={colors.primary[500]} />
          ) : (
            <Ionicons name="images-outline" size={20} color={colors.primary[500]} />
          )}
        </Pressable>
      </View>

      {pendingUploadLabel(pendingUploads, pendingUploads + imageUrls.length) ? (
        <Text variant="labelSmall" color={colors.text.tertiary} style={styles.pendingLabel}>
          {pendingUploadLabel(pendingUploads, pendingUploads + imageUrls.length)}
        </Text>
      ) : null}

      {viewerIndex !== null && (
        <PhotoViewer
          imageUrls={imageUrls}
          initialIndex={viewerIndex}
          visible
          onClose={() => setViewerIndex(null)}
        />
      )}

      {memory.description ? (
        <Text variant="bodyLarge" color={colors.text.secondary} style={styles.body}>
          {memory.description}
        </Text>
      ) : null}

      <View style={styles.reactions}>
        {REACTIONS.map((r) => {
          const active = mine?.reaction === r.key;
          return (
            <Pressable
              key={r.key}
              onPress={() => toggleReaction(r.key)}
              style={[styles.reaction, active && styles.reactionActive]}
              hitSlop={6}
            >
              <Ionicons
                name={r.icon}
                size={20}
                color={active ? colors.primary[500] : colors.text.tertiary}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.noteRow}>
        <Input
          label="Leave a note"
          placeholder="This was the best day…"
          value={note}
          onChangeText={setNote}
          containerStyle={styles.noteField}
        />
        <Pressable
          onPress={() => {
            if (!note.trim()) return;
            Keyboard.dismiss();
            react.mutate(
              { reaction: mine?.reaction ?? null, note: note.trim() },
              {
                onSuccess: () => {
                  successHaptic();
                  showToast('Note saved ❤️', 'success');
                },
                onError: () => showToast("Couldn't save your note — try again", 'error'),
              }
            );
          }}
          style={[styles.noteSend, !note.trim() && styles.noteSendDisabled]}
          disabled={!note.trim() || react.isPending}
          accessibilityRole="button"
          accessibilityLabel="Save note"
        >
          {react.isPending ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <Ionicons name="arrow-up" size={18} color={colors.text.inverse} />
          )}
        </Pressable>
      </View>

      {partnerReactions.map((r) =>
        r.note ? (
          <View key={r.id} style={styles.partnerNote}>
            <Text variant="bodyMedium" style={styles.partnerNoteText}>
              &ldquo;{r.note}&rdquo;
            </Text>
          </View>
        ) : null
      )}
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  date: {
    marginBottom: spacing.md,
  },
  body: {
    lineHeight: 26,
    marginTop: spacing.sm,
  },
  reactions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  reaction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pendingLabel: {
    marginTop: spacing.xs,
  },
  addPhotos: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  noteField: {
    flex: 1,
    marginBottom: 0,
  },
  noteSend: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteSendDisabled: {
    backgroundColor: colors.primary[200],
  },
  partnerNote: {
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  partnerNoteText: {
    fontStyle: 'italic',
    color: colors.text.primary,
  },
}));
