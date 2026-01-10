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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors duration-1000 text-sm font-body py-2 px-3 -ml-3">
            ← Retour
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-silva-foreground">
            SILVA
          </span>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Hero - very slow reveal */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-2xl text-center space-y-10 sm:space-y-16">
          {/* Symbol - organic, breathing */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
              <div className="absolute inset-0 rounded-full border border-silva/20 animate-silva-breathe" />
              <div className="absolute inset-3 sm:inset-4 rounded-full border border-silva/15 animate-silva-breathe" style={{ animationDelay: '3s' }} />
              <div className="absolute inset-6 sm:inset-8 rounded-full border border-silva/10 animate-silva-breathe" style={{ animationDelay: '6s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-silva/40 animate-silva-pulse" />
              </div>
            </div>
          </div>

          {/* Title - appears slowly */}
          <div 
            className={`space-y-4 sm:space-y-6 transition-all duration-[3000ms] ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wide text-silva-foreground">
              Un milieu
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg font-body leading-relaxed max-w-md mx-auto px-4">
              Pas un outil. Pas une fonctionnalité. 
              Un espace qui ne fait rien — et qui, par sa présence, contraint.
            </p>
          </div>

          {/* Philosophy - appears even slower */}
          <div 
            className={`space-y-6 sm:space-y-8 transition-all duration-[4000ms] delay-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="flex items-center justify-center gap-4">
              <span className="w-8 sm:w-12 h-px bg-silva/30" />
              <span className="text-silva/50 text-xs font-display tracking-[0.2em] sm:tracking-[0.3em]">L'ÉCOSYSTÈME</span>
              <span className="w-8 sm:w-12 h-px bg-silva/30" />
            </div>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 text-left px-2">
              <div className="space-y-3 p-5 sm:p-6 border border-silva/15">
                <span className="text-xs font-display tracking-[0.2em] uppercase text-silva-foreground/60">Aucune action</span>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  Le système n'attend rien. Il ne propose rien. Il ne mesure rien.
                </p>
              </div>
              <div className="space-y-3 p-5 sm:p-6 border border-silva/15">
                <span className="text-xs font-display tracking-[0.2em] uppercase text-silva-foreground/60">Contrainte pure</span>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  Il impose des lenteurs, des silences, des impossibilités.
                </p>
              </div>
              <div className="space-y-3 p-5 sm:p-6 border border-silva/15">
                <span className="text-xs font-display tracking-[0.2em] uppercase text-silva-foreground/60">Présence</span>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  Comme une forêt. Comme un désert. Comme une cathédrale.
                </p>
              </div>
            </div>
          </div>

          {/* Enter - appears last, very subtle */}
          <div 
            className={`pt-4 sm:pt-8 transition-all duration-[5000ms] ${showEnter ? 'opacity-100' : 'opacity-0'}`}
          >
            <Link 
              to="/silva/space"
              className="inline-block w-full sm:w-auto px-8 sm:px-12 py-4 min-h-[48px] border border-silva/30 text-silva-foreground font-display tracking-[0.15em] uppercase text-sm hover:border-silva hover:bg-silva/5 transition-all duration-1000 flex items-center justify-center"
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
      <footer className="border-t border-silva/20 py-6 sm:py-8">
        <p className="text-center text-xs text-muted-foreground/40 font-body px-4">
          Le dernier territoire encore vierge du numérique.
        </p>
      </footer>
    </div>
  );
}
