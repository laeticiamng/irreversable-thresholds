import { Threshold } from '@/types/database';
import { Button } from '@/components/ui/button';

interface ExportsTabProps {
  thresholds: Threshold[];
  canExport: boolean;
  isPro: boolean;
}

export function ExportsTab({ thresholds, canExport, isPro }: ExportsTabProps) {
  const handleExportPDF = () => {
    // Generate PDF report
    const content = generatePDFContent(thresholds);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `irreversa-rapport-${new Date().toISOString().split('T')[0]}.html`;
    link.click();
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(thresholds, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `irreversa-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Exportez vos seuils et conséquences dans différents formats.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {/* PDF */}
        <div className="p-6 border border-primary/20 bg-card/30">
          <h3 className="font-display text-lg text-foreground mb-2">📄 Rapport PDF</h3>
          <p className="text-sm text-muted-foreground mb-4">Timeline + seuils + implications</p>
          {canExport ? (
            <Button onClick={handleExportPDF} className="w-full bg-primary text-primary-foreground">
              Télécharger
            </Button>
          ) : (
            <Button disabled className="w-full opacity-50">🔒 Pro requis</Button>
          )}
        </div>

        {/* PNG */}
        <div className="p-6 border border-border/50">
          <h3 className="font-display text-lg text-foreground mb-2">🖼️ Image Timeline</h3>
          <p className="text-sm text-muted-foreground mb-4">Capture visuelle de la timeline</p>
          {canExport ? (
            <Button variant="outline" className="w-full">Bientôt</Button>
          ) : (
            <Button disabled className="w-full opacity-50">🔒 Pro requis</Button>
          )}
        </div>

        {/* JSON */}
        <div className="p-6 border border-border/50">
          <h3 className="font-display text-lg text-foreground mb-2">{ } JSON</h3>
          <p className="text-sm text-muted-foreground mb-4">Données brutes pour intégration</p>
          {canExport ? (
            <Button onClick={handleExportJSON} variant="outline" className="w-full">
              Télécharger
            </Button>
          ) : (
            <Button disabled className="w-full opacity-50">🔒 Pro requis</Button>
          )}
        </div>
      </div>

      {!isPro && (
        <div className="p-6 border border-primary/30 bg-primary/5 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Passez Pro pour débloquer les exports et garder une trace de vos décisions.
          </p>
          <Button className="bg-primary text-primary-foreground">Débloquer Pro</Button>
        </div>
      )}
    </div>
  );
}

function generatePDFContent(thresholds: Threshold[]): string {
  const crossed = thresholds.filter(t => t.is_crossed);
  const pending = thresholds.filter(t => !t.is_crossed);
  
  return `<!DOCTYPE html>
<html><head><title>IRREVERSA Rapport</title>
<style>body{font-family:system-ui;max-width:800px;margin:0 auto;padding:40px;color:#333}
h1{color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:10px}
.threshold{border:1px solid #ddd;padding:20px;margin:20px 0;border-radius:8px}
.crossed{border-color:#8b5cf6;background:#f5f3ff}
.label{font-size:12px;color:#666;text-transform:uppercase}</style></head>
<body><h1>IRREVERSA — Rapport</h1>
<p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
<h2>Seuils franchis (${crossed.length})</h2>
${crossed.map(t => `<div class="threshold crossed">
<h3>${t.title}</h3><p>${t.description}</p>
${t.what_cannot_be_undone ? `<p class="label">Ce qui ne peut être défait:</p><p>${t.what_cannot_be_undone}</p>` : ''}
</div>`).join('')}
<h2>Seuils en attente (${pending.length})</h2>
${pending.map(t => `<div class="threshold"><h3>${t.title}</h3><p>${t.description}</p></div>`).join('')}
</body></html>`;
}
