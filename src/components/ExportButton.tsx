import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModuleType } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface ExportButtonProps {
  module: ModuleType;
  data: unknown[];
  filename?: string;
}

export function ExportButton({ module, data, filename = 'export' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log export
      await logExport('json', module);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      let markdown = `# ${module.toUpperCase()} - Export\n\n`;
      markdown += `*Généré le ${new Date().toLocaleDateString('fr-FR')}*\n\n---\n\n`;

      // Generate markdown based on module type
      if (module === 'irreversa') {
        const thresholds = data as Array<{ title: string; description: string; is_crossed: boolean; crossed_at?: string; created_at: string }>;
        
        const crossed = thresholds.filter(t => t.is_crossed);
        const pending = thresholds.filter(t => !t.is_crossed);

        if (crossed.length > 0) {
          markdown += `## Seuils franchis (${crossed.length})\n\n`;
          crossed.forEach(t => {
            markdown += `### ${t.title}\n`;
            markdown += `${t.description}\n\n`;
            markdown += `*Franchi le ${t.crossed_at ? new Date(t.crossed_at).toLocaleDateString('fr-FR') : '—'}*\n\n---\n\n`;
          });
        }

        if (pending.length > 0) {
          markdown += `## Seuils en attente (${pending.length})\n\n`;
          pending.forEach(t => {
            markdown += `### ${t.title}\n`;
            markdown += `${t.description}\n\n`;
            markdown += `*Créé le ${new Date(t.created_at).toLocaleDateString('fr-FR')}*\n\n---\n\n`;
          });
        }
      } else if (module === 'nulla') {
        const absences = data as Array<{ title: string; description: string; effects?: Array<{ effect_type: string; description: string }> }>;
        
        absences.forEach(a => {
          markdown += `## ${a.title}\n\n`;
          markdown += `${a.description}\n\n`;
          
          if (a.effects && a.effects.length > 0) {
            markdown += `### Effets\n\n`;
            a.effects.forEach(e => {
              const labels: Record<string, string> = {
                prevents: 'Empêche',
                enables: 'Rend possible',
                forces: 'Force à contourner',
                preserves: 'Préserve',
              };
              markdown += `- **${labels[e.effect_type]}**: ${e.description}\n`;
            });
            markdown += '\n';
          }
          markdown += `---\n\n`;
        });
      } else if (module === 'thresh') {
        const thresholds = data as Array<{ title: string; description: string; thresh_type: string; sensed_at?: string }>;
        
        thresholds.forEach(t => {
          markdown += `## ${t.title}\n\n`;
          markdown += `*Type: ${t.thresh_type}*\n\n`;
          markdown += `${t.description}\n\n`;
          if (t.sensed_at) {
            markdown += `*Ressenti le ${new Date(t.sensed_at).toLocaleDateString('fr-FR')}*\n\n`;
          }
          markdown += `---\n\n`;
        });
      }

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await logExport('pdf', module); // Using 'pdf' as closest type
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const logExport = async (exportType: 'pdf' | 'png' | 'json', mod: ModuleType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('exports').insert({
          user_id: user.id,
          export_type: exportType,
          module: mod,
          metadata: { items_count: data.length },
        });
      }
    } catch (e) {
      console.error('Failed to log export:', e);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          disabled={isExporting || data.length === 0}
          className="text-xs"
        >
          {isExporting ? 'Export...' : 'Exporter'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportJSON}>
          Export JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportMarkdown}>
          Export Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
