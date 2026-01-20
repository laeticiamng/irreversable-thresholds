import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Lock, BarChart3, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OrgPDFExportProps {
  organizationId: string;
  organizationName: string;
  isSubscribed: boolean;
}

interface ExportOptions {
  includeStats: boolean;
  includeMembers: boolean;
  includeActivity: boolean;
  includeCharts: boolean;
}

export function OrgPDFExport({ organizationId, organizationName, isSubscribed }: OrgPDFExportProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeStats: true,
    includeMembers: true,
    includeActivity: true,
    includeCharts: true,
  });

  // Fetch comprehensive data for the report
  const { data: reportData } = useQuery({
    queryKey: ['org-report-data', organizationId],
    queryFn: async () => {
      const [thresholdsRes, absencesRes, invisibleRes, silvaRes, membersRes, teamsRes] = await Promise.all([
        supabase.from('thresholds').select('*').eq('organization_id', organizationId),
        supabase.from('absences').select('*').eq('organization_id', organizationId),
        supabase.from('invisible_thresholds').select('*').eq('organization_id', organizationId),
        supabase.from('silva_sessions').select('*').eq('organization_id', organizationId),
        supabase.from('organization_members').select('*, profiles(email, display_name)').eq('organization_id', organizationId),
        supabase.from('teams').select('*, team_members(id)').eq('organization_id', organizationId),
      ]);

      return {
        thresholds: thresholdsRes.data || [],
        absences: absencesRes.data || [],
        invisibleThresholds: invisibleRes.data || [],
        silvaSessions: silvaRes.data || [],
        members: membersRes.data || [],
        teams: teamsRes.data || [],
      };
    },
    enabled: open && !!organizationId,
  });

  const generatePDFContent = () => {
    if (!reportData) return '';
    
    const now = new Date();
    const stats = {
      thresholdsTotal: reportData.thresholds.length,
      thresholdsCrossed: reportData.thresholds.filter((t: any) => t.is_crossed).length,
      absencesTotal: reportData.absences.length,
      invisibleTotal: reportData.invisibleThresholds.length,
      invisibleSensed: reportData.invisibleThresholds.filter((t: any) => t.sensed_at).length,
      silvaTotal: reportData.silvaSessions.length,
      silvaTime: reportData.silvaSessions.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0),
      membersTotal: reportData.members.length,
      teamsTotal: reportData.teams.length,
    };

    const roleDistribution = reportData.members.reduce((acc: Record<string, number>, m: any) => {
      acc[m.role] = (acc[m.role] || 0) + 1;
      return acc;
    }, {});

    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport Organisation - ${organizationName}</title>
  <style>
    @page { margin: 15mm; size: A4; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', system-ui, sans-serif; 
      color: #1a1a1a; 
      line-height: 1.6;
      font-size: 10pt;
      padding: 20px;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 3px solid #6366f1;
    }
    .logo { font-size: 22px; font-weight: 700; color: #6366f1; letter-spacing: 0.1em; }
    .org-name { font-size: 14pt; color: #333; margin-top: 4px; }
    .date { color: #666; font-size: 9pt; text-align: right; }
    
    h1 { font-size: 16pt; margin: 20px 0 12px; color: #1a1a1a; }
    h2 { 
      font-size: 11pt; 
      letter-spacing: 0.08em; 
      margin: 20px 0 10px;
      padding: 6px 10px;
      background: linear-gradient(90deg, #f3f4f6, transparent);
      text-transform: uppercase;
      color: #374151;
      border-left: 3px solid #6366f1;
    }
    
    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 10px; 
      margin: 16px 0;
    }
    .stat-card { 
      background: #fafafa; 
      border: 1px solid #e5e5e5; 
      padding: 12px;
      text-align: center;
      border-radius: 4px;
    }
    .stat-value { font-size: 24px; font-weight: 700; }
    .stat-label { font-size: 8pt; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-sub { font-size: 7pt; color: #888; margin-top: 2px; }
    
    .irreversa .stat-value { color: #6366f1; }
    .thresh .stat-value { color: #f59e0b; }
    .nulla .stat-value { color: #8b5cf6; }
    .silva .stat-value { color: #22c55e; }
    .members .stat-value { color: #0ea5e9; }
    
    .chart-placeholder {
      width: 100%;
      height: 180px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 9pt;
      margin: 12px 0;
    }
    
    .pie-chart {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      padding: 16px;
    }
    .pie-chart svg { width: 120px; height: 120px; }
    .legend { font-size: 9pt; }
    .legend-item { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
    .legend-color { width: 12px; height: 12px; border-radius: 2px; }
    
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9pt; }
    th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #e5e5e5; }
    th { background: #f9fafb; font-size: 8pt; text-transform: uppercase; color: #6b7280; }
    
    .badge { 
      display: inline-block; 
      padding: 2px 8px; 
      border-radius: 4px; 
      font-size: 8pt; 
      font-weight: 500;
    }
    .badge-owner { background: #fef3c7; color: #92400e; }
    .badge-admin { background: #ede9fe; color: #6d28d9; }
    .badge-member { background: #dbeafe; color: #1d4ed8; }
    .badge-viewer { background: #f3f4f6; color: #4b5563; }
    
    .progress-bar { 
      height: 6px; 
      background: #e5e5e5; 
      border-radius: 3px; 
      overflow: hidden;
      margin: 6px 0;
    }
    .progress-fill { height: 100%; }
    
    .summary-box {
      background: #f8f7ff;
      border: 1px solid #e5e3ff;
      border-radius: 6px;
      padding: 12px 16px;
      margin: 16px 0;
      font-size: 9pt;
    }
    
    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    
    .footer { 
      margin-top: 32px; 
      padding-top: 12px; 
      border-top: 1px solid #e5e5e5; 
      text-align: center; 
      color: #9ca3af;
      font-size: 8pt;
    }
    
    @media print {
      body { padding: 0; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">RAPPORT D'ORGANISATION</div>
      <div class="org-name">${organizationName}</div>
    </div>
    <div class="date">
      Généré le ${format(now, 'PPPp', { locale: fr })}
    </div>
  </div>

  ${options.includeStats ? `
  <h1>📊 Vue d'ensemble</h1>
  
  <div class="stats-grid">
    <div class="stat-card irreversa">
      <div class="stat-value">${stats.thresholdsTotal}</div>
      <div class="stat-label">Seuils IRREVERSA</div>
      <div class="stat-sub">${stats.thresholdsCrossed} franchis</div>
    </div>
    <div class="stat-card thresh">
      <div class="stat-value">${stats.invisibleTotal}</div>
      <div class="stat-label">Seuils THRESH</div>
      <div class="stat-sub">${stats.invisibleSensed} ressentis</div>
    </div>
    <div class="stat-card nulla">
      <div class="stat-value">${stats.absencesTotal}</div>
      <div class="stat-label">Absences NULLA</div>
      <div class="stat-sub">documentées</div>
    </div>
    <div class="stat-card silva">
      <div class="stat-value">${stats.silvaTotal}</div>
      <div class="stat-label">Sessions SILVA</div>
      <div class="stat-sub">${formatTime(stats.silvaTime)} total</div>
    </div>
  </div>

  <div class="summary-box">
    <strong>Résumé exécutif :</strong> 
    ${stats.membersTotal} membre${stats.membersTotal > 1 ? 's' : ''} actif${stats.membersTotal > 1 ? 's' : ''} 
    dans ${stats.teamsTotal} équipe${stats.teamsTotal > 1 ? 's' : ''}.
    ${stats.thresholdsCrossed > 0 ? `${stats.thresholdsCrossed} point(s) de non-retour franchis. ` : ''}
    ${stats.invisibleSensed > 0 ? `${stats.invisibleSensed} seuil(s) perçu(s). ` : ''}
    Production totale: ${stats.thresholdsTotal + stats.absencesTotal + stats.invisibleTotal} entrées.
  </div>
  ` : ''}

  ${options.includeCharts ? `
  <h2>Répartition par module</h2>
  <div class="pie-chart">
    <svg viewBox="0 0 100 100">
      ${(() => {
        const total = stats.thresholdsTotal + stats.absencesTotal + stats.invisibleTotal + stats.silvaTotal;
        if (total === 0) return '<circle cx="50" cy="50" r="40" fill="#e5e5e5"/>';
        
        const data = [
          { value: stats.thresholdsTotal, color: '#6366f1', label: 'IRREVERSA' },
          { value: stats.invisibleTotal, color: '#f59e0b', label: 'THRESH' },
          { value: stats.absencesTotal, color: '#8b5cf6', label: 'NULLA' },
          { value: stats.silvaTotal, color: '#22c55e', label: 'SILVA' },
        ].filter(d => d.value > 0);
        
        let currentAngle = 0;
        return data.map(d => {
          const angle = (d.value / total) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          const endAngle = currentAngle;
          
          const startRad = (startAngle - 90) * Math.PI / 180;
          const endRad = (endAngle - 90) * Math.PI / 180;
          
          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          return `<path d="M50,50 L${x1},${y1} A40,40 0 ${largeArc},1 ${x2},${y2} Z" fill="${d.color}"/>`;
        }).join('');
      })()}
    </svg>
    <div class="legend">
      <div class="legend-item"><div class="legend-color" style="background:#6366f1"></div>IRREVERSA (${stats.thresholdsTotal})</div>
      <div class="legend-item"><div class="legend-color" style="background:#f59e0b"></div>THRESH (${stats.invisibleTotal})</div>
      <div class="legend-item"><div class="legend-color" style="background:#8b5cf6"></div>NULLA (${stats.absencesTotal})</div>
      <div class="legend-item"><div class="legend-color" style="background:#22c55e"></div>SILVA (${stats.silvaTotal})</div>
    </div>
  </div>

  <h2>Progression IRREVERSA</h2>
  <div style="padding: 12px;">
    <div style="display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 4px;">
      <span>Seuils franchis</span>
      <span>${stats.thresholdsCrossed} / ${stats.thresholdsTotal}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${stats.thresholdsTotal > 0 ? (stats.thresholdsCrossed / stats.thresholdsTotal * 100) : 0}%; background: #6366f1;"></div>
    </div>
  </div>

  <h2>Progression THRESH</h2>
  <div style="padding: 12px;">
    <div style="display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 4px;">
      <span>Seuils ressentis</span>
      <span>${stats.invisibleSensed} / ${stats.invisibleTotal}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${stats.invisibleTotal > 0 ? (stats.invisibleSensed / stats.invisibleTotal * 100) : 0}%; background: #f59e0b;"></div>
    </div>
  </div>
  ` : ''}

  ${options.includeMembers ? `
  <h2>👥 Équipe</h2>
  
  <div class="two-cols">
    <div>
      <h3 style="font-size: 10pt; margin-bottom: 8px;">Membres (${stats.membersTotal})</h3>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Rôle</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.members.slice(0, 10).map((m: any) => `
            <tr>
              <td>${m.profiles?.display_name || m.profiles?.email || 'Membre'}</td>
              <td>
                <span class="badge badge-${m.role}">
                  ${m.role === 'owner' ? 'Propriétaire' : m.role === 'admin' ? 'Admin' : m.role === 'member' ? 'Membre' : 'Lecteur'}
                </span>
              </td>
            </tr>
          `).join('')}
          ${reportData.members.length > 10 ? `<tr><td colspan="2" style="color: #888;">... et ${reportData.members.length - 10} autres</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    
    <div>
      <h3 style="font-size: 10pt; margin-bottom: 8px;">Équipes (${stats.teamsTotal})</h3>
      <table>
        <thead>
          <tr>
            <th>Équipe</th>
            <th>Membres</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.teams.map((t: any) => `
            <tr>
              <td>
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${t.color}; margin-right: 6px;"></span>
                ${t.name}
              </td>
              <td>${t.team_members?.length || 0}</td>
            </tr>
          `).join('')}
          ${reportData.teams.length === 0 ? '<tr><td colspan="2" style="color: #888;">Aucune équipe créée</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  </div>
  
  <h3 style="font-size: 10pt; margin: 16px 0 8px;">Répartition des rôles</h3>
  <div style="display: flex; gap: 16px;">
    ${Object.entries(roleDistribution).map(([role, count]) => `
      <div style="text-align: center;">
        <div style="font-size: 18pt; font-weight: 700; color: ${role === 'owner' ? '#92400e' : role === 'admin' ? '#6d28d9' : role === 'member' ? '#1d4ed8' : '#4b5563'};">
          ${count}
        </div>
        <div style="font-size: 8pt; color: #666; text-transform: uppercase;">
          ${role === 'owner' ? 'Propriétaires' : role === 'admin' ? 'Admins' : role === 'member' ? 'Membres' : 'Lecteurs'}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${options.includeActivity ? `
  <h2>📈 Activité récente</h2>
  
  <table>
    <thead>
      <tr>
        <th>Module</th>
        <th>Titre</th>
        <th>Date</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>
      ${[
        ...reportData.thresholds.slice(0, 5).map((t: any) => ({
          module: 'IRREVERSA',
          title: t.title,
          date: t.created_at,
          status: t.is_crossed ? 'Franchi' : 'En attente',
          color: '#6366f1',
        })),
        ...reportData.invisibleThresholds.slice(0, 5).map((t: any) => ({
          module: 'THRESH',
          title: t.title,
          date: t.created_at,
          status: t.sensed_at ? 'Ressenti' : 'Latent',
          color: '#f59e0b',
        })),
        ...reportData.absences.slice(0, 5).map((a: any) => ({
          module: 'NULLA',
          title: a.title,
          date: a.created_at,
          status: 'Documentée',
          color: '#8b5cf6',
        })),
      ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map((item: any) => `
        <tr>
          <td><span style="color: ${item.color}; font-weight: 600;">${item.module}</span></td>
          <td>${item.title}</td>
          <td>${format(new Date(item.date), 'dd/MM/yyyy', { locale: fr })}</td>
          <td>${item.status}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    <p><strong>Suite de lucidité</strong> — Rapport confidentiel</p>
    <p style="margin-top: 4px;">Ce document contient des informations sensibles. Distribution limitée.</p>
  </div>
</body>
</html>
    `;
  };

  const handleExport = async (format: 'pdf' | 'html') => {
    if (!isSubscribed) {
      toast.error('Export réservé aux utilisateurs Pro');
      return;
    }

    setIsExporting(true);
    try {
      const html = generatePDFContent();
      
      if (format === 'pdf') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          setTimeout(() => printWindow.print(), 500);
        }
        toast.success('Rapport prêt à imprimer');
      } else {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-${organizationName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Rapport téléchargé');
      }
      
      setOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-display tracking-wider">
          <FileText className="w-4 h-4 mr-2" />
          Exporter rapport
          {!isSubscribed && <Lock className="w-3 h-3 ml-2" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Exporter le rapport</DialogTitle>
          <DialogDescription>
            Génère un rapport complet de l'organisation avec statistiques et graphiques.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
              Inclure dans le rapport
            </Label>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="stats" 
                  checked={options.includeStats}
                  onCheckedChange={(c) => setOptions(o => ({ ...o, includeStats: !!c }))}
                />
                <label htmlFor="stats" className="text-sm flex items-center gap-2 cursor-pointer">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Statistiques générales
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="charts" 
                  checked={options.includeCharts}
                  onCheckedChange={(c) => setOptions(o => ({ ...o, includeCharts: !!c }))}
                />
                <label htmlFor="charts" className="text-sm flex items-center gap-2 cursor-pointer">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  Graphiques et progression
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="members" 
                  checked={options.includeMembers}
                  onCheckedChange={(c) => setOptions(o => ({ ...o, includeMembers: !!c }))}
                />
                <label htmlFor="members" className="text-sm flex items-center gap-2 cursor-pointer">
                  <Users className="w-4 h-4 text-nulla" />
                  Membres et équipes
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="activity" 
                  checked={options.includeActivity}
                  onCheckedChange={(c) => setOptions(o => ({ ...o, includeActivity: !!c }))}
                />
                <label htmlFor="activity" className="text-sm flex items-center gap-2 cursor-pointer">
                  <FileText className="w-4 h-4 text-silva" />
                  Activité récente
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => handleExport('pdf')}
              disabled={isExporting || !isSubscribed}
              className="flex-1 font-display tracking-wider"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Imprimer PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('html')}
              disabled={isExporting || !isSubscribed}
              className="flex-1 font-display tracking-wider"
            >
              <Download className="w-4 h-4 mr-2" />
              HTML
            </Button>
          </div>
          
          {!isSubscribed && (
            <p className="text-xs text-center text-muted-foreground">
              <Lock className="w-3 h-3 inline mr-1" />
              Fonctionnalité réservée aux utilisateurs Pro
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
