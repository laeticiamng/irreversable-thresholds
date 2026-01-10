import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  display_density: 'compact' | 'comfortable' | 'spacious';
  show_animations: boolean;
  default_module: 'irreversa' | 'nulla' | 'thresh' | 'silva';
  notifications_enabled: boolean;
  email_notifications: boolean;
  sound_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserPreferences(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserPreferences | null;
    },
    enabled: !!userId,
  });

  const ensurePreferences = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user');
      
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existing) return existing;

      const { data, error } = await supabase
        .from('user_preferences')
        .insert([{ user_id: userId }])
        .select()
        .single();
      
      if (error && !error.message.includes('duplicate')) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', userId] });
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!userId) throw new Error('No user');
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', userId] });
    },
  });

  return {
    preferences,
    isLoading,
    ensurePreferences,
    updatePreferences,
  };
}
