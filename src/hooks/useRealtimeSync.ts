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
          queryClient.invalidateQueries({ queryKey: ['user_cases'] });
          queryClient.invalidateQueries({ queryKey: ['user-cases'] });
        }
      )
      .subscribe();

    // Subscribe to tags changes
    const tagsChannel = supabase
      .channel('tags-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tags',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tags'] });
        }
      )
      .subscribe();

    // Subscribe to case_tags changes
    const caseTagsChannel = supabase
      .channel('case-tags-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_tags',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['case-tags'] });
        }
      )
      .subscribe();

    // Subscribe to silva_spaces changes
    const silvaSpacesChannel = supabase
      .channel('silva-spaces-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'silva_spaces',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['silva-spaces'] });
          queryClient.invalidateQueries({ queryKey: ['silva_spaces'] });
        }
      )
      .subscribe();

    // Subscribe to silva_sessions changes
    const silvaSessionsChannel = supabase
      .channel('silva-sessions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'silva_sessions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['silva_sessions'] });
          queryClient.invalidateQueries({ queryKey: ['silva-sessions'] });
        }
      )
      .subscribe();

    // Subscribe to notifications changes
    const notificationsChannel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    // Subscribe to signals changes
    const signalsChannel = supabase
      .channel('signals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'signals',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['signals'] });
        }
      )
      .subscribe();

    // Subscribe to threshold_consequences changes
    const consequencesChannel = supabase
      .channel('consequences-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'threshold_consequences',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['threshold-consequences'] });
        }
      )
      .subscribe();

    // Subscribe to absence_effects changes
    const effectsChannel = supabase
      .channel('effects-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'absence_effects',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['absence-effects'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(thresholdsChannel);
      supabase.removeChannel(invisibleThresholdsChannel);
      supabase.removeChannel(absencesChannel);
      supabase.removeChannel(casesChannel);
      supabase.removeChannel(tagsChannel);
      supabase.removeChannel(caseTagsChannel);
      supabase.removeChannel(silvaSpacesChannel);
      supabase.removeChannel(silvaSessionsChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(signalsChannel);
      supabase.removeChannel(consequencesChannel);
      supabase.removeChannel(effectsChannel);
    };
  }, [userId, enabled, queryClient]);
}
