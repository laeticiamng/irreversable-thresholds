import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserSubscription, SubscriptionPlan, PLAN_LIMITS } from '@/types/database';

export function useSubscription(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
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

  // Check if user is within limits
  const canCreateCase = async (currentCaseCount: number): Promise<boolean> => {
    return currentCaseCount < limits.cases;
  };

  const canAddThreshold = async (currentThresholdCount: number): Promise<boolean> => {
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

  return {
    subscription,
    plan,
    limits,
    isLoading,
    canCreateCase,
    canAddThreshold,
    canExport,
    canUsePremiumTemplates,
    ensureSubscription,
    isPro: plan !== 'free',
  };
}
