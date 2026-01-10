import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeSyncOptions {
  userId: string | undefined;
  enabled?: boolean;
}

export function useRealtimeSync({ userId, enabled = true }: RealtimeSyncOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !enabled) return;

    // Subscribe to thresholds changes (IRREVERSA)
    const thresholdsChannel = supabase
      .channel('thresholds-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'thresholds',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['thresholds'] });
          queryClient.invalidateQueries({ queryKey: ['irreversa-thresholds'] });
        }
      )
      .subscribe();

    // Subscribe to invisible_thresholds changes (THRESH)
    const invisibleThresholdsChannel = supabase
      .channel('invisible-thresholds-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invisible_thresholds',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['invisible-thresholds'] });
          queryClient.invalidateQueries({ queryKey: ['thresh-thresholds'] });
        }
      )
      .subscribe();

    // Subscribe to absences changes (NULLA)
    const absencesChannel = supabase
      .channel('absences-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'absences',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['absences'] });
        }
      )
      .subscribe();

    // Subscribe to cases changes
    const casesChannel = supabase
      .channel('cases-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['cases'] });
          queryClient.invalidateQueries({ queryKey: ['user-cases'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(thresholdsChannel);
      supabase.removeChannel(invisibleThresholdsChannel);
      supabase.removeChannel(absencesChannel);
      supabase.removeChannel(casesChannel);
    };
  }, [userId, enabled, queryClient]);
}
