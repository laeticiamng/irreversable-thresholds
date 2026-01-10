import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center">
          <span className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase">
            Deux outils. Une rigueur.
          </span>
        </div>
      </header>

      {/* Main - Two systems side by side */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* IRREVERSA - Left */}
        <Link 
          to="/irreversa" 
          className="flex-1 flex items-center justify-center p-12 border-b lg:border-b-0 lg:border-r border-border hover:bg-card/50 transition-all duration-500 group"
        >
          <div className="text-center space-y-6 max-w-sm">
            <h2 className="font-display text-4xl tracking-wide text-foreground group-hover:text-primary transition-colors">
              IRREVERSA
            </h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Les seuils que l'on franchit. Ce qui ne peut être défait.
            </p>
            <div className="pt-4">
              <span className="text-xs font-display tracking-[0.2em] uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                L'irréversible →
              </span>
            </div>
          </div>
        </Link>

        {/* NULLA - Right */}
        <Link 
          to="/nulla" 
          className="flex-1 flex items-center justify-center p-12 hover:bg-card/50 transition-all duration-500 group"
        >
          <div className="text-center space-y-6 max-w-sm">
            <h2 className="font-display text-4xl tracking-wide text-foreground group-hover:text-nulla transition-colors">
              NULLA
            </h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Ce qui n'existe pas. Les absences qui structurent.
            </p>
            <div className="pt-4">
              <span className="text-xs font-display tracking-[0.2em] uppercase text-nulla opacity-0 group-hover:opacity-100 transition-opacity">
                Le vide →
              </span>
            </div>
          </div>
        </Link>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <p className="text-xs text-muted-foreground font-body">
            Pour ceux qui acceptent la réalité telle qu'elle est :
          </p>
          <p className="text-xs text-muted-foreground/60 font-body">
            irréversible, incomplète, structurée par ce qui manque.
          </p>
        </div>
      </footer>
    </div>
  );
}
