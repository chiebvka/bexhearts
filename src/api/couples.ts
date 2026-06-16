import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { supabase } from '@/services/supabase/client';
import { useCoupleStore } from '@/stores/couple.store';

export function useMyCouple() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.couple.mine(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('id', coupleId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!coupleId,
  });
}

export function usePartnerProfile() {
  const coupleId = useCoupleStore((s) => s.coupleId);
  const partnerId = useCoupleStore((s) => s.partnerId);

  return useQuery({
    queryKey: queryKeys.couple.partner(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!coupleId && !!partnerId,
  });
}
