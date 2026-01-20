import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Absence, Case } from '@/types/database';
import { UpgradeModal } from '@/components/UpgradeModal';
import { generatePDFReport, downloadHTMLReport } from '@/components/exports/PDFExportGenerator';
import { Loader2, FileDown, FileText, FileJson, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface NullaExportsTabProps {
  absences: Absence[];
  canExport: boolean;
  isPro: boolean;
  caseData?: Case;
}

export function NullaExportsTab({ absences, canExport, isPro, caseData }: NullaExportsTabProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const criticalCount = absences.filter(a => a.impact_level === 'high').length;
  const totalEffects = absences.reduce((sum, a) => sum + (a.effects?.length || 0), 0);

  const handleExportJSON = async () => {
    if (!canExport) return;

    setExporting('json');
    try {
      const exportData = {
        module: 'NULLA',
        exported_at: new Date().toISOString(),
        case: caseData ? {
          id: caseData.id,
          title: caseData.title,
          description: caseData.description,
        } : null,
        absences: absences.map(a => ({
          title: a.title,
          description: a.description,
          category: a.category,
          impact_level: a.impact_level,
          counterfactual: a.counterfactual,
          evidence_needed: a.evidence_needed,
          effects: a.effects?.map(e => ({
            type: e.effect_type,
            description: e.description,
          })),
        })),
        summary: {
          total_absences: absences.length,
          critical_count: criticalCount,
          total_effects: totalEffects,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nulla-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Export JSON téléchargé');
    } catch (error) {
      toast.error('Impossible de générer l\'export');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = () => {
    if (!canExport) return;

    setExporting('pdf');
    try {
      generatePDFReport({
        module: 'nulla',
        caseData,
        absences,
      });
      toast.success('Rapport PDF ouvert pour impression');
    } catch (error) {
      toast.error('Impossible de générer le PDF');
    } finally {
      setExporting(null);
    }
  };

  const handleDownloadHTML = () => {
    if (!canExport) return;

    setExporting('html');
    try {
      downloadHTMLReport({
        module: 'nulla',
        caseData,
        absences,
      });
      toast.success('Rapport HTML téléchargé');
    } catch (error) {
      toast.error('Impossible de générer le HTML');
    } finally {
      setExporting(null);
    }
  };

  const exports = [
    {
      id: 'pdf',
      title: 'Rapport PDF',
      description: 'Rapport complet avec absences critiques et synthèse. Prêt à imprimer.',
      icon: FileDown,
      action: handleExportPDF,
      premium: true,
    },
    {
      id: 'html',
      title: 'Rapport HTML',
      description: 'Version web du rapport, idéale pour partage et archivage.',
      icon: FileText,
      action: handleDownloadHTML,
      premium: true,
    },
    {
      id: 'json',
      title: 'JSON Data',
      description: 'Export brut des données pour intégration technique.',
      icon: FileJson,
      action: handleExportJSON,
      premium: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-md mx-auto mb-8">
        <h2 className="font-display text-xl text-foreground mb-2">Exports NULLA</h2>
        <p className="text-sm text-muted-foreground">
          Exportez votre diagnostic d'absences pour le partager ou l'archiver.
        </p>
      </div>

      {/* Export cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {exports.map((exp) => {
          const isLocked = exp.premium && !isPro;
          const isLoading = exporting === exp.id;

          return (
            <div
              key={exp.id}
              className={`p-6 border ${isLocked ? 'border-border/30' : 'border-nulla/20'} bg-card/30 relative`}
            >
              {isLocked && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                  <UpgradeModal
                    trigger={
                      <Button variant="ghost" className="text-nulla border border-nulla/30">
                        <Lock className="w-4 h-4 mr-2" />
                        Débloquer
                      </Button>
                    }
                  />
                </div>
              )}

              <div className={isLocked ? 'opacity-50' : ''}>
                <exp.icon className="w-8 h-8 text-nulla mb-4" />
                <h3 className="font-display text-foreground mb-2">{exp.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{exp.description}</p>
                <Button
                  onClick={exp.action}
                  disabled={isLocked || isLoading}
                  variant="outline"
                  className="w-full border-nulla/30 text-nulla hover:bg-nulla/10"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Export...
                    </>
                  ) : (
                    'Exporter'
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="p-6 border border-border/30 bg-card/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="block text-2xl font-display text-nulla">{absences.length}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Absences</span>
          </div>
          <div>
            <span className="block text-2xl font-display text-red-500">{criticalCount}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Critiques</span>
          </div>
          <div>
            <span className="block text-2xl font-display text-foreground">{totalEffects}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Effets</span>
          </div>
        </div>
      </div>

      {/* Upgrade prompt */}
      {!isPro && (
        <div className="p-6 border border-nulla/30 bg-nulla/5 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Passez Pro pour débloquer les exports et conserver vos analyses.
          </p>
          <UpgradeModal
            trigger={
              <Button className="bg-nulla text-primary-foreground hover:bg-nulla/90">
                Débloquer Pro
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
