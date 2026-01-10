import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SilvaLanding() {
  const [showContent, setShowContent] = useState(false);
  const [showEnter, setShowEnter] = useState(false);

  // Content appears slowly
  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 2000);
    const timer2 = setTimeout(() => setShowEnter(true), 5000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col surface-silva">
      {/* Header - minimal */}
      <header className="border-b border-silva/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors duration-1000 text-sm font-body">
            ← Retour
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-silva-foreground">
            SILVA
          </span>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Hero - very slow reveal */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-16">
          {/* Symbol - organic, breathing */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border border-silva/20 animate-silva-breathe" />
              <div className="absolute inset-4 rounded-full border border-silva/15 animate-silva-breathe" style={{ animationDelay: '3s' }} />
              <div className="absolute inset-8 rounded-full border border-silva/10 animate-silva-breathe" style={{ animationDelay: '6s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-silva/40 animate-silva-pulse" />
              </div>
            </div>
          </div>

          {/* Title - appears slowly */}
          <div 
            className={`space-y-6 transition-all duration-[3000ms] ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <h1 className="font-display text-4xl md:text-5xl tracking-wide text-silva-foreground">
              Un milieu
            </h1>
            <p className="text-muted-foreground text-lg font-body leading-relaxed max-w-md mx-auto">
              Pas un outil. Pas une fonctionnalité. 
              Un espace qui ne fait rien — et qui, par sa présence, contraint.
            </p>
          </div>

          {/* Philosophy - appears even slower */}
          <div 
            className={`space-y-8 transition-all duration-[4000ms] delay-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="flex items-center justify-center gap-4">
              <span className="w-12 h-px bg-silva/30" />
              <span className="text-silva/50 text-xs font-display tracking-[0.3em]">L'ÉCOSYSTÈME</span>
              <span className="w-12 h-px bg-silva/30" />
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="space-y-3 p-6 border border-silva/15">
                <span className="text-xs font-display tracking-[0.2em] uppercase text-silva-foreground/60">Aucune action</span>
                <p className="text-sm text-muted-foreground font-body">
                  Le système n'attend rien. Il ne propose rien. Il ne mesure rien.
                </p>
              </div>
              <div className="space-y-3 p-6 border border-silva/15">
                <span className="text-xs font-display tracking-[0.2em] uppercase text-silva-foreground/60">Contrainte pure</span>
                <p className="text-sm text-muted-foreground font-body">
                  Il impose des lenteurs, des silences, des impossibilités.
                </p>
              </div>
              <div className="space-y-3 p-6 border border-silva/15">
                <span className="text-xs font-display tracking-[0.2em] uppercase text-silva-foreground/60">Présence</span>
                <p className="text-sm text-muted-foreground font-body">
                  Comme une forêt. Comme un désert. Comme une cathédrale.
                </p>
              </div>
            </div>
          </div>

          {/* Enter - appears last, very subtle */}
          <div 
            className={`pt-8 transition-all duration-[5000ms] ${showEnter ? 'opacity-100' : 'opacity-0'}`}
          >
            <Link 
              to="/silva/space"
              className="inline-block px-12 py-4 border border-silva/30 text-silva-foreground font-display tracking-[0.15em] uppercase text-sm hover:border-silva hover:bg-silva/5 transition-all duration-1000"
            >
              Entrer dans le milieu
            </Link>
            <p className="mt-4 text-xs text-muted-foreground/50 font-body">
              Prévoyez du temps. Le milieu impose son rythme.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-silva/20 py-8">
        <p className="text-center text-xs text-muted-foreground/40 font-body">
          Le dernier territoire encore vierge du numérique.
        </p>
      </footer>
    </div>
  );
}
