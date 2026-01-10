import { supabase } from '@/integrations/supabase/client';

type NotificationType = 'info' | 'warning' | 'success' | 'action';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  module?: string;
  caseId?: string;
  actionUrl?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'info',
  module,
  caseId,
  actionUrl,
}: CreateNotificationParams) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type,
    module: module || null,
    case_id: caseId || null,
    action_url: actionUrl || null,
  });

  if (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Notify user when a threshold is crossed
 */
export async function notifyThresholdCrossed(
  userId: string,
  thresholdTitle: string,
  caseId?: string
) {
  await createNotification({
    userId,
    title: 'Seuil franchi',
    message: `Le seuil "${thresholdTitle}" a été marqué comme franchi.`,
    type: 'success',
    module: 'irreversa',
    caseId,
    actionUrl: caseId ? `/irreversa/cases/${caseId}` : '/irreversa/cases',
  });
}

/**
 * Notify user when a THRESH threshold is sensed
 */
export async function notifyThresholdSensed(
  userId: string,
  thresholdTitle: string,
  caseId?: string
) {
  await createNotification({
    userId,
    title: 'Seuil ressenti',
    message: `Le seuil "${thresholdTitle}" a été marqué comme ressenti.`,
    type: 'success',
    module: 'thresh',
    caseId,
    actionUrl: caseId ? `/thresh/cases/${caseId}` : '/thresh/cases',
  });
}

/**
 * Notify user of reaching free tier limits
 */
export async function notifyFreeTierLimit(
  userId: string,
  module: 'irreversa' | 'nulla' | 'thresh',
  limitType: string
) {
  const moduleName = {
    irreversa: 'IRREVERSA',
    nulla: 'NULLA',
    thresh: 'THRESH',
  }[module];

  await createNotification({
    userId,
    title: 'Limite atteinte',
    message: `Tu as atteint la limite ${limitType} du plan Free pour ${moduleName}. Passe Pro pour continuer.`,
    type: 'warning',
    module,
    actionUrl: '/account',
  });
}

/**
 * Welcome notification for new users
 */
export async function notifyWelcome(userId: string) {
  await createNotification({
    userId,
    title: 'Bienvenue dans la Suite',
    message: 'Explore les 4 territoires et commence à structurer ta réflexion.',
    type: 'info',
    actionUrl: '/onboarding',
  });
}

/**
 * Notify user of AI assist completion
 */
export async function notifyAIComplete(
  userId: string,
  module: string,
  caseId?: string
) {
  await createNotification({
    userId,
    title: 'Suggestion IA disponible',
    message: `L'assistant IA a généré des suggestions pour ton dossier.`,
    type: 'action',
    module,
    caseId,
    actionUrl: caseId ? `/${module}/cases/${caseId}` : `/${module}/home`,
  });
}
