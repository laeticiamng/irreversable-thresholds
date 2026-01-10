import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md px-6"
      >
        <div className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-primary/30 flex items-center justify-center">
          <span className="text-4xl text-primary/60">◼</span>
        </div>
        
        <h1 className="font-display text-5xl tracking-wider text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground font-body mb-2">
          Cette page n'existe pas.
        </p>
        <p className="text-sm text-muted-foreground/60 mb-8">
          Le chemin <code className="px-2 py-0.5 bg-muted rounded text-xs">{location.pathname}</code> est introuvable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="border-primary/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30">
          <p className="text-xs text-muted-foreground/50 mb-4">Pages principales</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { path: '/dashboard', label: 'Dashboard' },
              { path: '/irreversa/home', label: 'IRREVERSA' },
              { path: '/nulla/home', label: 'NULLA' },
              { path: '/thresh/home', label: 'THRESH' },
              { path: '/silva/home', label: 'SILVA' },
            ].map(link => (
              <Link 
                key={link.path}
                to={link.path}
                className="px-3 py-1.5 text-xs border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;