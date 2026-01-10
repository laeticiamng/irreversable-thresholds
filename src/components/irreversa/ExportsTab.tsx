import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/UpgradeModal';
import { generatePDFReport, downloadHTMLReport } from '@/components/exports/PDFExportGenerator';
import { Threshold, Case } from '@/types/database';
import { FileDown, FileText, Code } from 'lucide-react';

interface ExportsTabProps {
  thresholds: Threshold[];
  canExport: boolean;
  isPro: boolean;
  caseData?: Case;
}

export function ExportsTab({ thresholds, canExport, isPro, caseData }: ExportsTabProps) {
  const handleExportPDF = () => {
    generatePDFReport({
      module: 'irreversa',
      caseData,
      thresholds,
    });
  };

  const handleDownloadHTML = () => {
    downloadHTMLReport({
      module: 'irreversa',
      caseData,
      thresholds,
    });
  };

  const handleExportJSON = () => {
    const exportData = {
      module: 'irreversa',
      case: caseData,
      thresholds,
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `irreversa-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Exportez vos seuils et conséquences dans différents formats.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {/* PDF */}
        <div className="p-6 border border-primary/20 bg-card/30">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">Rapport PDF</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Timeline complète avec seuils, statuts et implications. Prêt à imprimer.
          </p>
          {canExport ? (
            <div className="space-y-2">
              <Button onClick={handleExportPDF} className="w-full bg-primary text-primary-foreground">
                <FileDown className="w-4 h-4 mr-2" />
                Imprimer / PDF
              </Button>
              <Button onClick={handleDownloadHTML} variant="outline" className="w-full">
                Télécharger HTML
              </Button>
            </div>
          ) : (
            <UpgradeModal 
              trigger={
                <Button disabled className="w-full opacity-60">🔒 Pro requis</Button>
              }
            />
          )}
        </div>

        {/* JSON */}
        <div className="p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-display text-lg text-foreground">Export JSON</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Données brutes structurées pour intégration ou sauvegarde.
          </p>
          {canExport ? (
            <Button onClick={handleExportJSON} variant="outline" className="w-full">
              <FileDown className="w-4 h-4 mr-2" />
              Télécharger JSON
            </Button>
          ) : (
            <UpgradeModal 
              trigger={
                <Button disabled className="w-full opacity-60">🔒 Pro requis</Button>
              }
            />
          )}
        </div>

        {/* Stats */}
        <div className="p-6 border border-border/50 bg-card/10">
          <h3 className="font-display text-lg text-foreground mb-3">Statistiques</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total seuils</span>
              <span className="text-foreground font-medium">{thresholds.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Franchis</span>
              <span className="text-primary font-medium">{thresholds.filter(t => t.is_crossed).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">En attente</span>
              <span className="text-muted-foreground/80">{thresholds.filter(t => !t.is_crossed).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conséquences</span>
              <span className="text-foreground font-medium">
                {thresholds.reduce((acc, t) => acc + (t.consequences?.length || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isPro && (
        <div className="p-6 border border-primary/30 bg-primary/5 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Passez Pro pour débloquer les exports et garder une trace de vos décisions.
          </p>
          <UpgradeModal 
            trigger={
              <Button className="bg-primary text-primary-foreground">Débloquer Pro</Button>
            }
          />
        </div>
      )}
    </div>
  );
}
