import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Case, Threshold, InvisibleThreshold, Absence } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface AnalyticsExportProps {
  cases: Case[];
  thresholds: Threshold[];
  invisibleThresholds: InvisibleThreshold[];
  absences: Absence[];
  isSubscribed: boolean;
}

export function AnalyticsExport({
  cases,
  thresholds,
  invisibleThresholds,
  absences,
  isSubscribed,
}: AnalyticsExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generateAnalyticsReport = () => {
    const now = new Date();
    
    // Calculate stats
    const crossedThresholds = thresholds.filter(t => t.is_crossed).length;
    const sensedThresholds = invisibleThresholds.filter(t => t.sensed_at).length;
    const totalAbsences = absences.length;
    const activeCases = cases.filter(c => c.status === 'active').length;

    // Group by domain
    const casesByDomain: Record<string, number> = {};
    cases.forEach(c => {
      const domain = c.domain || 'autre';
      casesByDomain[domain] = (casesByDomain[domain] || 0) + 1;
    });

    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport Analytics - Suite</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      background: #0a0a0a; 
      color: #e5e5e5; 
      padding: 40px; 
      line-height: 1.6;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { 
      font-size: 28px; 
      letter-spacing: 0.1em; 
      margin-bottom: 8px;
      color: #6366f1;
    }
    h2 { 
      font-size: 18px; 
      letter-spacing: 0.05em; 
      margin: 32px 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
    }
    .date { color: #666; font-size: 14px; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat { 
      background: #111; 
      border: 1px solid #333; 
      padding: 20px; 
    }
    .stat-value { font-size: 32px; font-weight: bold; margin-bottom: 4px; }
    .stat-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat.irreversa .stat-value { color: #6366f1; }
    .stat.thresh .stat-value { color: #f59e0b; }
    .stat.nulla .stat-value { color: #8b5cf6; }
    .stat.cases .stat-value { color: #22c55e; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #222; }
    th { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    .footer { 
      margin-top: 48px; 
      padding-top: 24px; 
      border-top: 1px solid #333; 
      text-align: center; 
      color: #666;
      font-size: 12px;
    }
    @media print {
      body { background: white; color: black; }
      .stat { border-color: #ddd; background: #f9f9f9; }
      th, td { border-color: #ddd; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>RAPPORT ANALYTICS</h1>
    <p class="date">Généré le ${format(now, 'PPPp', { locale: fr })}</p>
    
    <div class="grid">
      <div class="stat cases">
        <div class="stat-value">${activeCases}</div>
        <div class="stat-label">Dossiers actifs</div>
      </div>
      <div class="stat irreversa">
        <div class="stat-value">${crossedThresholds}/${thresholds.length}</div>
        <div class="stat-label">Seuils IRREVERSA franchis</div>
      </div>
      <div class="stat thresh">
        <div class="stat-value">${sensedThresholds}/${invisibleThresholds.length}</div>
        <div class="stat-label">Seuils THRESH ressentis</div>
      </div>
      <div class="stat nulla">
        <div class="stat-value">${totalAbsences}</div>
        <div class="stat-label">Absences NULLA documentées</div>
      </div>
    </div>

    <h2>Répartition par domaine</h2>
    <table>
      <thead>
        <tr>
          <th>Domaine</th>
          <th>Nombre de dossiers</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(casesByDomain).map(([domain, count]) => `
          <tr>
            <td>${domain}</td>
            <td>${count}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>Dossiers récents</h2>
    <table>
      <thead>
        <tr>
          <th>Titre</th>
          <th>Statut</th>
          <th>Créé le</th>
        </tr>
      </thead>
      <tbody>
        ${cases.slice(0, 10).map(c => `
          <tr>
            <td>${c.title}</td>
            <td>${c.status}</td>
            <td>${format(new Date(c.created_at), 'PP', { locale: fr })}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>Suite de lucidité — Outil de structuration. Pas de promesse.</p>
    </div>
  </div>
</body>
</html>
    `;

    return html;
  };

  const handleExport = async () => {
    if (!isSubscribed) {
      toast.error('Export réservé aux utilisateurs Pro');
      return;
    }

    setIsExporting(true);
    try {
      const html = generateAnalyticsReport();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Rapport analytics exporté');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (!isSubscribed) {
      toast.error('Export réservé aux utilisateurs Pro');
      return;
    }

    const html = generateAnalyticsReport();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting || !isSubscribed}
        className="border-border/50"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Exporter HTML
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        disabled={!isSubscribed}
        className="border-border/50"
      >
        <FileText className="w-4 h-4 mr-2" />
        Imprimer PDF
      </Button>
    </div>
  );
}
