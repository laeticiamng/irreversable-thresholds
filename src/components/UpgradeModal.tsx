import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, Lock, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function UpgradeModal({ trigger, onSuccess }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour passer Pro.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session de paiement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: '∞', title: 'Dossiers illimités', desc: 'Créez autant de dossiers que nécessaire' },
    { icon: '∞', title: 'Seuils illimités', desc: 'Aucune limite par dossier' },
    { icon: '📄', title: 'Exports PDF', desc: 'Rapports professionnels exportables' },
    { icon: '★', title: 'Templates Premium', desc: '8 modèles prêts à l\'emploi' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-primary/30 text-primary">
            <Sparkles className="w-4 h-4 mr-2" />
            Passer Pro
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            Débloquer IRREVERSA Pro
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Accès complet à tous les outils de cartographie irréversible.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Price */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-display text-primary">9,90€</span>
              <span className="text-muted-foreground">/mois</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Annulable à tout moment
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border border-primary/10 bg-primary/5">
                <span className="text-lg text-primary">{feature.icon}</span>
                <div>
                  <div className="font-medium text-foreground text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button 
            onClick={handleUpgrade} 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Débloquer Pro
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground/60 mt-4">
            Paiement sécurisé via Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple button for inline usage
export function UpgradeButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour passer Pro.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session de paiement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleUpgrade} 
      disabled={loading}
      variant="outline"
      className={className || "border-primary/30 text-primary hover:bg-primary/10"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Passer Pro
        </>
      )}
    </Button>
  );
}

// Manage subscription button for Pro users
export function ManageSubscriptionButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleManage = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le portail de gestion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleManage} 
      disabled={loading}
      variant="ghost"
      className={className || "text-muted-foreground hover:text-foreground"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        "Gérer l'abonnement"
      )}
    </Button>
  );
}
