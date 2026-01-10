import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useThresholdsDB } from '@/hooks/useThresholdsDB';
import { useAbsencesDB } from '@/hooks/useAbsencesDB';
import { useInvisibleThresholds } from '@/hooks/useInvisibleThresholds';
import { useSilvaSpaces } from '@/hooks/useSilvaSpaces';
import { useCases } from '@/hooks/useCases';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowRight, 
  Crown, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Settings,
  Zap,
  Target,
  Eye,
  Leaf
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const { user, signOut, isSubscribed } = useAuth();
  const { plan, subscription, limits } = useSubscription(user?.id);
  const { thresholds: irreversaThresholds } = useThresholdsDB(user?.id);
  const { absences } = useAbsencesDB(user?.id);
  const { thresholds: threshThresholds } = useInvisibleThresholds(user?.id);
  const { spaces: silvaSpaces } = useSilvaSpaces(user?.id);
  const { cases } = useCases(user?.id);
  
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const crossedIrreversa = irreversaThresholds.filter(t => t.is_crossed).length;
  const pendingIrreversa = irreversaThresholds.filter(t => !t.is_crossed).length;
  const totalAbsences = absences.length;
  const totalEffects = absences.reduce((acc, a) => acc + (a.effects?.length || 0), 0);
  const sensedThresh = threshThresholds.filter(t => t.sensed_at).length;
  const totalThresh = threshThresholds.length;
  const totalSilvaSpaces = silvaSpaces.length;
  const totalCases = cases.length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Handle manage subscription
  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <p className="text-muted-foreground font-body">
            Connexion requise pour accéder au tableau de bord.
          </p>
          <Link to="/exposition">
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
            ← Accueil
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
          <div className="text-center mb-12 space-y-4">
            <h1 className="font-display text-2xl md:text-3xl tracking-widest text-foreground/80">
              TABLEAU DE BORD
            </h1>
            <p className="text-muted-foreground/60 font-body text-sm max-w-md mx-auto">
              Vue centralisée de ta suite de lucidité.
            </p>
          </div>

          {/* Subscription Status Card */}
          <div className="mb-12 p-6 rounded-none border border-border/50 bg-card/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isSubscribed 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'bg-muted/20 border border-border/30'
                }`}>
                  {isSubscribed ? (
                    <Crown className="w-5 h-5 text-primary" />
                  ) : (
                    <Zap className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg tracking-wide text-foreground">
                      {isSubscribed ? 'Plan Pro' : 'Plan Free'}
                    </h2>
                    {isSubscribed ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-muted/30 text-muted-foreground rounded-full">
                        Limité
                      </span>
                    )}
                  </div>
                  {isSubscribed && subscription?.expires_at && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Renouvellement: {format(new Date(subscription.expires_at), 'PPP', { locale: fr })}
                    </p>
                  )}
                  {!isSubscribed && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {limits.cases} dossiers · {limits.thresholdsPerCase} entrées/dossier · Exports désactivés
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {isSubscribed ? (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Gérer l'abonnement
                  </Button>
                ) : (
                  <UpgradeModal 
                    trigger={
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Crown className="w-4 h-4 mr-2" />
                        Passer Pro
                      </Button>
                    }
                  />
                )}
              </div>
            </div>

            {/* Usage stats (Free only) */}
            {!isSubscribed && (
              <div className="mt-6 pt-6 border-t border-border/30 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <span className="text-2xl font-display text-foreground">{totalCases}</span>
                  <span className="text-xs text-muted-foreground/60">/{limits.cases}</span>
                  <p className="text-xs text-muted-foreground/50 mt-1">Dossiers</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-display text-primary">{crossedIrreversa + pendingIrreversa}</span>
                  <p className="text-xs text-muted-foreground/50 mt-1">Seuils IRREVERSA</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-display text-amber-500">{totalThresh}</span>
                  <p className="text-xs text-muted-foreground/50 mt-1">Entrées THRESH</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-display text-nulla">{totalAbsences}</span>
                  <p className="text-xs text-muted-foreground/50 mt-1">Absences NULLA</p>
                </div>
              </div>
            )}
          </div>

          {/* Four Modules Quick Access */}
          <h3 className="font-display text-xs tracking-[0.3em] text-muted-foreground/50 uppercase mb-6">
            Accès rapide aux modules
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            
            {/* IRREVERSA */}
            <Link 
              to="/irreversa/home"
              className="group relative p-6 rounded-none border border-border/50 hover:border-primary/30 transition-all duration-500 bg-card/20 hover:bg-card/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg tracking-wide text-foreground group-hover:text-primary transition-colors">
                      IRREVERSA
                    </h2>
                    <p className="text-xs text-muted-foreground/60">Points de non-retour</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-display text-primary">{crossedIrreversa}</span>
                  <span className="text-xs text-muted-foreground/50">franchis</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-display text-muted-foreground/40">{pendingIrreversa}</span>
                  <span className="text-xs text-muted-foreground/50">en attente</span>
                </div>
              </div>
            </Link>

            {/* THRESH */}
            <Link 
              to="/thresh/home"
              className="group relative p-6 rounded-none border border-border/50 hover:border-amber-500/30 transition-all duration-500 bg-card/20 hover:bg-card/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg tracking-wide text-foreground group-hover:text-amber-500 transition-colors">
                      THRESH
                    </h2>
                    <p className="text-xs text-muted-foreground/60">Seuils ressentis</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
              </div>
              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-display text-amber-500">{sensedThresh}</span>
                  <span className="text-xs text-muted-foreground/50">ressentis</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-display text-muted-foreground/40">{totalThresh - sensedThresh}</span>
                  <span className="text-xs text-muted-foreground/50">latents</span>
                </div>
              </div>
            </Link>

            {/* NULLA */}
            <Link 
              to="/nulla/home"
              className="group relative p-6 rounded-none border border-border/50 hover:border-nulla/30 transition-all duration-500 bg-card/20 hover:bg-card/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-nulla/30 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-nulla" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg tracking-wide text-foreground group-hover:text-nulla transition-colors">
                      NULLA
                    </h2>
                    <p className="text-xs text-muted-foreground/60">Absences structurantes</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-nulla transition-colors" />
              </div>
              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-display text-nulla">{totalAbsences}</span>
                  <span className="text-xs text-muted-foreground/50">absences</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-display text-muted-foreground/40">{totalEffects}</span>
                  <span className="text-xs text-muted-foreground/50">effets</span>
                </div>
              </div>
            </Link>

            {/* SILVA */}
            <Link 
              to="/silva/home"
              className="group relative p-6 rounded-none border border-border/50 hover:border-silva/30 transition-all duration-[1000ms] bg-card/20 hover:bg-silva/5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-silva/30 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-silva" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg tracking-wide text-foreground group-hover:text-silva transition-colors">
                      SILVA
                    </h2>
                    <p className="text-xs text-muted-foreground/60">Présence sans fonction</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-silva transition-colors" />
              </div>
              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-display text-silva">{totalSilvaSpaces}</span>
                  <span className="text-xs text-muted-foreground/50">espaces</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-display text-muted-foreground/40">∞</span>
                  <span className="text-xs text-muted-foreground/50">durée</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity / Pro Benefits */}
          {isSubscribed ? (
            <div className="p-6 border border-border/30 bg-card/10">
              <h3 className="font-display text-sm tracking-[0.2em] text-foreground/60 uppercase mb-4">
                Avantages Pro actifs
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Dossiers illimités
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Entrées illimitées
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Exports PDF
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  SILVA par dossier
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-primary/20 bg-primary/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-sm tracking-[0.2em] text-foreground uppercase mb-2">
                    Débloquer tout le potentiel
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Entrées illimitées, exports PDF, SILVA par dossier, patterns avancés...
                  </p>
                </div>
                <UpgradeModal 
                  trigger={
                    <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
                      Voir les avantages Pro
                    </Button>
                  }
                />
              </div>
            </div>
          )}

          {/* Contemplative Footer */}
          <div className="text-center pt-12 border-t border-border/20 mt-12">
            <p className="text-muted-foreground/40 font-body text-xs">
              Observer. Structurer. Laisser être.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
