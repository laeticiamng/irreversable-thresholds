import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function ThreshLanding() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">
            ← Retour
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-amber-500">
            THRESH
          </span>
          <Link to="/thresholds">
            <Button variant="monument" size="sm" className="border-amber-500/30 text-amber-500 hover:border-amber-500">
              Entrer
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-12 animate-fade-up">
          {/* Symbol */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full border border-amber-500/30 flex items-center justify-center">
              <span className="text-4xl text-amber-500/60">◉</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="font-display text-5xl md:text-6xl tracking-wide text-foreground">
              À partir de là,
              <br />
              <span className="text-amber-500">quelque chose change</span>
            </h1>
            <p className="text-muted-foreground text-lg font-body leading-relaxed max-w-lg mx-auto">
              Les seuils invisibles. Ressentis, pas mesurés. 
              Sans valeur, sans unité, sans condition logique.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <span className="w-12 h-px bg-amber-500/30" />
            <span className="text-amber-500/50 text-xs font-display tracking-[0.3em]">LE SEUIL</span>
            <span className="w-12 h-px bg-amber-500/30" />
          </div>

          {/* Philosophy */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="space-y-3 p-6 border border-amber-500/20">
              <span className="text-xs font-display tracking-[0.2em] uppercase text-amber-500">Non quantifié</span>
              <p className="text-sm text-muted-foreground font-body">
                Pas de valeur. Pas d'unité. Pas de direction. Pas de condition.
              </p>
            </div>
            <div className="space-y-3 p-6 border border-amber-500/20">
              <span className="text-xs font-display tracking-[0.2em] uppercase text-amber-500">Sans déclencheur</span>
              <p className="text-sm text-muted-foreground font-body">
                Le seuil ne déclenche rien. Il ne produit aucune action. Il existe.
              </p>
            </div>
            <div className="space-y-3 p-6 border border-amber-500/20">
              <span className="text-xs font-display tracking-[0.2em] uppercase text-amber-500">Irréductible</span>
              <p className="text-sm text-muted-foreground font-body">
                Impossible à maximiser, minimiser, automatiser ou prédire.
              </p>
            </div>
          </div>

          {/* Types */}
          <div className="py-4">
            <p className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Types de seuils
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Trop', 'Pas assez', 'Rupture', 'Évidence', 'Saturation', 'Acceptabilité', 'Tolérance'].map((type) => (
                <span 
                  key={type}
                  className="text-xs px-3 py-1 border border-amber-500/20 text-amber-500/70 font-display tracking-wider"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-8">
            <Link to="/thresholds">
              <Button 
                variant="seal" 
                size="xl"
                className="bg-gradient-to-r from-amber-600 to-amber-500"
              >
                Inscrire un seuil invisible
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/20 py-8">
        <p className="text-center text-xs text-muted-foreground font-body">
          Pour ceux qui savent que le problème n'est pas quoi faire, mais quand ne plus continuer.
        </p>
      </footer>
    </div>
  );
}
