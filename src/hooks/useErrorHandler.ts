import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export interface AppError {
  code: string;
  message: string;
  details?: string;
  retryable?: boolean;
}

// Error codes and their user-friendly messages
const ERROR_MESSAGES: Record<string, { title: string; message: string; retryable: boolean }> = {
  // Authentication errors
  auth_invalid_credentials: {
    title: 'Identifiants invalides',
    message: 'Email ou mot de passe incorrect. Vérifie tes identifiants et réessaie.',
    retryable: true,
  },
  auth_session_expired: {
    title: 'Session expirée',
    message: 'Ta session a expiré. Reconnecte-toi pour continuer.',
    retryable: false,
  },
  auth_email_not_verified: {
    title: 'Email non vérifié',
    message: 'Vérifie ton email avant de te connecter.',
    retryable: false,
  },
  auth_user_not_found: {
    title: 'Utilisateur introuvable',
    message: 'Aucun compte associé à cet email.',
    retryable: false,
  },

  // Network errors
  network_offline: {
    title: 'Hors ligne',
    message: 'Tu es actuellement hors ligne. Vérifie ta connexion internet.',
    retryable: true,
  },
  network_timeout: {
    title: 'Délai dépassé',
    message: 'La requête a pris trop de temps. Réessaie.',
    retryable: true,
  },
  network_error: {
    title: 'Erreur réseau',
    message: 'Impossible de contacter le serveur. Vérifie ta connexion.',
    retryable: true,
  },

  // Permission errors
  permission_denied: {
    title: 'Accès refusé',
    message: 'Tu n\'as pas les permissions nécessaires pour cette action.',
    retryable: false,
  },
  subscription_required: {
    title: 'Abonnement requis',
    message: 'Cette fonctionnalité nécessite un abonnement Pro.',
    retryable: false,
  },
  limit_reached: {
    title: 'Limite atteinte',
    message: 'Tu as atteint la limite de ton plan. Passe à Pro pour continuer.',
    retryable: false,
  },

  // Data errors
  data_not_found: {
    title: 'Introuvable',
    message: 'L\'élément demandé n\'existe pas ou a été supprimé.',
    retryable: false,
  },
  data_validation: {
    title: 'Données invalides',
    message: 'Les données fournies ne sont pas valides. Vérifie le formulaire.',
    retryable: true,
  },
  data_conflict: {
    title: 'Conflit',
    message: 'Cette ressource a été modifiée. Actualise et réessaie.',
    retryable: true,
  },

  // Server errors
  server_error: {
    title: 'Erreur serveur',
    message: 'Une erreur inattendue s\'est produite. Réessaie plus tard.',
    retryable: true,
  },
  maintenance: {
    title: 'Maintenance',
    message: 'Le service est temporairement indisponible pour maintenance.',
    retryable: false,
  },

  // Generic
  unknown: {
    title: 'Erreur',
    message: 'Une erreur inattendue s\'est produite.',
    retryable: true,
  },
};

// Map Supabase/API errors to our error codes
function mapErrorToCode(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Auth errors
    if (message.includes('invalid login credentials')) return 'auth_invalid_credentials';
    if (message.includes('session') && message.includes('expired')) return 'auth_session_expired';
    if (message.includes('email not confirmed')) return 'auth_email_not_verified';
    if (message.includes('user not found')) return 'auth_user_not_found';

    // Network errors
    if (message.includes('network') || message.includes('fetch')) return 'network_error';
    if (message.includes('timeout')) return 'network_timeout';
    if (!navigator.onLine) return 'network_offline';

    // Permission errors
    if (message.includes('permission') || message.includes('denied') || message.includes('403')) return 'permission_denied';
    if (message.includes('subscription')) return 'subscription_required';
    if (message.includes('limit')) return 'limit_reached';

    // Data errors
    if (message.includes('not found') || message.includes('404')) return 'data_not_found';
    if (message.includes('validation') || message.includes('invalid')) return 'data_validation';
    if (message.includes('conflict') || message.includes('409')) return 'data_conflict';

    // Server errors
    if (message.includes('500') || message.includes('server error')) return 'server_error';
    if (message.includes('503') || message.includes('maintenance')) return 'maintenance';
  }

  return 'unknown';
}

// Convert any error to AppError
export function toAppError(error: unknown): AppError {
  const code = mapErrorToCode(error);
  const errorInfo = ERROR_MESSAGES[code] || ERROR_MESSAGES.unknown;

  let details: string | undefined;
  if (error instanceof Error) {
    details = error.message;
  }

  return {
    code,
    message: errorInfo.message,
    details,
    retryable: errorInfo.retryable,
  };
}

export interface UseErrorHandlerOptions {
  showToast?: boolean;
  onError?: (error: AppError) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { showToast = true, onError } = options;
  const [error, setError] = useState<AppError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((err: unknown) => {
    const appError = toAppError(err);
    setError(appError);

    if (showToast) {
      const errorInfo = ERROR_MESSAGES[appError.code] || ERROR_MESSAGES.unknown;
      toast.error(errorInfo.title, {
        description: errorInfo.message,
      });
    }

    if (onError) {
      onError(appError);
    }

    // Log for debugging
    console.error('[Error Handler]', appError.code, appError.details);

    return appError;
  }, [showToast, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    if (!error?.retryable) return null;

    setIsRetrying(true);
    try {
      const result = await fn();
      clearError();
      return result;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsRetrying(false);
    }
  }, [error, clearError, handleError]);

  // Wrapper for async functions with automatic error handling
  const withErrorHandling = useCallback(<T, A extends unknown[]>(
    fn: (...args: A) => Promise<T>
  ) => {
    return async (...args: A): Promise<T | null> => {
      try {
        return await fn(...args);
      } catch (err) {
        handleError(err);
        return null;
      }
    };
  }, [handleError]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry,
    withErrorHandling,
    isRetryable: error?.retryable ?? false,
  };
}

// Utility hook for form errors
export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const hasErrors = Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors,
    getFieldError: (field: string) => fieldErrors[field],
  };
}
