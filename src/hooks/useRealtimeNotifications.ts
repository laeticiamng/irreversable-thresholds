import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Bell, Target, XCircle, Eye, Users, Mail } from 'lucide-react';
import React from 'react';

interface NotificationPayload {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  module: string | null;
  case_id: string | null;
  action_url: string | null;
  created_at: string;
}

const NOTIFICATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  threshold_crossed: Target,
  threshold_sensed: Eye,
  absence_created: XCircle,
  action: Bell,
  invitation: Mail,
  team_assigned: Users,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  threshold_crossed: 'text-primary',
  threshold_sensed: 'text-amber-500',
  absence_created: 'text-nulla',
  action: 'text-foreground',
  invitation: 'text-purple-500',
  team_assigned: 'text-blue-500',
};

export function useRealtimeNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { preferences } = useUserPreferences(userId);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
      audioRef.current.volume = 0.3;
    }
  }, []);

  const playSound = useCallback(() => {
    if (preferences?.sound_enabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Audio play failed, likely due to autoplay restrictions
      });
    }
  }, [preferences?.sound_enabled]);

  const showToastNotification = useCallback((notification: NotificationPayload) => {
    if (!preferences?.notifications_enabled) return;

    const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
    const colorClass = NOTIFICATION_COLORS[notification.type] || 'text-foreground';

    toast(notification.title, {
      description: notification.message,
      icon: React.createElement(Icon, { className: `w-4 h-4 ${colorClass}` }),
      action: notification.action_url ? {
        label: 'Voir',
        onClick: () => {
          window.location.href = notification.action_url!;
        },
      } : undefined,
      duration: 5000,
    });

    playSound();
  }, [preferences?.notifications_enabled, playSound]);

  // Setup realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-push-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as NotificationPayload;
          
          // Update query cache
          queryClient.setQueryData(
            ['notifications', userId],
            (old: NotificationPayload[] = []) => [notification, ...old]
          );

          // Show toast notification
          showToastNotification(notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, showToastNotification]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Send browser notification (for when tab is not active)
  const sendBrowserNotification = useCallback((title: string, body: string, onClick?: () => void) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });

      if (onClick) {
        notification.onclick = () => {
          window.focus();
          onClick();
          notification.close();
        };
      }

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }, []);

  return {
    requestPermission,
    sendBrowserNotification,
  };
}
