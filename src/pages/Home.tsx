import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase">
            Quatre territoires
          </span>
          {user ? (
            <button
              onClick={() => signOut()}
              className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
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
          className="flex items-center justify-center p-12 border-b md:border-b md:border-r border-border hover:bg-card/50 transition-all duration-500 group min-h-[40vh]"
        >
          <div className="text-center space-y-4 max-w-xs">
            <h2 className="font-display text-3xl tracking-wide text-foreground group-hover:text-primary transition-colors">
              IRREVERSA
            </h2>
            <p className="text-muted-foreground font-body text-sm">
              Les seuils que l'on franchit. L'irréversible.
            </p>
          </div>
        </Link>

        {/* NULLA */}
        <Link 
          to="/nulla" 
          className="flex items-center justify-center p-12 border-b border-border hover:bg-card/50 transition-all duration-500 group min-h-[40vh]"
        >
          <div className="text-center space-y-4 max-w-xs">
            <h2 className="font-display text-3xl tracking-wide text-foreground group-hover:text-nulla transition-colors">
              NULLA
            </h2>
            <p className="text-muted-foreground font-body text-sm">
              Ce qui n'existe pas. Les absences qui structurent.
            </p>
          </div>
        </Link>

        {/* THRESH */}
        <Link 
          to="/thresh" 
          className="flex items-center justify-center p-12 md:border-r border-border hover:bg-card/50 transition-all duration-500 group min-h-[40vh]"
        >
          <div className="text-center space-y-4 max-w-xs">
            <h2 className="font-display text-3xl tracking-wide text-foreground group-hover:text-amber-500 transition-colors">
              THRESH
            </h2>
            <p className="text-muted-foreground font-body text-sm">
              Les seuils invisibles. Ressentis, pas mesurés.
            </p>
          </div>
        </Link>

        {/* SILVA */}
        <Link 
          to="/silva" 
          className="flex items-center justify-center p-12 hover:bg-silva/5 transition-all duration-1000 group min-h-[40vh]"
        >
          <div className="text-center space-y-4 max-w-xs">
            <h2 className="font-display text-3xl tracking-wide text-foreground group-hover:text-silva-foreground transition-colors duration-1000">
              SILVA
            </h2>
            <p className="text-muted-foreground font-body text-sm">
              Le milieu. Un espace qui ne fait rien.
            </p>
          </div>
        </Link>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground font-body">
          Pour ceux qui acceptent la réalité telle qu'elle est.
        </p>
      </footer>
    </div>
  );
}
