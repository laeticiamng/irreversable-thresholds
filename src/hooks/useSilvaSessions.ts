import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SilvaSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export function useSilvaSessions(userId: string | undefined) {
  const queryClient = useQueryClient();
  const currentSessionId = useRef<string | null>(null);
  const startTime = useRef<Date | null>(null);

  // Fetch past sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['silva_sessions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('silva_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as SilvaSession[];
    },
    enabled: !!userId,
  });

  // Start a new session
  const startSession = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('silva_sessions')
        .insert({ user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      return data as SilvaSession;
    },
    onSuccess: (data) => {
      currentSessionId.current = data.id;
      startTime.current = new Date();
      queryClient.invalidateQueries({ queryKey: ['silva_sessions', userId] });
    },
  });

  // End the current session
  const endSession = useMutation({
    mutationFn: async (durationSeconds: number) => {
      if (!currentSessionId.current) return null;
      
      const { data, error } = await supabase
        .from('silva_sessions')
        .update({ 
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq('id', currentSessionId.current)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      currentSessionId.current = null;
      startTime.current = null;
      queryClient.invalidateQueries({ queryKey: ['silva_sessions', userId] });
    },
  });

  // Calculate total time spent
  const getTotalTimeSpent = useCallback(() => {
    return sessions.reduce((acc, session) => {
      return acc + (session.duration_seconds || 0);
    }, 0);
  }, [sessions]);

  // Get session count
  const getSessionCount = useCallback(() => {
    return sessions.filter(s => s.ended_at !== null).length;
  }, [sessions]);

  // Get average session duration
  const getAverageDuration = useCallback(() => {
    const completedSessions = sessions.filter(s => s.duration_seconds !== null);
    if (completedSessions.length === 0) return 0;
    const total = completedSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
    return Math.round(total / completedSessions.length);
  }, [sessions]);

  return {
    sessions,
    isLoading,
    startSession,
    endSession,
    currentSessionId: currentSessionId.current,
    getTotalTimeSpent,
    getSessionCount,
    getAverageDuration,
  };
}
