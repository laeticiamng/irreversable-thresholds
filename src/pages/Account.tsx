import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlobalNav } from '@/components/GlobalNav';
import { UpgradeModal } from '@/components/UpgradeModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  User, 
  Mail, 
  Crown, 
  Calendar, 
  CreditCard, 
  Settings,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string | null;
}

export default function Account() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut, isSubscribed } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile, ensureProfile } = useProfile(user?.id);
  const { subscription, plan } = useSubscription(user?.id);
  
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Ensure profile exists on load
  useEffect(() => {
    if (user && !profileLoading && !profile) {
      ensureProfile.mutate();
    }
  }, [user, profileLoading, profile]);

  // Set display name from profile
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    } else if (user?.email) {
      setDisplayName(user.email.split('@')[0]);
    }
  }, [profile, user]);

  // Fetch payment history for subscribed users
  useEffect(() => {
    const fetchPayments = async () => {
      if (!isSubscribed || !user) return;
      setLoadingPayments(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-payment-history');
        if (error) throw error;
        if (data?.payments) {
          setPayments(data.payments);
        }
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      } finally {
        setLoadingPayments(false);
      }
    };
    fetchPayments();
  }, [isSubscribed, user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Le nom ne peut pas être vide');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({ display_name: displayName.trim() });
      toast.success('Profil mis à jour');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ouverture du portail');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary/50 font-display tracking-widest text-sm animate-pulse">
          COMPTE
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      
      {/* Header */}
      <header className="border-b border-border/50 pt-16">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link to="/dashboard" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Retour au dashboard
          </Link>
          <h1 className="font-display text-2xl tracking-wide text-foreground">
            Mon compte
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérer ton profil et ton abonnement
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        
        {/* Profile Section */}
        <section className="p-6 border border-border/50 bg-card/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg tracking-wide">Profil</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email
              </Label>
              <Input 
                id="email"
                value={user?.email || ''} 
                disabled 
                className="bg-muted/20 border-border/30"
              />
              <p className="text-xs text-muted-foreground/60">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm text-muted-foreground">
                Nom d'affichage
              </Label>
              <Input 
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ton nom"
                className="border-border/30"
              />
            </div>

            <Button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="p-6 border border-border/50 bg-card/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSubscribed 
                ? 'border border-primary/50 bg-primary/10' 
                : 'border border-border/50'
            }`}>
              <Crown className={`w-5 h-5 ${isSubscribed ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h2 className="font-display text-lg tracking-wide">Abonnement</h2>
              <span className={`text-xs px-2 py-0.5 rounded ${
                isSubscribed 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-muted/30 text-muted-foreground'
              }`}>
                {isSubscribed ? 'Pro' : 'Free'}
              </span>
            </div>
          </div>

          {isSubscribed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Abonnement actif
              </div>
              
              {subscription?.expires_at && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Prochain renouvellement: {format(new Date(subscription.expires_at), 'PPP', { locale: fr })}
                </div>
              )}

              <Button 
                variant="outline"
                onClick={handleManageSubscription}
                className="border-border/50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Gérer l'abonnement
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Passe Pro pour débloquer toutes les fonctionnalités : dossiers illimités, exports PDF, SILVA par dossier, patterns avancés...
              </p>
              <UpgradeModal 
                trigger={
                  <Button className="bg-primary hover:bg-primary/90">
                    <Crown className="w-4 h-4 mr-2" />
                    Passer Pro
                  </Button>
                }
              />
            </div>
          )}
        </section>

        {/* Payment History Section (Pro only) */}
        {isSubscribed && (
          <section className="p-6 border border-border/50 bg-card/20 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <h2 className="font-display text-lg tracking-wide">Historique des paiements</h2>
            </div>

            {loadingPayments ? (
              <div className="text-sm text-muted-foreground animate-pulse">
                Chargement...
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b border-border/20 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        payment.status === 'succeeded' ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <div>
                        <p className="text-sm text-foreground">
                          {(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.created * 1000), 'PPP', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      payment.status === 'succeeded' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted/30 text-muted-foreground'
                    }`}>
                      {payment.status === 'succeeded' ? 'Payé' : payment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Aucun paiement pour l'instant
              </p>
            )}
          </section>
        )}

        {/* Danger Zone */}
        <section className="p-6 border border-destructive/20 bg-destructive/5 space-y-4">
          <h2 className="font-display text-lg tracking-wide text-destructive/80">Zone sensible</h2>
          <Button 
            variant="outline"
            onClick={handleSignOut}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            Se déconnecter
          </Button>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8">
          <p className="text-xs text-muted-foreground/50">
            Suite de lucidité. Aucune promesse. Aucune décision à ta place.
          </p>
        </footer>
      </main>
    </div>
  );
}
