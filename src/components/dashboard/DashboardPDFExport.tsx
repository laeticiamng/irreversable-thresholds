import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Lock } from 'lucide-react';
import { Case, Threshold, InvisibleThreshold, Absence } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardPDFExportProps {
  cases: Case[];
  thresholds: Threshold[];
  invisibleThresholds: InvisibleThreshold[];
  absences: Absence[];
  silvaSpacesCount: number;
  isSubscribed: boolean;
  userEmail?: string;
}

export function DashboardPDFExport({
  cases,
  thresholds,
  invisibleThresholds,
  absences,
  silvaSpacesCount,
  isSubscribed,
  userEmail,
}: DashboardPDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Calculate comprehensive stats
  const stats = {
    totalCases: cases.length,
    activeCases: cases.filter(c => c.status === 'active').length,
    archivedCases: cases.filter(c => c.status === 'archived').length,
    
    // IRREVERSA
    totalIrreversa: thresholds.length,
    crossedIrreversa: thresholds.filter(t => t.is_crossed).length,
    pendingIrreversa: thresholds.filter(t => !t.is_crossed).length,
    
    // THRESH
    totalThresh: invisibleThresholds.length,
    sensedThresh: invisibleThresholds.filter(t => t.sensed_at).length,
    latentThresh: invisibleThresholds.filter(t => !t.sensed_at).length,
    avgIntensity: '—', // Intensity tracked per-entry
    
    // NULLA
    totalAbsences: absences.length,
    absencesByCategory: {} as Record<string, number>, // Category not in Absence type
    
    // SILVA
    silvaSpaces: silvaSpacesCount,
    
    // Domains
    casesByDomain: cases.reduce((acc, c) => {
      const domain = c.domain || 'autre';
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    // Timeline
    lastActivity: [...thresholds, ...invisibleThresholds, ...absences]
      .map(item => new Date(item.created_at))
      .sort((a, b) => b.getTime() - a.getTime())[0],
  };

  const generatePDFContent = () => {
    const now = new Date();
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport Dashboard - Suite de Lucidité</title>
  <style>
    @page { margin: 20mm; size: A4; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', system-ui, sans-serif; 
      background: #fff; 
      color: #1a1a1a; 
      padding: 40px; 
      line-height: 1.6;
      font-size: 11pt;
    }
    .container { max-width: 100%; }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid #6366f1;
    }
    .logo { 
      font-size: 24px; 
      font-weight: 700; 
      letter-spacing: 0.15em;
      color: #6366f1;
    }
    .date { color: #666; font-size: 10pt; text-align: right; }
    .user { font-size: 9pt; color: #888; margin-top: 4px; }
    
    h1 { font-size: 20pt; margin-bottom: 24px; color: #1a1a1a; }
    h2 { 
      font-size: 12pt; 
      letter-spacing: 0.1em; 
      margin: 28px 0 12px;
      padding: 8px 12px;
      background: #f5f5f5;
      text-transform: uppercase;
    }
    h3 { font-size: 11pt; margin: 16px 0 8px; color: #444; }
    
    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 12px; 
      margin-bottom: 24px; 
    }
    .stat-card { 
      background: #fafafa; 
      border: 1px solid #e5e5e5; 
      padding: 16px;
      text-align: center;
    }
    .stat-value { 
      font-size: 28px; 
      font-weight: 700; 
      margin-bottom: 4px; 
    }
    .stat-label { 
      font-size: 9pt; 
      color: #666; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
    }
    .stat-sub { font-size: 8pt; color: #888; margin-top: 4px; }
    
    .irreversa .stat-value { color: #6366f1; }
    .thresh .stat-value { color: #f59e0b; }
    .nulla .stat-value { color: #8b5cf6; }
    .silva .stat-value { color: #22c55e; }
    .cases .stat-value { color: #0ea5e9; }
    
    .modules-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .module-card { border: 1px solid #e5e5e5; padding: 16px; }
    .module-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    .module-title { font-weight: 600; font-size: 11pt; }
    .module-count { font-size: 18px; font-weight: 700; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10pt; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; }
    th { background: #f9f9f9; font-size: 9pt; text-transform: uppercase; color: #666; }
    
    .progress-bar { 
      height: 8px; 
      background: #e5e5e5; 
      border-radius: 4px; 
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-fill { height: 100%; background: #6366f1; }
    
    .footer { 
      margin-top: 40px; 
      padding-top: 16px; 
      border-top: 1px solid #ddd; 
      text-align: center; 
      color: #888;
      font-size: 9pt;
    }
    
    .summary-box {
      background: #f8f7ff;
      border: 1px solid #e5e3ff;
      padding: 16px;
      margin: 20px 0;
    }
    
    @media print {
      body { padding: 0; }
      .stat-card { break-inside: avoid; }
      .module-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="logo">SUITE DE LUCIDITÉ</div>
        <p style="font-size: 10pt; color: #666; margin-top: 4px;">Rapport complet du tableau de bord</p>
      </div>
      <div class="date">
        Généré le ${format(now, 'PPPp', { locale: fr })}
        ${userEmail ? `<div class="user">${userEmail}</div>` : ''}
      </div>
    </div>
    
    <h1>Vue d'ensemble</h1>
    
    <div class="stats-grid">
      <div class="stat-card cases">
        <div class="stat-value">${stats.activeCases}</div>
        <div class="stat-label">Dossiers actifs</div>
        <div class="stat-sub">${stats.archivedCases} archivés</div>
      </div>
      <div class="stat-card irreversa">
        <div class="stat-value">${stats.crossedIrreversa}</div>
        <div class="stat-label">Seuils franchis</div>
        <div class="stat-sub">${stats.pendingIrreversa} en attente</div>
      </div>
      <div class="stat-card thresh">
        <div class="stat-value">${stats.sensedThresh}</div>
        <div class="stat-label">Seuils ressentis</div>
        <div class="stat-sub">Intensité moy. ${stats.avgIntensity}/5</div>
      </div>
      <div class="stat-card nulla">
        <div class="stat-value">${stats.totalAbsences}</div>
        <div class="stat-label">Absences</div>
        <div class="stat-sub">${Object.keys(stats.absencesByCategory).length} catégories</div>
      </div>
    </div>
    
    <div class="summary-box">
      <strong>Résumé :</strong> ${stats.totalCases} dossiers créés, ${stats.totalIrreversa + stats.totalThresh + stats.totalAbsences} entrées totales. 
      ${stats.crossedIrreversa > 0 ? `${stats.crossedIrreversa} point(s) de non-retour identifié(s). ` : ''}
      ${stats.sensedThresh > 0 ? `${stats.sensedThresh} seuil(s) ressenti(s). ` : ''}
      ${stats.lastActivity ? `Dernière activité : ${format(stats.lastActivity, 'PP', { locale: fr })}.` : ''}
    </div>

    <h2>Détail par module</h2>
    
    <div class="modules-grid">
      <!-- IRREVERSA -->
      <div class="module-card">
        <div class="module-header">
          <span class="module-title" style="color: #6366f1;">IRREVERSA</span>
          <span class="module-count" style="color: #6366f1;">${stats.totalIrreversa}</span>
        </div>
        <p style="font-size: 10pt; color: #666;">Points de non-retour</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${stats.totalIrreversa > 0 ? (stats.crossedIrreversa / stats.totalIrreversa * 100) : 0}%; background: #6366f1;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 9pt; color: #888; margin-top: 8px;">
          <span>${stats.crossedIrreversa} franchis</span>
          <span>${stats.pendingIrreversa} en attente</span>
        </div>
      </div>
      
      <!-- THRESH -->
      <div class="module-card">
        <div class="module-header">
          <span class="module-title" style="color: #f59e0b;">THRESH</span>
          <span class="module-count" style="color: #f59e0b;">${stats.totalThresh}</span>
        </div>
        <p style="font-size: 10pt; color: #666;">Seuils invisibles ressentis</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${stats.totalThresh > 0 ? (stats.sensedThresh / stats.totalThresh * 100) : 0}%; background: #f59e0b;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 9pt; color: #888; margin-top: 8px;">
          <span>${stats.sensedThresh} ressentis</span>
          <span>${stats.latentThresh} latents</span>
        </div>
      </div>
      
      <!-- NULLA -->
      <div class="module-card">
        <div class="module-header">
          <span class="module-title" style="color: #8b5cf6;">NULLA</span>
          <span class="module-count" style="color: #8b5cf6;">${stats.totalAbsences}</span>
        </div>
        <p style="font-size: 10pt; color: #666;">Absences structurantes</p>
        <table style="font-size: 9pt;">
          <tbody>
            ${Object.entries(stats.absencesByCategory).slice(0, 4).map(([cat, count]) => `
              <tr>
                <td>${cat}</td>
                <td style="text-align: right; font-weight: 600;">${count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <!-- SILVA -->
      <div class="module-card">
        <div class="module-header">
          <span class="module-title" style="color: #22c55e;">SILVA</span>
          <span class="module-count" style="color: #22c55e;">${stats.silvaSpaces}</span>
        </div>
        <p style="font-size: 10pt; color: #666;">Espaces de présence</p>
        <p style="font-size: 9pt; color: #888; margin-top: 12px;">
          ${stats.silvaSpaces} espace(s) créé(s) pour l'écriture libre et la présence sans fonction.
        </p>
      </div>
    </div>
    
    <h2>Répartition par domaine</h2>
    <table>
      <thead>
        <tr>
          <th>Domaine</th>
          <th style="text-align: right;">Dossiers</th>
          <th style="text-align: right;">%</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(stats.casesByDomain)
          .sort((a, b) => b[1] - a[1])
          .map(([domain, count]) => `
            <tr>
              <td>${domain}</td>
              <td style="text-align: right;">${count}</td>
              <td style="text-align: right;">${stats.totalCases > 0 ? Math.round(count / stats.totalCases * 100) : 0}%</td>
            </tr>
          `).join('')}
      </tbody>
    </table>
    
    ${cases.length > 0 ? `
    <h2>Dossiers récents</h2>
    <table>
      <thead>
        <tr>
          <th>Titre</th>
          <th>Domaine</th>
          <th>Statut</th>
          <th style="text-align: right;">Créé le</th>
        </tr>
      </thead>
      <tbody>
        ${cases
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map(c => `
            <tr>
              <td>${c.title}</td>
              <td>${c.domain || 'autre'}</td>
              <td>${c.status === 'active' ? 'Actif' : 'Archivé'}</td>
              <td style="text-align: right;">${format(new Date(c.created_at), 'PP', { locale: fr })}</td>
            </tr>
          `).join('')}
      </tbody>
    </table>
    ` : ''}

    <div class="footer">
      <p><strong>Suite de lucidité</strong> — Outil de structuration. Pas de promesse.</p>
      <p style="margin-top: 4px;">Ce rapport est un instantané de tes données. Il ne constitue pas un conseil.</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const handleExportPDF = async () => {
    if (!isSubscribed) {
      toast.error('Export PDF réservé aux utilisateurs Pro');
      return;
    }

    setIsExporting(true);
    try {
      const html = generatePDFContent();
      
      // Open in new window for print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Auto-trigger print dialog
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
      
      toast.success('Rapport prêt à imprimer en PDF');
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHTML = async () => {
    if (!isSubscribed) {
      toast.error('Export réservé aux utilisateurs Pro');
      return;
    }

    setIsExporting(true);
    try {
      const html = generatePDFContent();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-dashboard-${format(new Date(), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Rapport HTML exporté');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          disabled={isExporting}
          className="bg-primary hover:bg-primary/90"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Exporter rapport
          {!isSubscribed && <Lock className="w-3 h-3 ml-2" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF} disabled={!isSubscribed}>
          <FileText className="w-4 h-4 mr-2" />
          Imprimer en PDF
          {!isSubscribed && <Lock className="w-3 h-3 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportHTML} disabled={!isSubscribed}>
          <Download className="w-4 h-4 mr-2" />
          Télécharger HTML
          {!isSubscribed && <Lock className="w-3 h-3 ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
