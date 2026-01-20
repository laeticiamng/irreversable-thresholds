import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldOff, Lock } from 'lucide-react';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showError?: boolean;
  loadingFallback?: ReactNode;
}

/**
 * PermissionGate - Conditionally renders children based on user permissions
 *
 * @example
 * // Single permission
 * <PermissionGate permission="manage_members">
 *   <AdminPanel />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (any)
 * <PermissionGate permissions={['manage_members', 'manage_teams']}>
 *   <TeamSettings />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (all required)
 * <PermissionGate permissions={['manage_billing', 'manage_settings']} requireAll>
 *   <BillingSettings />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showError = false,
  loadingFallback,
}: PermissionGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading: permissionsLoading } = usePermissions(user?.id);

  const isLoading = authLoading || permissionsLoading;

  if (isLoading) {
    return loadingFallback ? <>{loadingFallback}</> : (
      <Skeleton className="h-20 w-full" />
    );
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // No permission specified = allow access
    hasAccess = true;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showError) {
    return (
      <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
        <ShieldOff className="h-4 w-4" />
        <AlertDescription>
          Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{fallback}</>;
}

interface RequireRoleProps {
  children: ReactNode;
  roles: ('owner' | 'admin' | 'member' | 'viewer')[];
  fallback?: ReactNode;
}

/**
 * RequireRole - Conditionally renders children based on user role
 */
export function RequireRole({ children, roles, fallback = null }: RequireRoleProps) {
  const { user } = useAuth();
  const { role, isLoading } = usePermissions(user?.id);

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  if (!role || !roles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface LockedFeatureProps {
  children: ReactNode;
  isLocked: boolean;
  message?: string;
  upgradeLink?: string;
}

/**
 * LockedFeature - Shows a locked state for premium features
 */
export function LockedFeature({
  children,
  isLocked,
  message = 'Cette fonctionnalité nécessite un abonnement Pro',
  upgradeLink = '/settings',
}: LockedFeatureProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
        <div className="text-center p-6">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">{message}</p>
          <a
            href={upgradeLink}
            className="text-sm text-primary hover:underline"
          >
            Voir les plans
          </a>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
    </div>
  );
}

/**
 * useCanAccess - Hook to check access without rendering
 */
export function useCanAccess(permission: Permission): boolean {
  const { user } = useAuth();
  const { hasPermission, isLoading } = usePermissions(user?.id);

  if (isLoading) return false;
  return hasPermission(permission);
}
