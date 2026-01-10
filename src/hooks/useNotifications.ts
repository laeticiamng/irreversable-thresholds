import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'action';
  module: string | null;
  case_id: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
  });

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.setQueryData(['notifications', userId], (old: Notification[] = []) => {
            return [payload.new as Notification, ...old];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user');
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user');
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const createNotification = useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    createNotification,
  };
}
