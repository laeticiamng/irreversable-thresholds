import { useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const typeColors = {
  info: 'bg-nulla/20 text-nulla',
  warning: 'bg-primary/20 text-primary',
  success: 'bg-silva/20 text-silva',
  action: 'bg-accent/20 text-accent',
};

const typeIcons = {
  info: '○',
  warning: '◈',
  success: '◆',
  action: '▸',
};

export function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications(user?.id);
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="font-display text-sm tracking-wide">Notifications</h3>
          {notifications.length > 0 && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => markAllAsRead.mutate()}
              >
                <Check className="w-3 h-3 mr-1" />
                Tout lire
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive"
                onClick={() => clearAll.mutate()}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-muted/30 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${typeColors[notification.type as keyof typeof typeColors] || typeColors.info}`}>
                      {typeIcons[notification.type as keyof typeof typeIcons] || typeIcons.info}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification.mutate(notification.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
