import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useSilvaSpaces } from '@/hooks/useSilvaSpaces';
import { useCases } from '@/hooks/useCases';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Leaf, Moon, X, FileText, Trash2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SilvaSpace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('case');
  
  const { user, loading: authLoading, isSubscribed } = useAuth();
  const { cases } = useCases(user?.id);
  const { 
    getGlobalSpace, 
    getCaseSpace, 
    createSpace, 
    debouncedSave, 
    clearContent,
    updateFormatMode,
    isLoading 
  } = useSilvaSpaces(user?.id);

  const [content, setContent] = useState('');
  const [silenceMode, setSilenceMode] = useState(false);
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);

  // Get current case info
  const currentCase = caseId ? cases.find(c => c.id === caseId) : null;
  const isCaseMode = !!caseId;

  // Load or create space
  useEffect(() => {
    const initSpace = async () => {
      if (!user) return;
      
      if (isCaseMode && caseId) {
        // Case-specific space (Pro only)
        if (!isSubscribed) {
          toast.error('SILVA par dossier est une fonctionnalité Pro');
          navigate('/silva/space');
          return;
        }
        
        let space = getCaseSpace(caseId);
        if (!space) {
          const newSpace = await createSpace.mutateAsync({ scope: 'case', caseId });
          space = newSpace;
        }
        if (space) {
          setCurrentSpaceId(space.id);
          setContent(space.content || '');
          setSilenceMode(space.format_mode === 'silence');
        }
      } else {
        // Global space
        let space = getGlobalSpace();
        if (!space) {
          const newSpace = await createSpace.mutateAsync({ scope: 'global' });
          space = newSpace;
        }
        if (space) {
          setCurrentSpaceId(space.id);
          setContent(space.content || '');
          setSilenceMode(space.format_mode === 'silence');
        }
      }
    };
    
    initSpace();
  }, [user, caseId, isCaseMode, isSubscribed, getGlobalSpace, getCaseSpace, createSpace, navigate]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

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
    if (!isSubscribed) {
      toast.error('Export disponible en Pro');
      return;
    }

    const now = format(new Date(), 'PPP', { locale: fr });
    let pdfContent = `SILVA
    
${isCaseMode && currentCase ? `Dossier: ${currentCase.title}\n` : ''}
${now}

---

${content || '(espace vide)'}

---

Espace neutre. Aucun score. Aucun conseil.`;

    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silva-${isCaseMode ? 'case' : 'global'}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exporté');
  }, [isSubscribed, content, isCaseMode, currentCase]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Leaf className="w-6 h-6 text-foreground/20 animate-pulse" />
      </div>
    );
  }

  // Silence Mode - ultra minimal
  if (silenceMode) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder=""
              className="min-h-[60vh] bg-transparent border-0 resize-none text-foreground/70 placeholder:text-foreground/20 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg leading-relaxed"
            />
          </div>
        </div>
        
        {/* Exit silence - très discret */}
        <div className="fixed bottom-8 right-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleSilenceMode}
            className="text-foreground/10 hover:text-foreground/30 text-xs"
          >
            Sortir du silence
          </Button>
        </div>
      </div>
    );
  }

  // Default Mode
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation - minimal */}
      <nav className="border-b border-border/20">
        <div className="max-w-3xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/silva/home" className="font-display text-sm tracking-[0.2em] text-foreground/40 hover:text-foreground/60 transition-colors">
              SILVA
            </Link>
            {isCaseMode && currentCase && (
              <>
                <span className="text-foreground/20">/</span>
                <span className="text-xs text-foreground/30">{currentCase.title}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!isSubscribed && (
              <UpgradeModal 
                trigger={
                  <Button variant="ghost" size="sm" className="text-foreground/30 text-xs">
                    Pro
                  </Button>
                }
              />
            )}
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-foreground/20 hover:text-foreground/40">
                <X className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-8 py-12">
        {/* Textarea - centre de l'expérience */}
        <div className="mb-8">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Tu peux écrire une phrase. Ou rien."
            className="min-h-[50vh] bg-card/20 border-border/20 resize-none text-foreground/70 placeholder:text-foreground/20 focus-visible:ring-1 focus-visible:ring-border/30 text-lg leading-relaxed p-8"
          />
        </div>

        {/* Actions - très discrets */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleSilenceMode}
              className="text-foreground/30 hover:text-foreground/50 text-xs"
            >
              <Moon className="w-3 h-3 mr-2" />
              Mode Silence
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClear}
              className="text-foreground/20 hover:text-foreground/40 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Effacer
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleExportPDF}
            className={`text-xs ${isSubscribed ? 'text-foreground/30 hover:text-foreground/50' : 'text-foreground/20'}`}
          >
            {!isSubscribed && <Lock className="w-3 h-3 mr-1" />}
            <FileText className="w-3 h-3 mr-2" />
            SILVA Print
          </Button>
        </div>
      </main>

      {/* Footer - minimal */}
      <footer className="border-t border-border/10 py-6">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <p className="text-xs text-foreground/15">
            Espace neutre. Aucun score. Aucun conseil.
          </p>
        </div>
      </footer>
    </div>
  );
}
