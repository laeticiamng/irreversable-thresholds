import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useThresholdsDB } from '@/hooks/useThresholdsDB';
import { useAbsencesDB } from '@/hooks/useAbsencesDB';
import { useInvisibleThresholds } from '@/hooks/useInvisibleThresholds';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { thresholds: irreversaThresholds } = useThresholdsDB(user?.id);
  const { absences } = useAbsencesDB(user?.id);
  const { thresholds: invisibleThresholds } = useInvisibleThresholds(user?.id);
  
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const crossed = irreversaThresholds.filter(t => t.is_crossed).length;
  const pending = irreversaThresholds.filter(t => !t.is_crossed).length;
  const totalAbsences = absences.length;
  const totalEffects = absences.reduce((acc, a) => acc + (a.effects?.length || 0), 0);
  const sensed = invisibleThresholds.filter(t => t.sensed_at).length;
  const unsensed = invisibleThresholds.filter(t => !t.sensed_at).length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <p className="text-muted-foreground font-body">
            Connexion requise pour accéder au tableau de bord.
          </p>
          <Link to="/auth">
            <Button variant="monument">Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background transition-opacity duration-[2000ms] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-10 border-b border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase hover:text-foreground transition-colors">
            ← Territoires
          </Link>
          <span className="text-xs font-mono text-muted-foreground/50">
            {formatTime(time)}
          </span>
          <button
            onClick={() => signOut()}
            className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Title */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="font-display text-2xl md:text-3xl tracking-widest text-foreground/80">
              SYNTHÈSE
            </h1>
            <p className="text-muted-foreground/60 font-body text-sm max-w-md mx-auto">
              Vue contemplative des quatre territoires.
              <br />
              Observer sans intervenir.
            </p>
          </div>

          {/* Four Systems - Interconnected Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            
            {/* IRREVERSA */}
            <Link 
              to="/irreversa"
              className="group relative p-8 rounded-none border border-border/50 hover:border-primary/30 transition-all duration-700 bg-card/20 hover:bg-card/40"
            >
              <div className="space-y-6">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-xl tracking-wide text-foreground group-hover:text-primary transition-colors duration-500">
                    IRREVERSA
                  </h2>
                  <span className="text-xs font-mono text-muted-foreground/50">seuils</span>
                </div>
                
                <p className="text-muted-foreground/70 font-body text-sm leading-relaxed">
                  Les points de non-retour. Ce qui, une fois franchi, ne peut être défait.
                </p>

                <div className="flex items-end justify-between pt-4 border-t border-border/30">
                  <div className="space-y-1">
                    <span className="text-3xl font-display text-primary">{crossed}</span>
                    <p className="text-xs text-muted-foreground/50">franchis</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-3xl font-display text-muted-foreground/40">{pending}</span>
                    <p className="text-xs text-muted-foreground/50">en attente</p>
                  </div>
                </div>
              </div>

              {/* Connection line to THRESH */}
              <div className="hidden lg:block absolute -right-4 top-1/2 w-8 h-px bg-gradient-to-r from-primary/20 to-amber-500/20" />
            </Link>

            {/* THRESH */}
            <Link 
              to="/thresh"
              className="group relative p-8 rounded-none border border-border/50 hover:border-amber-500/30 transition-all duration-700 bg-card/20 hover:bg-card/40"
            >
              <div className="space-y-6">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-xl tracking-wide text-foreground group-hover:text-amber-500 transition-colors duration-500">
                    THRESH
                  </h2>
                  <span className="text-xs font-mono text-muted-foreground/50">invisibles</span>
                </div>
                
                <p className="text-muted-foreground/70 font-body text-sm leading-relaxed">
                  Les seuils qu'on ressent sans les voir. L'intuition des transitions.
                </p>

                <div className="flex items-end justify-between pt-4 border-t border-border/30">
                  <div className="space-y-1">
                    <span className="text-3xl font-display text-amber-500">{sensed}</span>
                    <p className="text-xs text-muted-foreground/50">ressentis</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-3xl font-display text-muted-foreground/40">{unsensed}</span>
                    <p className="text-xs text-muted-foreground/50">latents</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* NULLA */}
            <Link 
              to="/nulla"
              className="group relative p-8 rounded-none border border-border/50 hover:border-nulla/30 transition-all duration-700 bg-card/20 hover:bg-card/40"
            >
              <div className="space-y-6">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-xl tracking-wide text-foreground group-hover:text-nulla transition-colors duration-500">
                    NULLA
                  </h2>
                  <span className="text-xs font-mono text-muted-foreground/50">absences</span>
                </div>
                
                <p className="text-muted-foreground/70 font-body text-sm leading-relaxed">
                  Ce qui n'existe pas mais structure. L'espace négatif du réel.
                </p>

                <div className="flex items-end justify-between pt-4 border-t border-border/30">
                  <div className="space-y-1">
                    <span className="text-3xl font-display text-nulla">{totalAbsences}</span>
                    <p className="text-xs text-muted-foreground/50">absences</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-3xl font-display text-muted-foreground/40">{totalEffects}</span>
                    <p className="text-xs text-muted-foreground/50">effets</p>
                  </div>
                </div>
              </div>

              {/* Connection line to SILVA */}
              <div className="hidden lg:block absolute -right-4 top-1/2 w-8 h-px bg-gradient-to-r from-nulla/20 to-silva/20" />
            </Link>

            {/* SILVA */}
            <Link 
              to="/silva"
              className="group relative p-8 rounded-none border border-border/50 hover:border-silva/30 transition-all duration-[1500ms] bg-card/20 hover:bg-silva/5"
            >
              <div className="space-y-6">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-xl tracking-wide text-foreground group-hover:text-silva-foreground transition-colors duration-[1500ms]">
                    SILVA
                  </h2>
                  <span className="text-xs font-mono text-muted-foreground/50">milieu</span>
                </div>
                
                <p className="text-muted-foreground/70 font-body text-sm leading-relaxed">
                  L'espace qui ne fait rien. Présence structurante sans intervention.
                </p>

                <div className="flex items-end justify-between pt-4 border-t border-border/30">
                  <div className="space-y-1">
                    <span className="text-3xl font-display text-silva-foreground/60">∞</span>
                    <p className="text-xs text-muted-foreground/50">durée</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-3xl font-display text-muted-foreground/40">—</span>
                    <p className="text-xs text-muted-foreground/50">sans mesure</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Interconnection Diagram */}
          <div className="relative py-16 border-t border-border/30">
            <div className="text-center space-y-8">
              <h3 className="text-xs font-display tracking-[0.3em] text-muted-foreground/50 uppercase">
                Topologie des territoires
              </h3>
              
              <div className="max-w-lg mx-auto">
                <svg viewBox="0 0 400 200" className="w-full h-auto opacity-40">
                  {/* Connection lines */}
                  <line x1="100" y1="50" x2="300" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
                  <line x1="100" y1="150" x2="300" y2="150" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
                  <line x1="100" y1="50" x2="100" y2="150" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
                  <line x1="300" y1="50" x2="300" y2="150" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
                  <line x1="100" y1="50" x2="300" y2="150" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4,4" className="text-muted-foreground/20" />
                  <line x1="300" y1="50" x2="100" y2="150" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4,4" className="text-muted-foreground/20" />
                  
                  {/* Nodes */}
                  <circle cx="100" cy="50" r="4" className="fill-primary" />
                  <circle cx="300" cy="50" r="4" className="fill-amber-500" />
                  <circle cx="100" cy="150" r="4" className="fill-nulla" />
                  <circle cx="300" cy="150" r="4" className="fill-silva" />
                  
                  {/* Labels */}
                  <text x="100" y="30" textAnchor="middle" className="fill-muted-foreground text-[8px] font-display">IRREVERSA</text>
                  <text x="300" y="30" textAnchor="middle" className="fill-muted-foreground text-[8px] font-display">THRESH</text>
                  <text x="100" y="180" textAnchor="middle" className="fill-muted-foreground text-[8px] font-display">NULLA</text>
                  <text x="300" y="180" textAnchor="middle" className="fill-muted-foreground text-[8px] font-display">SILVA</text>
                  
                  {/* Center point */}
                  <circle cx="200" cy="100" r="2" className="fill-foreground/20" />
                </svg>
              </div>

              <p className="text-muted-foreground/50 font-body text-xs max-w-sm mx-auto">
                Chaque territoire dialogue avec les autres.
                <br />
                Le centre reste vide — espace de convergence sans synthèse.
              </p>
            </div>
          </div>

          {/* Contemplative Footer */}
          <div className="text-center pt-8 border-t border-border/20">
            <p className="text-muted-foreground/40 font-body text-xs">
              Observer. Ne pas intervenir. Laisser être.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
