import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase">
            Quatre territoires
          </span>
          {user ? (
            <button
              onClick={() => signOut()}
              className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors py-2 px-3 -mr-3"
            >
              Déconnexion
            </button>
          ) : (
            <Link to="/auth">
              <Button variant="monument" size="sm">Connexion</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main - Four systems in a grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2">
        {/* IRREVERSA */}
        <Link 
          to="/irreversa" 
          className="group relative flex items-center justify-center p-8 sm:p-12 border-b md:border-b md:border-r border-border min-h-[35vh] md:min-h-[40vh] transition-all duration-500 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        >
          {/* Subtle background glow on hover */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-700" />
          {/* Corner accent */}
          <div className="absolute top-0 left-0 w-0 h-px bg-primary group-hover:w-16 transition-all duration-500 delay-100" />
          <div className="absolute top-0 left-0 h-0 w-px bg-primary group-hover:h-16 transition-all duration-500 delay-100" />
          
          <div className="relative text-center space-y-3 sm:space-y-4 max-w-xs">
            <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground group-hover:text-primary transition-colors duration-500">
              IRREVERSA
            </h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity duration-500">
              Les seuils que l'on franchit. L'irréversible.
            </p>
          </div>
        </Link>

        {/* NULLA */}
        <Link 
          to="/nulla" 
          className="group relative flex items-center justify-center p-8 sm:p-12 border-b border-border min-h-[35vh] md:min-h-[40vh] transition-all duration-500 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-nulla focus-visible:ring-inset"
        >
          <div className="absolute inset-0 bg-nulla/0 group-hover:bg-nulla/5 transition-colors duration-700" />
          <div className="absolute top-0 right-0 w-0 h-px bg-nulla group-hover:w-16 transition-all duration-500 delay-100" />
          <div className="absolute top-0 right-0 h-0 w-px bg-nulla group-hover:h-16 transition-all duration-500 delay-100" />
          
          <div className="relative text-center space-y-3 sm:space-y-4 max-w-xs">
            <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground group-hover:text-nulla transition-colors duration-500">
              NULLA
            </h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity duration-500">
              Ce qui n'existe pas. Les absences qui structurent.
            </p>
          </div>
        </Link>

        {/* THRESH */}
        <Link 
          to="/thresh" 
          className="group relative flex items-center justify-center p-8 sm:p-12 md:border-r border-border min-h-[35vh] md:min-h-[40vh] transition-all duration-500 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset"
        >
          <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors duration-700" />
          <div className="absolute bottom-0 left-0 w-0 h-px bg-amber-500 group-hover:w-16 transition-all duration-500 delay-100" />
          <div className="absolute bottom-0 left-0 h-0 w-px bg-amber-500 group-hover:h-16 transition-all duration-500 delay-100" />
          
          <div className="relative text-center space-y-3 sm:space-y-4 max-w-xs">
            <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground group-hover:text-amber-500 transition-colors duration-500">
              THRESH
            </h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity duration-500">
              Les seuils invisibles. Ressentis, pas mesurés.
            </p>
          </div>
        </Link>

        {/* SILVA */}
        <Link 
          to="/silva" 
          className="group relative flex items-center justify-center p-8 sm:p-12 min-h-[35vh] md:min-h-[40vh] transition-all duration-1000 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-silva focus-visible:ring-inset"
        >
          <div className="absolute inset-0 bg-silva/0 group-hover:bg-silva/10 transition-colors duration-1000" />
          <div className="absolute bottom-0 right-0 w-0 h-px bg-silva group-hover:w-16 transition-all duration-700 delay-200" />
          <div className="absolute bottom-0 right-0 h-0 w-px bg-silva group-hover:h-16 transition-all duration-700 delay-200" />
          
          <div className="relative text-center space-y-3 sm:space-y-4 max-w-xs">
            <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground group-hover:text-silva-foreground transition-colors duration-1000">
              SILVA
            </h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity duration-1000">
              Le milieu. Un espace qui ne fait rien.
            </p>
          </div>
        </Link>
      </main>

      {/* Footer with Dashboard link */}
      <footer className="border-t border-border py-4 sm:py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-body">
            Pour ceux qui acceptent la réalité telle qu'elle est.
          </p>
          {user && (
            <Link 
              to="/dashboard" 
              className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors py-2 px-3 -mr-3"
            >
              Vue synthèse →
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
