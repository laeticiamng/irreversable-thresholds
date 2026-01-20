import { useAuth } from '@/hooks/useAuth';
import { useSubscription, PLAN_PRICING, PLAN_FEATURES } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Check, CreditCard, Calendar, AlertTriangle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SubscriptionManagerProps {
  showUpgradePrompt?: boolean;
}

export function SubscriptionManager({ showUpgradePrompt = true }: SubscriptionManagerProps) {
  const { user } = useAuth();
  const {
    subscription,
    plan,
    pricing,
    features,
    isLoading,
    isActive,
    daysUntilExpiration,
    openCustomerPortal,
    cancelSubscription,
    isPro,
  } = useSubscription(user?.id);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-10 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Votre abonnement
              </CardTitle>
              <CardDescription>
                Gérez votre abonnement et vos informations de paiement
              </CardDescription>
            </div>
            <Badge variant={isPro ? 'default' : 'secondary'} className={isPro ? 'bg-amber-500 text-black' : ''}>
              {pricing.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plan actuel</span>
              <span className="font-medium">{pricing.name}</span>
            </div>

            {subscription?.started_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date de début</span>
                <span className="text-sm">
                  {format(new Date(subscription.started_at), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            )}

            {subscription?.expires_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prochaine facturation</span>
                <span className="text-sm">
                  {format(new Date(subscription.expires_at), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            )}

            {daysUntilExpiration !== null && daysUntilExpiration <= 7 && isActive && (
              <div className="flex items-center gap-2 text-sm text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                <span>Votre abonnement expire dans {daysUntilExpiration} jours</span>
              </div>
            )}

            {!isActive && subscription && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span>Votre abonnement a expiré</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Features included */}
          <div>
            <h4 className="text-sm font-medium mb-3">Inclus dans votre plan</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {isPro && (
              <Button
                variant="outline"
                onClick={() => openCustomerPortal.mutate()}
                disabled={openCustomerPortal.isPending}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {openCustomerPortal.isPending ? 'Chargement...' : 'Gérer l\'abonnement'}
              </Button>
            )}

            {isPro && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-destructive hover:text-destructive">
                    Annuler l'abonnement
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Annuler votre abonnement ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Votre abonnement restera actif jusqu'à la fin de la période de facturation en cours.
                      Après cela, vous serez rétrogradé au plan gratuit avec ses limitations.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Garder mon abonnement</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelSubscription.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {cancelSubscription.isPending ? 'Annulation...' : 'Confirmer l\'annulation'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Card (for free plan) */}
      {!isPro && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Utilisation</CardTitle>
            <CardDescription>Votre utilisation par rapport aux limites du plan gratuit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dossiers</span>
                <span>0 / 1</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seuils par dossier</span>
                <span>0 / 3</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade prompt */}
      {showUpgradePrompt && !isPro && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-medium mb-1">Passez à Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Débloquez des dossiers illimités, l'export et bien plus encore.
                </p>
              </div>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                Voir les plans
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
