import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            ← Retour
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-foreground">
            IRREVERSA
          </span>
          <Link to="/pending">
            <Button variant="monument" size="sm">
              Entrer
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-2xl text-center space-y-8 sm:space-y-12 animate-fade-up">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wide text-foreground">
              Les seuils
              <br />
              <span className="text-primary">que l'on franchit</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg font-body leading-relaxed max-w-lg mx-auto px-4">
              Un espace pour reconnaître ce qui ne pourra être défait. 
              Pas de retour arrière. Pas de correction. Pas de regret simulé.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <span className="w-8 sm:w-12 h-px bg-border" />
            <span className="text-muted-foreground text-xs font-display tracking-[0.2em] sm:tracking-[0.3em]">L'IRRÉVERSIBLE</span>
            <span className="w-8 sm:w-12 h-px bg-border" />
          </div>

          {/* Philosophy */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 text-left px-2">
            <div className="space-y-3 p-5 sm:p-6 border border-border">
              <span className="text-xs font-display tracking-[0.2em] uppercase text-primary">Aucune suppression</span>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Ce qui est franchi reste franchi. Le système refuse la plasticité du numérique.
              </p>
            </div>
            <div className="space-y-3 p-5 sm:p-6 border border-border">
              <span className="text-xs font-display tracking-[0.2em] uppercase text-primary">Temps asymétrique</span>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Le temps ici ne revient jamais en arrière. Il est directionnel, pas circulaire.
              </p>
            </div>
            <div className="space-y-3 p-5 sm:p-6 border border-border">
              <span className="text-xs font-display tracking-[0.2em] uppercase text-primary">Confrontation</span>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Pas un outil de conseil. Un outil de confrontation au réel.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 sm:pt-8">
            <Link to="/pending">
              <Button variant="seal" size="xl" className="w-full sm:w-auto min-h-[48px]">
                Inscrire un seuil
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8">
        <p className="text-center text-xs text-muted-foreground font-body px-4">
          Pour ceux qui acceptent que certaines choses ne se corrigent pas.
        </p>
      </footer>
    </div>
  );
}
