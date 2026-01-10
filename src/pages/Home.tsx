import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Minimal, silent */}
      <header className="border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
          <span className="font-display text-base sm:text-lg tracking-[0.2em] text-foreground">
            QUATRE TERRITOIRES
          </span>
          {user ? (
            <button
              onClick={() => signOut()}
              className="text-xs font-body text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Quitter
            </button>
          ) : (
            <Link
              to="/exposition"
              className="text-xs font-body text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Exposition
            </Link>
          )}
        </div>
      </header>

      {/* Main - The Four Territories Grid */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl">
          {/* Grid 2x2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/30">
            
            {/* IRREVERSA */}
            <Link
              to="/irreversa"
              className="group relative aspect-square sm:aspect-auto sm:min-h-[280px] md:min-h-[320px] bg-background p-6 sm:p-8 md:p-10 flex flex-col justify-between transition-colors duration-700 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            >
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-0 h-0 border-t-[20px] sm:border-t-[24px] border-l-[20px] sm:border-l-[24px] border-t-primary/0 border-l-primary/0 group-hover:border-t-primary/40 group-hover:border-l-primary/40 transition-colors duration-500" />
              
              <div className="space-y-3 sm:space-y-4">
                <h2 className="font-display text-xl sm:text-2xl tracking-wide text-foreground group-hover:text-primary transition-colors duration-500">
                  IRREVERSA
                </h2>
                <p className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed max-w-xs">
                  Les seuils que l'on franchit
                </p>
              </div>
              
              <p className="text-muted-foreground/40 font-body text-xs group-hover:text-muted-foreground/60 transition-colors duration-500">
                Ce qui est fait ne peut être défait
              </p>
            </Link>

            {/* NULLA */}
            <Link
              to="/nulla"
              className="group relative aspect-square sm:aspect-auto sm:min-h-[280px] md:min-h-[320px] bg-background p-6 sm:p-8 md:p-10 flex flex-col justify-between transition-colors duration-700 hover:bg-nulla/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nulla focus-visible:ring-inset"
            >
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] sm:border-t-[24px] border-r-[20px] sm:border-r-[24px] border-t-nulla/0 border-r-nulla/0 group-hover:border-t-nulla/40 group-hover:border-r-nulla/40 transition-colors duration-500" />
              
              <div className="space-y-3 sm:space-y-4">
                <h2 className="font-display text-xl sm:text-2xl tracking-wide text-foreground group-hover:text-nulla transition-colors duration-500">
                  NULLA
                </h2>
                <p className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed max-w-xs">
                  Les absences qui structurent
                </p>
              </div>
              
              <p className="text-muted-foreground/40 font-body text-xs group-hover:text-muted-foreground/60 transition-colors duration-500">
                Ce qui n'existe pas
              </p>
            </Link>

            {/* THRESH */}
            <Link
              to="/thresh"
              className="group relative aspect-square sm:aspect-auto sm:min-h-[280px] md:min-h-[320px] bg-background p-6 sm:p-8 md:p-10 flex flex-col justify-between transition-colors duration-700 hover:bg-amber-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset"
            >
              <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[20px] sm:border-b-[24px] border-l-[20px] sm:border-l-[24px] border-b-amber-500/0 border-l-amber-500/0 group-hover:border-b-amber-500/40 group-hover:border-l-amber-500/40 transition-colors duration-500" />
              
              <div className="space-y-3 sm:space-y-4">
                <h2 className="font-display text-xl sm:text-2xl tracking-wide text-foreground group-hover:text-amber-500 transition-colors duration-500">
                  THRESH
                </h2>
                <p className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed max-w-xs">
                  Les seuils ressentis, non mesurés
                </p>
              </div>
              
              <p className="text-muted-foreground/40 font-body text-xs group-hover:text-muted-foreground/60 transition-colors duration-500">
                L'intuition des transitions
              </p>
            </Link>

            {/* SILVA */}
            <Link
              to="/silva"
              className="group relative aspect-square sm:aspect-auto sm:min-h-[280px] md:min-h-[320px] bg-background p-6 sm:p-8 md:p-10 flex flex-col justify-between transition-colors duration-[1200ms] hover:bg-silva/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silva focus-visible:ring-inset"
            >
              <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] sm:border-b-[24px] border-r-[20px] sm:border-r-[24px] border-b-silva/0 border-r-silva/0 group-hover:border-b-silva/40 group-hover:border-r-silva/40 transition-colors duration-700" />
              
              <div className="space-y-3 sm:space-y-4">
                <h2 className="font-display text-xl sm:text-2xl tracking-wide text-foreground group-hover:text-silva transition-colors duration-700">
                  SILVA
                </h2>
                <p className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed max-w-xs">
                  Le milieu, l'espace qui ne fait rien
                </p>
              </div>
              
              <p className="text-muted-foreground/40 font-body text-xs group-hover:text-muted-foreground/60 transition-colors duration-700">
                Présence sans fonction
              </p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer - Silent */}
      <footer className="border-t border-border/20 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground/40 font-body text-xs text-center sm:text-left">
            Pour ceux qui acceptent la réalité telle qu'elle est.
          </p>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/about"
              className="text-xs font-body text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
            >
              À propos
            </Link>
            <Link
              to="/manifesto"
              className="text-xs font-body text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
            >
              Manifeste
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
