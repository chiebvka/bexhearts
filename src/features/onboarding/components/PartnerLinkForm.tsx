import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { usePartnerLink } from '../hooks/usePartnerLink';
import { partnerCodeSchema, type PartnerCodeFormData } from '../schemas';

interface PartnerLinkFormProps {
  initialCode?: string;
}

export function PartnerLinkForm({ initialCode = '' }: PartnerLinkFormProps) {
  const { link, isLoading, error } = usePartnerLink();
  const { control, handleSubmit } = useForm<PartnerCodeFormData>({
    resolver: zodResolver(partnerCodeSchema),
    defaultValues: { code: initialCode },
  });

  const onSubmit = (data: PartnerCodeFormData) => {
    link(data.code);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {"Enter Partner's Code"}
      </Text>
      <Text variant="bodyMedium" color={colors.text.secondary} style={styles.subtitle}>
        Ask your partner for their 6-character invite code.
      </Text>

      <FormInput
        control={control}
        name="code"
        label="Invite Code"
        placeholder="ABC-DEF"
        autoCapitalize="characters"
        maxLength={7}
        containerStyle={styles.field}
      />

      {error && (
        <Text variant="bodySmall" color={colors.error} style={styles.error}>
          {error}
        </Text>
      )}

      <Button
        title="Link with Partner"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        fullWidth
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  error: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
});
