import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingAction {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
}

const STORAGE_KEY = 'liminal_offline_queue';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load pending actions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPendingActions(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse offline queue:', e);
      }
    }
  }, []);

  // Save pending actions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connexion rétablie', {
        description: 'Synchronisation en cours...',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Mode hors-ligne', {
        description: 'Les modifications seront synchronisées à la reconnexion.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add action to queue
  const queueAction = useCallback((
    table: string,
    action: 'insert' | 'update' | 'delete',
    data: Record<string, unknown>
  ) => {
    const newAction: PendingAction = {
      id: crypto.randomUUID(),
      table,
      action,
      data,
      timestamp: Date.now(),
    };
    setPendingActions(prev => [...prev, newAction]);
    return newAction.id;
  }, []);

  // Process a single action
  const processAction = async (action: PendingAction): Promise<boolean> => {
    try {
      const { table, action: actionType, data } = action;
      
      // Type-safe table access
      const tableRef = supabase.from(table as 'thresholds' | 'invisible_thresholds' | 'absences' | 'cases');
      
      switch (actionType) {
        case 'insert':
          await tableRef.insert(data as never);
          break;
        case 'update':
          if ('id' in data) {
            const { id, ...updateData } = data;
            await tableRef.update(updateData as never).eq('id', id as string);
          }
          break;
        case 'delete':
          if ('id' in data) {
            await tableRef.delete().eq('id', data.id as string);
          }
          break;
      }
      return true;
    } catch (error) {
      console.error('Failed to process offline action:', error);
      return false;
    }
  };

  // Sync all pending actions
  const syncPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const failedActions: PendingAction[] = [];

    for (const action of pendingActions) {
      const success = await processAction(action);
      if (!success) {
        failedActions.push(action);
      }
    }

    setPendingActions(failedActions);
    setIsSyncing(false);

    if (failedActions.length === 0 && pendingActions.length > 0) {
      toast.success('Synchronisation terminée', {
        description: `${pendingActions.length} action(s) synchronisée(s).`,
      });
    } else if (failedActions.length > 0) {
      toast.error('Synchronisation partielle', {
        description: `${failedActions.length} action(s) en échec.`,
      });
    }
  }, [isOnline, pendingActions, isSyncing]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isOnline, syncPendingActions]);

  // Remove action from queue
  const removeAction = useCallback((actionId: string) => {
    setPendingActions(prev => prev.filter(a => a.id !== actionId));
  }, []);

  // Clear all pending actions
  const clearQueue = useCallback(() => {
    setPendingActions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    isOnline,
    pendingActions,
    pendingCount: pendingActions.length,
    isSyncing,
    queueAction,
    syncPendingActions,
    removeAction,
    clearQueue,
  };
}
