import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { TimelineEntryType } from './timeline';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// One purple family across all entry types — differentiate by glyph, not hue.
export interface EntryMeta {
  icon: IoniconName;
  label: string;
}

const META: Record<TimelineEntryType, EntryMeta> = {
  memory: { icon: 'heart', label: 'Moment' },
  milestone: { icon: 'sparkles', label: 'Milestone' },
  prayer: { icon: 'checkmark-done', label: 'Answered prayer' },
  date: { icon: 'calendar', label: 'Date' },
};

export function getEntryMeta(type: TimelineEntryType): EntryMeta {
  return META[type];
}
