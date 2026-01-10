import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface AIActivityLog {
  id: string;
  module: string;
  action: string;
  input_snapshot: Record<string, any>;
  output_snapshot: Record<string, any>;
  accepted_items: any[];
  rejected_items: any[];
  created_at: string;
}

interface AIHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId?: string;
  userId: string;
}

const ACTION_LABELS: Record<string, string> = {
  irreversa_structure_draft: 'Structurer brouillon',
  irreversa_missing_fields: 'Repérer manques',
  irreversa_report_outline: 'Plan rapport',
  nulla_absence_to_effect: 'Absence → Effet',
  nulla_detect_duplicates: 'Détecter doublons',
  thresh_suggest_tags: 'Suggérer tags',
  thresh_period_summary: 'Synthèse période',
};

export function AIHistoryModal({ open, onOpenChange, caseId, userId }: AIHistoryModalProps) {
  const [logs, setLogs] = useState<AIActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && userId) {
      loadHistory();
    }
  }, [open, userId, caseId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('ai_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (caseId) {
        query = query.eq('case_id', caseId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as AIActivityLog[]);
    } catch (err) {
      console.error('Failed to load AI history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const moduleColors: Record<string, string> = {
    irreversa: 'bg-primary/10 text-primary border-primary/30',
    nulla: 'bg-nulla/10 text-nulla border-nulla/30',
    thresh: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider">
            Historique IA
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune action IA enregistrée
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="p-4 border border-border/50 rounded-lg bg-card/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${moduleColors[log.module] || ''}`}
                      >
                        {log.module.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </span>
                  </div>

                  {/* Input summary */}
                  <div className="text-xs text-muted-foreground mb-2">
                    <span className="font-medium">Entrée:</span>{' '}
                    {log.input_snapshot.user_input?.draft_text?.slice(0, 100) ||
                     log.input_snapshot.user_input?.raw_text?.slice(0, 100) ||
                     log.input_snapshot.user_input?.phrase?.slice(0, 100) ||
                     'Données structurées'}
                    {(log.input_snapshot.user_input?.draft_text?.length > 100 ||
                      log.input_snapshot.user_input?.raw_text?.length > 100) && '...'}
                  </div>

                  {/* Output summary */}
                  <div className="text-xs">
                    <span className="font-medium text-muted-foreground">Sortie:</span>{' '}
                    {log.output_snapshot.proposals?.length 
                      ? `${log.output_snapshot.proposals.length} proposition(s)`
                      : log.output_snapshot.merge_suggestions?.length
                      ? `${log.output_snapshot.merge_suggestions.length} fusion(s) suggérée(s)`
                      : log.output_snapshot.missing?.length
                      ? `${log.output_snapshot.missing.length} champ(s) manquant(s)`
                      : log.output_snapshot.summary_title
                      ? 'Synthèse générée'
                      : log.output_snapshot.suggested_rewrite
                      ? 'Reformulation proposée'
                      : 'Résultat généré'}
                  </div>

                  {/* Accepted/Rejected counts */}
                  {(log.accepted_items?.length > 0 || log.rejected_items?.length > 0) && (
                    <div className="flex gap-3 mt-2 pt-2 border-t border-border/30">
                      {log.accepted_items?.length > 0 && (
                        <span className="text-xs text-green-500">
                          ✓ {log.accepted_items.length} accepté(s)
                        </span>
                      )}
                      {log.rejected_items?.length > 0 && (
                        <span className="text-xs text-destructive">
                          ✗ {log.rejected_items.length} refusé(s)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}