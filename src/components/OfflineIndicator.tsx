import { WifiOff, RefreshCw, Cloud, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function OfflineIndicator() {
  const { 
    isOnline, 
    pendingCount, 
    isSyncing, 
    syncPendingActions,
    lastSyncTime,
    pendingActions,
    removeAction,
  } = useOfflineSync();

  // Don't show if online and no pending actions
  if (isOnline && pendingCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        <Popover>
          <PopoverTrigger asChild>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border backdrop-blur-sm cursor-pointer transition-all hover:scale-105 ${
                isOnline 
                  ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20' 
                  : 'bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20'
              }`}
            >
              {!isOnline ? (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs font-medium">Mode hors-ligne</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span className="text-xs font-medium">{pendingCount} en attente</span>
                  {isSyncing && (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  )}
                </>
              )}
            </button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-0" align="center">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="font-medium text-sm">
                    {isOnline ? 'En ligne' : 'Hors-ligne'}
                  </span>
                </div>
                {lastSyncTime && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(lastSyncTime, { locale: fr, addSuffix: true })}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {pendingCount === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Toutes les modifications sont synchronisées.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {pendingCount} modification(s) en attente de synchronisation.
                  </p>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {pendingActions.slice(0, 5).map((action) => (
                      <div 
                        key={action.id}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            action.action === 'insert' ? 'bg-green-500' :
                            action.action === 'update' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          <span className="capitalize">{action.table}</span>
                          <span className="text-muted-foreground">
                            ({action.action})
                          </span>
                        </div>
                        {action.retryCount > 0 && (
                          <span className="text-amber-500">
                            Tentative {action.retryCount}/{3}
                          </span>
                        )}
                      </div>
                    ))}
                    {pendingCount > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Et {pendingCount - 5} autre(s)...
                      </p>
                    )}
                  </div>
                </>
              )}

              {isOnline && pendingCount > 0 && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={syncPendingActions}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Synchronisation...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Synchroniser maintenant
                    </>
                  )}
                </Button>
              )}

              {!isOnline && (
                <p className="text-xs text-center text-muted-foreground">
                  Les modifications seront synchronisées automatiquement dès le retour de la connexion.
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>
    </AnimatePresence>
  );
}
