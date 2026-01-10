import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSilvaSpaces } from '@/hooks/useSilvaSpaces';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Leaf, Moon, FileText, Trash2, Lock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SilvaCaseTabProps {
  caseId: string;
  caseTitle: string;
  userId: string;
  isSubscribed: boolean;
}

export function SilvaCaseTab({ caseId, caseTitle, userId, isSubscribed }: SilvaCaseTabProps) {
  const navigate = useNavigate();
  const { 
    getCaseSpace, 
    createSpace, 
    debouncedSave, 
    clearContent,
    updateFormatMode,
    isLoading 
  } = useSilvaSpaces(userId);

  const [content, setContent] = useState('');
  const [silenceMode, setSilenceMode] = useState(false);
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load or create case space
  useEffect(() => {
    const initSpace = async () => {
      if (!isSubscribed) return;
      
      let space = getCaseSpace(caseId);
      if (!space) {
        try {
          const newSpace = await createSpace.mutateAsync({ scope: 'case', caseId });
          space = newSpace;
        } catch (error) {
          console.error('Failed to create silva space:', error);
          return;
        }
      }
      if (space) {
        setCurrentSpaceId(space.id);
        setContent(space.content || '');
        setSilenceMode(space.format_mode === 'silence');
      }
      setIsInitialized(true);
    };
    
    initSpace();
  }, [caseId, isSubscribed, getCaseSpace, createSpace]);

  // Handle content change with autosave
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    if (currentSpaceId) {
      debouncedSave(currentSpaceId, value);
    }
  }, [currentSpaceId, debouncedSave]);

  // Toggle silence mode
  const toggleSilenceMode = useCallback(() => {
    const newMode = !silenceMode;
    setSilenceMode(newMode);
    if (currentSpaceId) {
      updateFormatMode.mutate({ id: currentSpaceId, formatMode: newMode ? 'silence' : 'default' });
    }
  }, [silenceMode, currentSpaceId, updateFormatMode]);

  // Clear content
  const handleClear = useCallback(() => {
    if (currentSpaceId) {
      setContent('');
      clearContent.mutate(currentSpaceId);
    }
  }, [currentSpaceId, clearContent]);

  // Export PDF
  const handleExportPDF = useCallback(() => {
    const now = format(new Date(), 'PPP', { locale: fr });
    let pdfContent = `SILVA
    
Dossier: ${caseTitle}
${now}

---

${content || '(espace vide)'}

---

Espace neutre. Aucun score. Aucun conseil.`;

    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silva-${caseTitle.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exporté');
  }, [content, caseTitle]);

  // Open full SILVA space
  const openFullSpace = () => {
    navigate(`/silva/space?case=${caseId}`);
  };

  // Not subscribed - show paywall
  if (!isSubscribed) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-border/20 flex items-center justify-center">
          <Lock className="w-6 h-6 text-foreground/20" />
        </div>
        <h3 className="font-display text-lg text-foreground/60 mb-2">SILVA par dossier</h3>
        <p className="text-sm text-foreground/40 mb-6 max-w-md mx-auto">
          Un espace neutre dédié à ce dossier. Sans objectif. Sans métrique.
        </p>
        <UpgradeModal 
          trigger={
            <Button variant="ghost" className="text-foreground/50 hover:text-foreground/70">
              Débloquer Pro
            </Button>
          }
        />
      </div>
    );
  }

  if (isLoading || !isInitialized) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Leaf className="w-6 h-6 text-foreground/20 animate-pulse" />
      </div>
    );
  }

  // Silence Mode
  if (silenceMode) {
    return (
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder=""
          className="min-h-[40vh] bg-transparent border-0 resize-none text-foreground/70 placeholder:text-foreground/20 focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed"
        />
        <Button 
          variant="ghost" 
          size="sm"
          onClick={toggleSilenceMode}
          className="absolute bottom-2 right-2 text-foreground/10 hover:text-foreground/30 text-xs"
        >
          Sortir du silence
        </Button>
      </div>
    );
  }

  // Default Mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Leaf className="w-4 h-4 text-foreground/30" />
          <span className="text-sm text-foreground/40">Espace neutre</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={openFullSpace}
          className="text-foreground/30 hover:text-foreground/50 text-xs"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Plein écran
        </Button>
      </div>

      {/* Textarea */}
      <Textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Tu peux écrire une phrase. Ou rien."
        className="min-h-[30vh] bg-card/10 border-border/20 resize-none text-foreground/70 placeholder:text-foreground/20 focus-visible:ring-1 focus-visible:ring-border/20 text-base leading-relaxed p-6"
      />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleSilenceMode}
            className="text-foreground/30 hover:text-foreground/50 text-xs"
          >
            <Moon className="w-3 h-3 mr-1" />
            Silence
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClear}
            className="text-foreground/20 hover:text-foreground/40 text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Effacer
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleExportPDF}
          className="text-foreground/30 hover:text-foreground/50 text-xs"
        >
          <FileText className="w-3 h-3 mr-1" />
          Print
        </Button>
      </div>

      {/* Footer message */}
      <p className="text-xs text-foreground/15 text-center pt-4">
        Espace neutre. Aucun score. Aucun conseil.
      </p>
    </div>
  );
}
