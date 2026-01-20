import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription, PLAN_PRICING, PLAN_FEATURES } from '@/hooks/useSubscription';
import { SubscriptionPlan } from '@/types/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Star, Users, Building2, Zap } from 'lucide-react';

const PLAN_ICONS: Record<SubscriptionPlan, React.ReactNode> = {
  free: <Zap className="w-5 h-5" />,
  pro: <Star className="w-5 h-5" />,
  team: <Users className="w-5 h-5" />,
  enterprise: <Building2 className="w-5 h-5" />,
};

interface PricingTableProps {
  onSelect?: (plan: SubscriptionPlan) => void;
  showCurrentPlan?: boolean;
}

export function PricingTable({ onSelect, showCurrentPlan = true }: PricingTableProps) {
  const { user } = useAuth();
  const { plan: currentPlan, upgradeSubscription, canUpgradeTo, isLoading } = useSubscription(user?.id);
  const [isYearly, setIsYearly] = useState(true);

  const plans: SubscriptionPlan[] = ['free', 'pro', 'team', 'enterprise'];

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (onSelect) {
      onSelect(plan);
      return;
    }

    if (plan === 'free' || plan === currentPlan) return;

    upgradeSubscription.mutate({
      newPlan: plan,
      billingPeriod: isYearly ? 'yearly' : 'monthly',
    });
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return 'Plan actuel';
    if (plan === 'free') return 'Gratuit';
    if (plan === 'enterprise') return 'Contactez-nous';
    if (canUpgradeTo(plan)) return 'Choisir ce plan';
    return 'Inclus dans votre plan';
  };

  const isButtonDisabled = (plan: SubscriptionPlan) => {
    return plan === currentPlan || (plan !== 'enterprise' && !canUpgradeTo(plan));
  };

  return (
    <div className="space-y-8">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label htmlFor="billing-toggle" className={!isYearly ? 'text-foreground' : 'text-muted-foreground'}>
          Mensuel
        </Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Label htmlFor="billing-toggle" className={isYearly ? 'text-foreground' : 'text-muted-foreground'}>
          Annuel
          <Badge variant="secondary" className="ml-2 text-xs">-17%</Badge>
        </Label>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const pricing = PLAN_PRICING[plan];
          const features = PLAN_FEATURES[plan];
          const isCurrentPlan = plan === currentPlan && showCurrentPlan;
          const isPro = plan === 'pro';

          return (
            <Card
              key={plan}
              className={`relative border-2 transition-all ${
                isCurrentPlan
                  ? 'border-primary bg-primary/5'
                  : isPro
                  ? 'border-amber-500/50 bg-amber-500/5'
                  : 'border-border hover:border-border/80'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-500 text-black">
                    Populaire
                  </Badge>
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="outline" className="border-primary text-primary bg-background">
                    Votre plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pt-8">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
                  isPro ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'
                }`}>
                  {PLAN_ICONS[plan]}
                </div>
                <CardTitle className="text-lg">{pricing.name}</CardTitle>
                <CardDescription className="text-xs">{pricing.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-6">
                  {plan === 'enterprise' ? (
                    <span className="text-2xl font-bold">Sur devis</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">
                        {isYearly ? Math.round(pricing.yearly / 12) : pricing.monthly}€
                      </span>
                      {pricing.monthly > 0 && (
                        <span className="text-muted-foreground text-sm">/mois</span>
                      )}
                    </>
                  )}
                </div>

                <ul className="space-y-2 text-left">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isPro ? 'text-amber-500' : 'text-primary'
                      }`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    isPro
                      ? 'bg-amber-500 hover:bg-amber-600 text-black'
                      : ''
                  }`}
                  variant={isCurrentPlan ? 'outline' : isPro ? 'default' : 'secondary'}
                  disabled={isButtonDisabled(plan) || isLoading}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {upgradeSubscription.isPending ? 'Chargement...' : getButtonText(plan)}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground">
        Tous les prix sont en euros, hors taxes.
        {isYearly && ' La facturation annuelle permet d\'économiser 2 mois.'}
      </p>
    </div>
  );
}
