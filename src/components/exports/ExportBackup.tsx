import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserCases } from '@/hooks/useUserCases';
import { useThresholdsDB } from '@/hooks/useThresholdsDB';
import { useAbsencesDB } from '@/hooks/useAbsencesDB';
import { useInvisibleThresholds } from '@/hooks/useInvisibleThresholds';
import { useSilvaSpaces } from '@/hooks/useSilvaSpaces';
import { useTags } from '@/hooks/useTags';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function ExportBackup() {
  const { user } = useAuth();
  const { cases } = useUserCases(user?.id);
  const { thresholds: irreversaThresholds } = useThresholdsDB(user?.id);
  const { absences } = useAbsencesDB(user?.id);
  const { thresholds: threshThresholds } = useInvisibleThresholds(user?.id);
  const { spaces: silvaSpaces } = useSilvaSpaces(user?.id);
  const { tags } = useTags(user?.id);
  
  const [isExporting, setIsExporting] = useState(false);

  const handleExportBackup = async () => {
    if (!user) {
      toast.error('Connexion requise');
      return;
    }

    setIsExporting(true);
    try {
      const backupData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        userId: user.id,
        userEmail: user.email,
        data: {
          cases: cases.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            status: c.status,
            domain: c.domain,
            time_horizon: c.time_horizon,
            metadata: c.metadata,
            created_at: c.created_at,
            updated_at: c.updated_at,
          })),
          irreversaThresholds: irreversaThresholds.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            category: t.category,
            severity: t.severity,
            is_crossed: t.is_crossed,
            crossed_at: t.crossed_at,
            conditions: t.conditions,
            what_changes_after: t.what_changes_after,
            what_cannot_be_undone: t.what_cannot_be_undone,
            notes: t.notes,
            case_id: t.case_id,
            created_at: t.created_at,
          })),
          threshThresholds: threshThresholds.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            thresh_type: t.thresh_type,
            intensity: t.intensity,
            context: t.context,
            tags: t.tags,
            sensed_at: t.sensed_at,
            case_id: t.case_id,
            created_at: t.created_at,
          })),
          absences: absences.map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            category: a.category || null,
            impact_level: a.impact_level || null,
            counterfactual: a.counterfactual || null,
            evidence_needed: a.evidence_needed || null,
            case_id: a.case_id,
            created_at: a.created_at,
          })),
          silvaSpaces: silvaSpaces.map(s => ({
            id: s.id,
            scope: s.scope,
            content: s.content,
            format_mode: s.format_mode,
            case_id: s.case_id,
            created_at: s.created_at,
            updated_at: s.updated_at,
          })),
          tags: tags.map(t => ({
            id: t.id,
            name: t.name,
            color: t.color,
            created_at: t.created_at,
          })),
        },
        summary: {
          totalCases: cases.length,
          totalIrreversaThresholds: irreversaThresholds.length,
          totalThreshThresholds: threshThresholds.length,
          totalAbsences: absences.length,
          totalSilvaSpaces: silvaSpaces.length,
          totalTags: tags.length,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quatre-territoires-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export terminé', {
        description: `${cases.length} dossiers, ${irreversaThresholds.length + threshThresholds.length} seuils, ${absences.length} absences`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 border border-border/50 bg-card/20 space-y-4">
      <h3 className="font-display text-lg tracking-wide text-foreground">
        Sauvegarde des données
      </h3>
      <p className="text-sm text-muted-foreground">
        Exporte toutes tes données au format JSON pour une sauvegarde locale.
      </p>
      
      {/* Summary before export */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-muted/20 rounded border border-border/30">
        <div className="text-center">
          <span className="text-lg font-display text-foreground">{cases.length}</span>
          <p className="text-[10px] text-muted-foreground">Dossiers</p>
        </div>
        <div className="text-center">
          <span className="text-lg font-display text-primary">{irreversaThresholds.length}</span>
          <p className="text-[10px] text-muted-foreground">IRREVERSA</p>
        </div>
        <div className="text-center">
          <span className="text-lg font-display text-amber-500">{threshThresholds.length}</span>
          <p className="text-[10px] text-muted-foreground">THRESH</p>
        </div>
        <div className="text-center">
          <span className="text-lg font-display text-nulla">{absences.length}</span>
          <p className="text-[10px] text-muted-foreground">NULLA</p>
        </div>
        <div className="text-center">
          <span className="text-lg font-display text-silva">{silvaSpaces.length}</span>
          <p className="text-[10px] text-muted-foreground">SILVA</p>
        </div>
        <div className="text-center">
          <span className="text-lg font-display text-foreground">{tags.length}</span>
          <p className="text-[10px] text-muted-foreground">Tags</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleExportBackup}
          disabled={isExporting}
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/10 flex-1"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Export en cours...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Télécharger le backup
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground/60">
        Le fichier contient toutes tes données : dossiers, seuils, absences, espaces SILVA et tags.
      </p>
    </div>
  );
}
