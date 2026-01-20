import { ReactNode } from 'react';
import { AppError } from '@/hooks/useErrorHandler';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, RefreshCw, ArrowRight, WifiOff, Lock, Server, XCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: AppError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
  variant?: 'inline' | 'full' | 'toast';
  showDetails?: boolean;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const ERROR_ICONS: Record<string, ReactNode> = {
  network_offline: <WifiOff className="h-5 w-5" />,
  network_error: <WifiOff className="h-5 w-5" />,
  network_timeout: <WifiOff className="h-5 w-5" />,
  permission_denied: <Lock className="h-5 w-5" />,
  subscription_required: <Lock className="h-5 w-5" />,
  server_error: <Server className="h-5 w-5" />,
  maintenance: <Server className="h-5 w-5" />,
  auth_invalid_credentials: <XCircle className="h-5 w-5" />,
  auth_session_expired: <XCircle className="h-5 w-5" />,
  data_validation: <AlertTriangle className="h-5 w-5" />,
  default: <AlertCircle className="h-5 w-5" />,
};

const ERROR_TITLES: Record<string, string> = {
  network_offline: 'Hors ligne',
  network_error: 'Erreur réseau',
  network_timeout: 'Délai dépassé',
  permission_denied: 'Accès refusé',
  subscription_required: 'Abonnement requis',
  limit_reached: 'Limite atteinte',
  server_error: 'Erreur serveur',
  maintenance: 'Maintenance en cours',
  auth_invalid_credentials: 'Identifiants invalides',
  auth_session_expired: 'Session expirée',
  auth_email_not_verified: 'Email non vérifié',
  data_not_found: 'Introuvable',
  data_validation: 'Données invalides',
  data_conflict: 'Conflit de données',
  unknown: 'Erreur',
};

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  variant = 'inline',
  showDetails = false,
  action,
}: ErrorDisplayProps) {
  if (!error) return null;

  const icon = ERROR_ICONS[error.code] || ERROR_ICONS.default;
  const title = ERROR_TITLES[error.code] || ERROR_TITLES.unknown;

  if (variant === 'full') {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-background">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full border border-destructive/30 flex items-center justify-center text-destructive/60">
            {icon}
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-xl text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>

          {showDetails && error.details && (
            <div className="p-3 bg-destructive/5 border border-destructive/20 text-xs text-destructive/80 text-left overflow-auto max-h-32 rounded">
              <code>{error.details}</code>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            {onDismiss && (
              <Button onClick={onDismiss} variant="outline">
                Fermer
              </Button>
            )}
            {error.retryable && onRetry && (
              <Button onClick={onRetry} disabled={isRetrying}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Réessai...' : 'Réessayer'}
              </Button>
            )}
            {action && (
              action.href ? (
                <Button asChild>
                  <a href={action.href}>
                    {action.label}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              ) : (
                <Button onClick={action.onClick}>
                  {action.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline variant (Alert)
  return (
    <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <AlertTitle className="text-sm font-medium">{title}</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            {error.message}
          </AlertDescription>
          {showDetails && error.details && (
            <p className="text-xs text-destructive/60 mt-2 font-mono">
              {error.details}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3">
            {error.retryable && onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                disabled={isRetrying}
                className="h-7 text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Réessai...' : 'Réessayer'}
              </Button>
            )}
            {action && (
              action.href ? (
                <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                  <a href={action.href}>
                    {action.label}
                  </a>
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={action.onClick}>
                  {action.label}
                </Button>
              )
            )}
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="h-7 text-xs ml-auto"
              >
                Fermer
              </Button>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}

// Smaller inline error for form fields
interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {message}
    </p>
  );
}

// Empty state with error handling
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-6">
      {icon && (
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="font-medium text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
