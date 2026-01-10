import { Link, Navigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';

// Animation variants with proper types
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
    },
  },
};

const footerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      delay: 0.8,
      duration: 0.6,
    },
  },
};

export default function Home() {
  const { user, loading, signOut } = useAuth();

  // Redirect authenticated users to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Minimal, silent */}
      <motion.header 
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="border-b border-border/30"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
          <span className="font-display text-base sm:text-lg tracking-[0.2em] text-foreground">
            QUATRE TERRITOIRES
          </span>
          <div className="flex items-center gap-4">
            <ThemeToggle />
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
        </div>
      </motion.header>

      {/* Main - The Four Territories Grid */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl">
          {/* Grid 2x2 */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/30"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            
            {/* IRREVERSA */}
            <motion.div variants={cardVariants}>
              <Link
                to="/irreversa"
                className="group relative aspect-square sm:aspect-auto sm:min-h-[280px] md:min-h-[320px] bg-background p-6 sm:p-8 md:p-10 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset block"
              >
                <motion.div
                  className="absolute inset-0 bg-primary/0"
                  whileHover={{ backgroundColor: 'hsl(var(--primary) / 0.08)' }}
                  transition={{ duration: 0.4 }}
                />
                
                {/* Corner accent */}
                <motion.div 
                  className="absolute top-0 left-0 border-t-[24px] border-l-[24px] border-t-transparent border-l-transparent"
                  whileHover={{ 
                    borderTopColor: 'hsl(var(--primary) / 0.5)',
                    borderLeftColor: 'hsl(var(--primary) / 0.5)',
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="space-y-3 sm:space-y-4 relative z-10">
                  <motion.h2 
                    className="font-display text-xl sm:text-2xl tracking-wide text-foreground"
                    whileHover={{ color: 'hsl(var(--primary))', x: 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    IRREVERSA
                  </motion.h2>
                  <p className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed max-w-xs">
                    Les seuils que l'on franchit
                  </p>
                </div>
                
                <motion.p 
                  className="text-muted-foreground/40 font-body text-xs relative z-10"
                  whileHover={{ color: 'hsl(var(--muted-foreground) / 0.7)' }}
                  transition={{ duration: 0.3 }}
                >
                  Ce qui est fait ne peut être défait
                </motion.p>
              </Link>
            </motion.div>

            {/* NULLA */}
            <motion.div variants={cardVariants}>
              <Link
                to="/nulla"
                className="group relative aspect-square sm:aspect-auto sm:min-h-[280px] md:min-h-[320px] bg-background p-6 sm:p-8 md:p-10 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nulla focus-visible:ring-inset block"
              >
                <motion.div
                  className="absolute inset-0 bg-nulla/0"
                  whileHover={{ backgroundColor: 'hsl(var(--nulla) / 0.08)' }}
                  transition={{ duration: 0.4 }}
                />
                
                <motion.div 
                  className="absolute top-0 right-0 border-t-[24px] border-r-[24px] border-t-transparent border-r-transparent"
                  whileHover={{ 
                    borderTopColor: 'hsl(var(--nulla) / 0.5)',
                    borderRightColor: 'hsl(var(--nulla) / 0.5)',
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="space-y-3 sm:space-y-4 relative z-10">
                  <motion.h2 
                    className="font-display text-xl sm:text-2xl tracking-wide text-foreground"
                    whileHover={{ color: 'hsl(var(--nulla))', x: 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    NULLA
                  </motion.h2>
                  <p className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed max-w-xs">
                    Les absences qui structurent
                  </p>
                </div>
                
                <motion.p 
                  className="text-muted-foreground/40 font-body text-xs relative z-10"
                  whileHover={{ color: 'hsl(var(--muted-foreground) / 0.7)' }}
                  transition={{ duration: 0.3 }}
                >
                  Ce qui n'existe pas
                </motion.p>
              </Link>
            </motion.div>

            {/* THRESH */}
            <motion.div variants={cardVariants}>
              <Link
                to="/thresh"
                className="group relative aspect-square sm:aspect-auto sm:min-h-[280px] md:min-h-[320px] bg-background p-6 sm:p-8 md:p-10 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset block"
              >
                <motion.div
                  className="absolute inset-0 bg-amber-500/0"
                  whileHover={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }}
                  transition={{ duration: 0.4 }}
                />
                
                <motion.div 
                  className="absolute bottom-0 left-0 border-b-[24px] border-l-[24px] border-b-transparent border-l-transparent"
                  whileHover={{ 
                    borderBottomColor: 'rgba(245, 158, 11, 0.5)',
                    borderLeftColor: 'rgba(245, 158, 11, 0.5)',
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="space-y-3 sm:space-y-4 relative z-10">
                  <motion.h2 
                    className="font-display text-xl sm:text-2xl tracking-wide text-foreground"
                    whileHover={{ color: 'rgb(245, 158, 11)', x: 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    THRESH
                  </motion.h2>
                  <p className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed max-w-xs">
                    Les seuils ressentis, non mesurés
                  </p>
                </div>
                
                <motion.p 
                  className="text-muted-foreground/40 font-body text-xs relative z-10"
                  whileHover={{ color: 'hsl(var(--muted-foreground) / 0.7)' }}
                  transition={{ duration: 0.3 }}
                >
                  L'intuition des transitions
                </motion.p>
              </Link>
            </motion.div>

            {/* SILVA */}
            <motion.div variants={cardVariants}>
              <Link
                to="/silva"
                className="group relative aspect-square sm:aspect-auto sm:min-h-[280px] md:min-h-[320px] bg-background p-6 sm:p-8 md:p-10 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silva focus-visible:ring-inset block"
              >
                <motion.div
                  className="absolute inset-0 bg-silva/0"
                  whileHover={{ backgroundColor: 'hsl(var(--silva) / 0.08)' }}
                  transition={{ duration: 0.6 }}
                />
                
                <motion.div 
                  className="absolute bottom-0 right-0 border-b-[24px] border-r-[24px] border-b-transparent border-r-transparent"
                  whileHover={{ 
                    borderBottomColor: 'hsl(var(--silva) / 0.5)',
                    borderRightColor: 'hsl(var(--silva) / 0.5)',
                  }}
                  transition={{ duration: 0.4 }}
                />
                
                <div className="space-y-3 sm:space-y-4 relative z-10">
                  <motion.h2 
                    className="font-display text-xl sm:text-2xl tracking-wide text-foreground"
                    whileHover={{ color: 'hsl(var(--silva))', x: 4 }}
                    transition={{ duration: 0.4 }}
                  >
                    SILVA
                  </motion.h2>
                  <p className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed max-w-xs">
                    Le milieu, l'espace qui ne fait rien
                  </p>
                </div>
                
                <motion.p 
                  className="text-muted-foreground/40 font-body text-xs relative z-10"
                  whileHover={{ color: 'hsl(var(--muted-foreground) / 0.7)' }}
                  transition={{ duration: 0.4 }}
                >
                  Présence sans fonction
                </motion.p>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Quick Actions for returning users */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 pb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Link to="/irreversa/home" className="group">
            <motion.div
              className="p-3 sm:p-4 border border-primary/20 bg-primary/5 text-center hover:bg-primary/10"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-xs sm:text-sm font-display text-primary/80 group-hover:text-primary">IRREVERSA</span>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Seuils franchis</p>
            </motion.div>
          </Link>
          <Link to="/thresh/home" className="group">
            <motion.div
              className="p-3 sm:p-4 border border-amber-500/20 bg-amber-500/5 text-center hover:bg-amber-500/10"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-xs sm:text-sm font-display text-amber-500/80 group-hover:text-amber-500">THRESH</span>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Seuils ressentis</p>
            </motion.div>
          </Link>
          <Link to="/nulla/home" className="group">
            <motion.div
              className="p-3 sm:p-4 border border-nulla/20 bg-nulla/5 text-center hover:bg-nulla/10"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-xs sm:text-sm font-display text-nulla/80 group-hover:text-nulla">NULLA</span>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Absences</p>
            </motion.div>
          </Link>
          <Link to="/silva/home" className="group">
            <motion.div
              className="p-3 sm:p-4 border border-silva/20 bg-silva/5 text-center hover:bg-silva/10"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-xs sm:text-sm font-display text-silva/80 group-hover:text-silva">SILVA</span>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Espace neutre</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Onboarding CTA */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Link
          to="/onboarding"
          className="block w-full group"
        >
          <motion.div
            className="p-4 sm:p-6 border border-dashed border-primary/30 bg-primary/5 text-center"
            whileHover={{ 
              borderColor: 'hsl(var(--primary) / 0.6)',
              backgroundColor: 'hsl(var(--primary) / 0.1)',
              scale: 1.01,
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.p 
              className="font-display text-sm tracking-[0.15em] text-primary/70"
              whileHover={{ color: 'hsl(var(--primary))' }}
            >
              ✨ NOUVEAU ICI ?
            </motion.p>
            <p className="text-muted-foreground text-xs mt-2">
              Découvrez les 4 territoires et comment les utiliser
            </p>
          </motion.div>
        </Link>
      </motion.div>

      {/* Footer - Silent */}
      <motion.footer 
        className="border-t border-border/20 py-6 sm:py-8"
        variants={footerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground/40 font-body text-xs text-center sm:text-left">
            Pour ceux qui acceptent la réalité telle qu'elle est.
          </p>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/onboarding"
              className="text-xs font-body text-primary/50 hover:text-primary transition-colors"
            >
              Premiers pas
            </Link>
            <Link
              to="/suite"
              className="text-xs font-body text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
            >
              La Suite
            </Link>
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
      </motion.footer>
    </div>
  );
}
