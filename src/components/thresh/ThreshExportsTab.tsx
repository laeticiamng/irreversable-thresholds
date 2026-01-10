import { Button } from '@/components/ui/button';
import { Case, InvisibleThreshold, THRESH_TYPE_LABELS } from '@/types/database';
import { FileText, Image, Lock, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ThreshExportsTabProps {
  caseData: Case;
  thresholds: InvisibleThreshold[];
  isSubscribed: boolean;
  onUpgrade: () => void;
}

export function ThreshExportsTab({ caseData, thresholds, isSubscribed, onUpgrade }: ThreshExportsTabProps) {
  const pendingThresholds = thresholds.filter(t => !t.sensed_at);
  const sensedThresholds = thresholds.filter(t => t.sensed_at);

  const generatePDFContent = () => {
    const now = format(new Date(), 'PPP', { locale: fr });
    
    let content = `THRESH - Rapport de Seuils Invisibles
=====================================

Dossier: ${caseData.title}
${caseData.description ? `Contexte: ${caseData.description}\n` : ''}
Date: ${now}

RÉSUMÉ
------
• Seuils totaux: ${thresholds.length}
• En attente: ${pendingThresholds.length}
• Ressentis: ${sensedThresholds.length}

`;

    if (pendingThresholds.length > 0) {
      content += `\nSEUILS EN ATTENTE
-----------------\n`;
      pendingThresholds.forEach((t, i) => {
        content += `\n${i + 1}. ${t.title}
   Type: ${THRESH_TYPE_LABELS[t.thresh_type]}
   ${t.description}\n`;
      });
    }

    if (sensedThresholds.length > 0) {
      content += `\nSEUILS RESSENTIS
----------------\n`;
      sensedThresholds.forEach((t, i) => {
        content += `\n${i + 1}. ${t.title}
   Type: ${THRESH_TYPE_LABELS[t.thresh_type]}
   Ressenti le: ${t.sensed_at ? format(new Date(t.sensed_at), 'PPP', { locale: fr }) : 'N/A'}
   ${t.description}\n`;
      });
    }

    content += `\n\n---
Généré par THRESH - Outil de lucidité.
Pas de promesse. Pas de décision à ta place.`;

    return content;
  };

  const handleExportPDF = () => {
    if (!isSubscribed) {
      onUpgrade();
      return;
    }

    const content = generatePDFContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thresh-${caseData.title.toLowerCase().replace(/\s+/g, '-')}-rapport.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Rapport exporté');
  };

  const handleExportJSON = () => {
    if (!isSubscribed) {
      onUpgrade();
      return;
    }

    const data = {
      case: {
        title: caseData.title,
        description: caseData.description,
        domain: caseData.domain,
        exportedAt: new Date().toISOString(),
      },
      summary: {
        total: thresholds.length,
        pending: pendingThresholds.length,
        sensed: sensedThresholds.length,
      },
      thresholds: thresholds.map(t => ({
        title: t.title,
        description: t.description,
        type: t.thresh_type,
        typeLabel: THRESH_TYPE_LABELS[t.thresh_type],
        status: t.sensed_at ? 'sensed' : 'pending',
        sensedAt: t.sensed_at,
        createdAt: t.created_at,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thresh-${caseData.title.toLowerCase().replace(/\s+/g, '-')}-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Données exportées');
  };

  const exportOptions = [
    {
      id: 'pdf',
      title: 'Rapport PDF',
      description: 'Rapport structuré avec tous les seuils et leur statut',
      icon: FileText,
      action: handleExportPDF,
      premium: true,
    },
    {
      id: 'json',
      title: 'Données JSON',
      description: 'Export brut pour intégration ou archivage',
      icon: Download,
      action: handleExportJSON,
      premium: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="font-display text-xl text-foreground mb-2">Exports</h3>
        <p className="text-sm text-muted-foreground">
          Exporte tes seuils pour les partager ou les archiver.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {exportOptions.map((option) => (
          <div 
            key={option.id}
            className={`p-6 border bg-card/30 transition-all ${
              option.premium && !isSubscribed 
                ? 'border-amber-500/10 opacity-60' 
                : 'border-amber-500/20 hover:bg-card/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <option.icon className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display text-foreground">{option.title}</h4>
                  {option.premium && !isSubscribed && (
                    <Lock className="w-3 h-3 text-amber-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={option.action}
                  className={`${
                    option.premium && !isSubscribed
                      ? 'text-amber-500 hover:text-amber-400'
                      : 'text-foreground hover:text-amber-500'
                  }`}
                >
                  {option.premium && !isSubscribed ? 'Débloquer Pro' : 'Exporter'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isSubscribed && (
        <div className="p-6 border border-amber-500/30 bg-amber-500/5 text-center">
          <Lock className="w-6 h-6 text-amber-500 mx-auto mb-3" />
          <h4 className="font-display text-foreground mb-2">Exports Pro</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Débloque les exports PDF et JSON avec THRESH Pro.
          </p>
          <Button 
            onClick={onUpgrade}
            className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider"
          >
            Débloquer Pro — 9,90€/mois
          </Button>
        </div>
      )}
    </div>
  );
}
