import { WifiOff, RefreshCw, Cloud } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing, syncPendingActions } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border ${
                isOnline 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'bg-destructive/10 border-destructive/30 text-destructive'
              }`}>
                {!isOnline ? (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span className="text-xs font-medium">Mode hors-ligne</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span className="text-xs font-medium">{pendingCount} en attente</span>
                  </>
                )}

                {isOnline && pendingCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 ml-1"
                    onClick={syncPendingActions}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  </Button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {!isOnline 
                ? 'Vous êtes hors-ligne. Les modifications seront synchronisées à la reconnexion.'
                : `${pendingCount} modification(s) en attente de synchronisation.`
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    </AnimatePresence>
  );
}
