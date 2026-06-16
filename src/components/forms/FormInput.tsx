import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { type TextInputProps, type ViewStyle } from 'react-native';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  containerStyle?: ViewStyle;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  containerStyle,
  ...inputProps
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          containerStyle={containerStyle}
          {...inputProps}
        />
      )}
    />
  );
}
