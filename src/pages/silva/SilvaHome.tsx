import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useSilvaSpaces } from '@/hooks/useSilvaSpaces';
import { GlobalNav } from '@/components/GlobalNav';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Leaf, Moon, FileText, HelpCircle } from 'lucide-react';

export default function SilvaHome() {
  const navigate = useNavigate();
  const { user, isSubscribed } = useAuth();
  const { getGlobalSpace, createSpace, isLoading } = useSilvaSpaces(user?.id);
  const [isEntering, setIsEntering] = useState(false);

  const handleEnterSilva = async () => {
    if (!user) {
      navigate('/exposition');
      return;
    }

    setIsEntering(true);
    try {
      const globalSpace = getGlobalSpace();
      if (!globalSpace) {
        await createSpace.mutateAsync({ scope: 'global' });
      }
      navigate('/silva/space');
    } finally {
      setIsEntering(false);
    }
  };

  const features = [
    { text: "Aucun objectif" },
    { text: "Aucune métrique" },
    { text: "Une présence, c'est tout" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalNav />

      {/* Hero - beaucoup d'espace */}
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-24 pt-32">
        <div className="max-w-xl mx-auto text-center">
          {/* Icon très discret */}
          <div className="w-16 h-16 mx-auto mb-12 rounded-full border border-border/30 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-foreground/30" />
          </div>

          <h1 className="font-display text-4xl md:text-5xl tracking-[0.15em] text-foreground/80 mb-6">
            SILVA
          </h1>
          <p className="text-lg text-foreground/50 font-body mb-4">
            Un espace neutre. Sans fonction.
          </p>
          <p className="text-sm text-foreground/30 font-body mb-16 max-w-md mx-auto">
            Présence sans fonction.
          </p>

          {/* Features - ultra sobre */}
          <div className="flex flex-col items-center gap-3 mb-16">
            {features.map((f, i) => (
              <span key={i} className="text-sm text-foreground/40">
                {f.text}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              onClick={handleEnterSilva}
              disabled={isEntering || isLoading}
              className="bg-foreground/10 hover:bg-foreground/20 text-foreground border-0 font-display tracking-wider px-12 py-6 text-base"
            >
              {isEntering ? '...' : 'Entrer dans SILVA'}
            </Button>

            {/* Modal "Pourquoi ça existe" */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-foreground/30 hover:text-foreground/50 text-xs">
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Pourquoi ça existe ?
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-border/30 bg-background">
                <DialogHeader>
                  <DialogTitle className="font-display text-lg text-foreground/70">
                    Pourquoi SILVA existe
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 text-foreground/50 text-sm">
                  <p>Les autres modules structurent. SILVA stabilise.</p>
                  <p>Aucune performance. Aucun score. Juste un espace.</p>
                  <p className="text-foreground/30 text-xs pt-4">
                    "Ici, rien à optimiser."
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Why Pro - très discret */}
      <section className="py-16 px-8 border-t border-border/20">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs text-foreground/30 mb-6">Avec Pro</p>
          <div className="flex justify-center gap-12 mb-8">
            <div className="text-center">
              <Moon className="w-4 h-4 mx-auto mb-2 text-foreground/20" />
              <p className="text-xs text-foreground/40">SILVA par dossier</p>
            </div>
            <div className="text-center">
              <FileText className="w-4 h-4 mx-auto mb-2 text-foreground/20" />
              <p className="text-xs text-foreground/40">Export minimal</p>
            </div>
          </div>
          {!isSubscribed && (
            <UpgradeModal 
              trigger={
                <Button variant="ghost" className="text-foreground/30 hover:text-foreground/50 text-xs">
                  Débloquer Pro
                </Button>
              }
            />
          )}
        </div>
      </section>

      {/* Footer - minimal */}
      <footer className="border-t border-border/20 py-8">
        <div className="max-w-3xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-foreground/20">
            Espace neutre. Aucun score. Aucun conseil.
          </p>
          <Link to="/silva/spaces" className="text-xs text-foreground/20 hover:text-foreground/40 transition-colors">
            Mes espaces
          </Link>
        </div>
      </footer>
    </div>
  );
}
