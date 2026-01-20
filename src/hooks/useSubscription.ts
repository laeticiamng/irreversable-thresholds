import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserSubscription, SubscriptionPlan, PLAN_LIMITS } from '@/types/database';
import { toast } from 'sonner';

// Plan pricing information
export const PLAN_PRICING: Record<SubscriptionPlan, { monthly: number; yearly: number; name: string; description: string }> = {
  free: {
    monthly: 0,
    yearly: 0,
    name: 'Gratuit',
    description: 'Pour découvrir la plateforme',
  },
  pro: {
    monthly: 9,
    yearly: 90,
    name: 'Pro',
    description: 'Pour les utilisateurs individuels',
  },
  team: {
    monthly: 29,
    yearly: 290,
    name: 'Team',
    description: 'Pour les équipes jusqu\'à 10 membres',
  },
  enterprise: {
    monthly: 99,
    yearly: 990,
    name: 'Enterprise',
    description: 'Solutions sur mesure pour grandes organisations',
  },
};

// Plan features
export const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  free: [
    '1 dossier',
    '3 seuils par dossier',
    'Modules de base',
    'Support communautaire',
  ],
  pro: [
    'Dossiers illimités',
    'Seuils illimités',
    'Export PDF et JSON',
    'Templates premium',
    'Assistant IA',
    'Support prioritaire',
  ],
  team: [
    'Tout Pro inclus',
    'Jusqu\'à 10 membres',
    'Gestion d\'équipe',
    'Collaboration en temps réel',
    'Tableau de bord d\'équipe',
    'Support dédié',
  ],
  enterprise: [
    'Tout Team inclus',
    'Membres illimités',
    'SSO / SAML',
    'API dédiée',
    'SLA garanti',
    'Gestionnaire de compte dédié',
  ],
};

export function useSubscription(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as UserSubscription | null;
    },
    enabled: !!userId,
  });

  // Get current plan (default to free if no subscription)
  const plan: SubscriptionPlan = subscription?.plan || 'free';
  const limits = PLAN_LIMITS[plan];
  const pricing = PLAN_PRICING[plan];
  const features = PLAN_FEATURES[plan];

  // Check if subscription is active
  const isActive = !subscription?.expires_at || new Date(subscription.expires_at) > new Date();

  // Days until expiration
  const daysUntilExpiration = subscription?.expires_at
    ? Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Check if user is within limits
  const canCreateCase = (currentCaseCount: number): boolean => {
    return currentCaseCount < limits.cases;
  };

  const canAddThreshold = (currentThresholdCount: number): boolean => {
    return currentThresholdCount < limits.thresholdsPerCase;
  };

  const canExport = limits.exports;
  const canUsePremiumTemplates = limits.premiumTemplates;

  // Create default free subscription if none exists
  const ensureSubscription = useMutation({
    mutationFn: async () => {
      if (!userId || subscription) return;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([{ user_id: userId, plan: 'free' }])
        .select()
        .single();

      if (error && !error.message.includes('duplicate')) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
    },
  });

  // Upgrade subscription (calls Stripe checkout)
  const upgradeSubscription = useMutation({
    mutationFn: async ({ newPlan, billingPeriod }: { newPlan: SubscriptionPlan; billingPeriod: 'monthly' | 'yearly' }) => {
      if (!userId) throw new Error('Not authenticated');
      if (newPlan === 'free') throw new Error('Cannot upgrade to free plan');

      // Call Supabase Edge Function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          userId,
          plan: newPlan,
          billingPeriod,
          successUrl: `${window.location.origin}/settings?checkout=success`,
          cancelUrl: `${window.location.origin}/settings?checkout=cancel`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error('Erreur lors de la création de la session de paiement');
    },
  });

  // Open customer portal (for managing existing subscription)
  const openCustomerPortal = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          userId,
          returnUrl: `${window.location.origin}/settings`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error('Erreur lors de l\'accès au portail client');
    },
  });

  // Cancel subscription
  const cancelSubscription = useMutation({
    mutationFn: async () => {
      if (!userId || !subscription) throw new Error('No active subscription');

      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: { userId },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
      toast.success('Abonnement annulé. Il restera actif jusqu\'à la fin de la période.');
    },
    onError: () => {
      toast.error('Erreur lors de l\'annulation de l\'abonnement');
    },
  });

  // Check if can upgrade to a specific plan
  const canUpgradeTo = (targetPlan: SubscriptionPlan): boolean => {
    const planOrder: SubscriptionPlan[] = ['free', 'pro', 'team', 'enterprise'];
    const currentIndex = planOrder.indexOf(plan);
    const targetIndex = planOrder.indexOf(targetPlan);
    return targetIndex > currentIndex;
  };

  return {
    subscription,
    plan,
    limits,
    pricing,
    features,
    isLoading,
    error,
    isActive,
    daysUntilExpiration,
    canCreateCase,
    canAddThreshold,
    canExport,
    canUsePremiumTemplates,
    ensureSubscription,
    upgradeSubscription,
    openCustomerPortal,
    cancelSubscription,
    canUpgradeTo,
    isPro: plan !== 'free',
    isTeam: plan === 'team' || plan === 'enterprise',
    isEnterprise: plan === 'enterprise',
  };
}
