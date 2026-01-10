import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Absence } from '@/types/database';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Loader2, FileDown, Image, FileJson, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NullaExportsTabProps {
  absences: Absence[];
  canExport: boolean;
  isPro: boolean;
}

export function NullaExportsTab({ absences, canExport, isPro }: NullaExportsTabProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExportJSON = async () => {
    if (!canExport) return;
    
    setExporting('json');
    try {
      const exportData = {
        module: 'NULLA',
        exported_at: new Date().toISOString(),
        absences: absences.map(a => ({
          title: a.title,
          description: a.description,
          category: (a as any).category,
          impact_level: (a as any).impact_level,
          counterfactual: (a as any).counterfactual,
          evidence_needed: (a as any).evidence_needed,
          effects: a.effects?.map(e => ({
            type: e.effect_type,
            description: e.description,
          })),
        })),
        summary: {
          total_absences: absences.length,
          critical_count: absences.filter(a => (a as any).impact_level === 'high').length,
          total_effects: absences.reduce((sum, a) => sum + (a.effects?.length || 0), 0),
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nulla-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Le fichier JSON a été téléchargé.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer l'export.",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    if (!canExport) return;
    
    setExporting('pdf');
    try {
      // Generate markdown content for PDF
      let content = `# Rapport NULLA\n\n`;
      content += `**Date:** ${new Date().toLocaleDateString('fr-FR')}\n\n`;
      content += `**Total absences:** ${absences.length}\n`;
      content += `**Absences critiques:** ${absences.filter(a => (a as any).impact_level === 'high').length}\n\n`;
      
      content += `---\n\n## Absences critiques\n\n`;
      absences
        .filter(a => (a as any).impact_level === 'high')
        .forEach(a => {
          content += `### ${a.title}\n`;
          if (a.effects && a.effects.length > 0) {
            content += `→ ${a.effects[0].description}\n`;
          }
          content += `\n`;
        });

      content += `---\n\n## Toutes les absences\n\n`;
      absences.forEach(a => {
        content += `### ${a.title}\n`;
        content += `- **Catégorie:** ${(a as any).category || 'Autre'}\n`;
        content += `- **Impact:** ${(a as any).impact_level || 'Modéré'}\n`;
        if (a.effects && a.effects.length > 0) {
          content += `- **Effets:**\n`;
          a.effects.forEach(e => {
            content += `  - ${e.effect_type}: ${e.description}\n`;
          });
        }
        content += `\n`;
      });

      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nulla-rapport-${new Date().toISOString().split('T')[0]}.md`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Le rapport a été téléchargé (format Markdown).",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer l'export.",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const exports = [
    {
      id: 'pdf',
      title: 'Rapport PDF',
      description: 'Rapport complet avec absences critiques et synthèse par catégorie',
      icon: FileDown,
      action: handleExportPDF,
      premium: true,
    },
    {
      id: 'png',
      title: 'PNG Matrice',
      description: 'Image de la matrice Absence → Effet',
      icon: Image,
      action: () => toast({ title: "Bientôt disponible", description: "Export PNG en cours de développement." }),
      premium: true,
    },
    {
      id: 'json',
      title: 'JSON Data',
      description: 'Export brut des données pour intégration',
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

      {/* Summary */}
      <div className="p-6 border border-border/30 bg-card/20 text-center">
        <p className="text-sm text-muted-foreground">
          {absences.length} absence{absences.length !== 1 ? 's' : ''} · 
          {' '}{absences.filter(a => (a as any).impact_level === 'high').length} critique{absences.filter(a => (a as any).impact_level === 'high').length !== 1 ? 's' : ''} · 
          {' '}{absences.reduce((sum, a) => sum + (a.effects?.length || 0), 0)} effet{absences.reduce((sum, a) => sum + (a.effects?.length || 0), 0) !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
