import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingAction {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

interface CachedData {
  thresholds: unknown[];
  invisibleThresholds: unknown[];
  absences: unknown[];
  cases: unknown[];
  lastSync: number;
}

const QUEUE_KEY = 'liminal_offline_queue';
const CACHE_KEY = 'liminal_offline_cache';
const MAX_RETRIES = 3;

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [cachedData, setCachedData] = useState<CachedData | null>(null);
  const syncInProgress = useRef(false);

  // Load pending actions and cached data from localStorage
  useEffect(() => {
    const storedQueue = localStorage.getItem(QUEUE_KEY);
    if (storedQueue) {
      try {
        setPendingActions(JSON.parse(storedQueue));
      } catch (e) {
        console.error('Failed to parse offline queue:', e);
      }
    }

    const storedCache = localStorage.getItem(CACHE_KEY);
    if (storedCache) {
      try {
        const cache = JSON.parse(storedCache);
        setCachedData(cache);
        if (cache.lastSync) {
          setLastSyncTime(new Date(cache.lastSync));
        }
      } catch (e) {
        console.error('Failed to parse offline cache:', e);
      }
    }
  }, []);

  // Save pending actions to localStorage
  useEffect(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Save cached data to localStorage
  useEffect(() => {
    if (cachedData) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
    }
  }, [cachedData]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connexion rétablie', {
        description: 'Synchronisation automatique en cours...',
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Mode hors-ligne activé', {
        description: 'Vos modifications seront sauvegardées localement.',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache data for offline use
  const cacheData = useCallback(async (userId: string) => {
    if (!isOnline || !userId) return;

    try {
      const [thresholdsRes, invisibleRes, absencesRes, casesRes] = await Promise.all([
        supabase.from('thresholds').select('*').eq('user_id', userId),
        supabase.from('invisible_thresholds').select('*').eq('user_id', userId),
        supabase.from('absences').select('*').eq('user_id', userId),
        supabase.from('cases').select('*'),
      ]);

      const newCache: CachedData = {
        thresholds: thresholdsRes.data || [],
        invisibleThresholds: invisibleRes.data || [],
        absences: absencesRes.data || [],
        cases: casesRes.data || [],
        lastSync: Date.now(),
      };

      setCachedData(newCache);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, [isOnline]);

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
      retryCount: 0,
    };
    
    setPendingActions(prev => [...prev, newAction]);
    
    // Update local cache optimistically
    if (cachedData) {
      const tableKey = table === 'thresholds' ? 'thresholds' 
        : table === 'invisible_thresholds' ? 'invisibleThresholds'
        : table === 'absences' ? 'absences'
        : 'cases';
      
      setCachedData(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        
        if (action === 'insert') {
          updated[tableKey] = [...(updated[tableKey] as unknown[]), data];
        } else if (action === 'update' && 'id' in data) {
          updated[tableKey] = (updated[tableKey] as { id?: string }[]).map(item => 
            item.id === data.id ? { ...item, ...data } : item
          );
        } else if (action === 'delete' && 'id' in data) {
          updated[tableKey] = (updated[tableKey] as { id?: string }[]).filter(item => 
            item.id !== data.id
          );
        }
        
        return updated;
      });
    }
    
    return newAction.id;
  }, [cachedData]);

  // Process a single action
  const processAction = async (action: PendingAction): Promise<{ success: boolean; shouldRetry: boolean }> => {
    try {
      const { table, action: actionType, data } = action;
      
      // Type-safe table access
      const tableRef = supabase.from(table as 'thresholds' | 'invisible_thresholds' | 'absences' | 'cases');
      
      let result;
      switch (actionType) {
        case 'insert':
          result = await tableRef.insert(data as never);
          break;
        case 'update':
          if ('id' in data) {
            const { id, ...updateData } = data;
            result = await tableRef.update(updateData as never).eq('id', id as string);
          }
          break;
        case 'delete':
          if ('id' in data) {
            result = await tableRef.delete().eq('id', data.id as string);
          }
          break;
      }
      
      if (result?.error) {
        console.error('Sync action failed:', result.error);
        // Check if it's a temporary error (network, rate limit) vs permanent (constraint violation)
        const isTemporary = result.error.code === 'PGRST301' || 
                          result.error.message?.includes('network') ||
                          result.error.message?.includes('timeout');
        return { success: false, shouldRetry: isTemporary && action.retryCount < MAX_RETRIES };
      }
      
      return { success: true, shouldRetry: false };
    } catch (error) {
      console.error('Failed to process offline action:', error);
      return { success: false, shouldRetry: action.retryCount < MAX_RETRIES };
    }
  };

  // Sync all pending actions
  const syncPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0 || syncInProgress.current) return;

    syncInProgress.current = true;
    setIsSyncing(true);
    
    const actionsToRetry: PendingAction[] = [];
    const processedIds: string[] = [];
    let successCount = 0;
    let failCount = 0;

    // Process actions in order (FIFO)
    for (const action of pendingActions.sort((a, b) => a.timestamp - b.timestamp)) {
      const { success, shouldRetry } = await processAction(action);
      
      if (success) {
        successCount++;
        processedIds.push(action.id);
      } else if (shouldRetry) {
        actionsToRetry.push({ ...action, retryCount: action.retryCount + 1 });
        processedIds.push(action.id);
      } else {
        failCount++;
        processedIds.push(action.id); // Remove permanently failed actions
      }
    }

    // Update pending actions
    setPendingActions(prev => [
      ...prev.filter(a => !processedIds.includes(a.id)),
      ...actionsToRetry,
    ]);
    
    setIsSyncing(false);
    syncInProgress.current = false;
    setLastSyncTime(new Date());

    // Show appropriate toast
    if (successCount > 0 && failCount === 0 && actionsToRetry.length === 0) {
      toast.success('Synchronisation terminée', {
        description: `${successCount} modification(s) synchronisée(s).`,
      });
    } else if (failCount > 0 || actionsToRetry.length > 0) {
      toast.warning('Synchronisation partielle', {
        description: `${successCount} réussie(s), ${failCount + actionsToRetry.length} en attente.`,
      });
    }
  }, [isOnline, pendingActions]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0 && !syncInProgress.current) {
      // Small delay to ensure connection is stable
      const timer = setTimeout(() => {
        syncPendingActions();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingActions.length, syncPendingActions]);

  // Periodic sync check (every 30 seconds when online)
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      if (pendingActions.length > 0 && !syncInProgress.current) {
        syncPendingActions();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, pendingActions.length, syncPendingActions]);

  // Remove action from queue
  const removeAction = useCallback((actionId: string) => {
    setPendingActions(prev => prev.filter(a => a.id !== actionId));
  }, []);

  // Clear all pending actions
  const clearQueue = useCallback(() => {
    setPendingActions([]);
    localStorage.removeItem(QUEUE_KEY);
  }, []);

  // Clear cached data
  const clearCache = useCallback(() => {
    setCachedData(null);
    localStorage.removeItem(CACHE_KEY);
  }, []);

  // Get cached data for a specific table
  const getCachedTable = useCallback(<T>(table: 'thresholds' | 'invisibleThresholds' | 'absences' | 'cases'): T[] => {
    if (!cachedData) return [];
    return cachedData[table] as T[];
  }, [cachedData]);

  return {
    isOnline,
    pendingActions,
    pendingCount: pendingActions.length,
    isSyncing,
    lastSyncTime,
    cachedData,
    queueAction,
    syncPendingActions,
    removeAction,
    clearQueue,
    cacheData,
    clearCache,
    getCachedTable,
  };
}
