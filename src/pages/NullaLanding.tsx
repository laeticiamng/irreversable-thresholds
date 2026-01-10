import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NullaLanding() {
  return (
    <div className="min-h-screen flex flex-col surface-void">
      {/* Header */}
      <header className="border-b border-nulla/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body py-2 px-3 -ml-3">
            ← Retour
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-nulla">
            NULLA
          </span>
          <Link to="/absences">
            <Button variant="void" size="sm">
              Entrer
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-2xl text-center space-y-8 sm:space-y-12 animate-fade-up">
          {/* Void symbol */}
          <div className="flex justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-nulla/30 flex items-center justify-center animate-expand-void">
              <span className="text-3xl sm:text-4xl text-nulla/60">∅</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wide text-foreground">
              Ce qui
              <br />
              <span className="text-nulla">n'existe pas</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg font-body leading-relaxed max-w-lg mx-auto px-4">
              Un espace pour reconnaître les absences qui structurent. 
              Pas pour les combler — pour les observer.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <span className="w-8 sm:w-12 h-px bg-nulla/30" />
            <span className="text-nulla/50 text-xs font-display tracking-[0.2em] sm:tracking-[0.3em]">LE VIDE</span>
            <span className="w-8 sm:w-12 h-px bg-nulla/30" />
          </div>

          {/* Philosophy */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 text-left px-2">
            <div className="space-y-3 p-5 sm:p-6 border border-nulla/20">
              <span className="text-xs font-display tracking-[0.2em] uppercase text-nulla">Anti-complétion</span>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Le système protège l'absence. Aucune suggestion, aucune résolution.
              </p>
            </div>
            <div className="space-y-3 p-5 sm:p-6 border border-nulla/20">
              <span className="text-xs font-display tracking-[0.2em] uppercase text-nulla">Effets observables</span>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Ce que cette absence empêche, rend possible, force à contourner, préserve.
              </p>
            </div>
            <div className="space-y-3 p-5 sm:p-6 border border-nulla/20">
              <span className="text-xs font-display tracking-[0.2em] uppercase text-nulla">Vide structurel</span>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Pas un vide à combler. Un vide à respecter.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 sm:pt-8">
            <Link to="/absences">
              <Button variant="absence" size="xl" className="w-full sm:w-auto min-h-[48px]">
                Déclarer une absence
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-nulla/20 py-6 sm:py-8">
        <p className="text-center text-xs text-muted-foreground font-body px-4">
          Pour ceux qui savent que le non-être structure l'être.
        </p>
      </footer>
    </div>
  );
}
