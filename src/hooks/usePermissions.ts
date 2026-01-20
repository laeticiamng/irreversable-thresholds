import { useCallback, useMemo } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';
import { useTeamMembers } from '@/hooks/useTeams';
import { OrganizationRole } from '@/types/organization';

export type Permission =
  | 'create_case'
  | 'read_case'
  | 'update_case'
  | 'delete_case'
  | 'create_threshold'
  | 'read_threshold'
  | 'update_threshold'
  | 'delete_threshold'
  | 'create_absence'
  | 'read_absence'
  | 'update_absence'
  | 'delete_absence'
  | 'create_signal'
  | 'read_signal'
  | 'update_signal'
  | 'delete_signal'
  | 'manage_members'
  | 'manage_teams'
  | 'manage_settings'
  | 'manage_billing'
  | 'view_analytics'
  | 'export_data'
  | 'use_ai_assist'
  | 'create_template'
  | 'delete_template'
  | 'invite_members';

// Permission matrix by role
const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  owner: [
    'create_case', 'read_case', 'update_case', 'delete_case',
    'create_threshold', 'read_threshold', 'update_threshold', 'delete_threshold',
    'create_absence', 'read_absence', 'update_absence', 'delete_absence',
    'create_signal', 'read_signal', 'update_signal', 'delete_signal',
    'manage_members', 'manage_teams', 'manage_settings', 'manage_billing',
    'view_analytics', 'export_data', 'use_ai_assist',
    'create_template', 'delete_template', 'invite_members',
  ],
  admin: [
    'create_case', 'read_case', 'update_case', 'delete_case',
    'create_threshold', 'read_threshold', 'update_threshold', 'delete_threshold',
    'create_absence', 'read_absence', 'update_absence', 'delete_absence',
    'create_signal', 'read_signal', 'update_signal', 'delete_signal',
    'manage_members', 'manage_teams', 'manage_settings',
    'view_analytics', 'export_data', 'use_ai_assist',
    'create_template', 'invite_members',
  ],
  member: [
    'create_case', 'read_case', 'update_case',
    'create_threshold', 'read_threshold', 'update_threshold',
    'create_absence', 'read_absence', 'update_absence',
    'create_signal', 'read_signal', 'update_signal',
    'view_analytics', 'use_ai_assist',
  ],
  viewer: [
    'read_case',
    'read_threshold',
    'read_absence',
    'read_signal',
    'view_analytics',
  ],
};

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  role: OrganizationRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isViewer: boolean;
  canManage: boolean;
  canEdit: boolean;
  canView: boolean;
  isLoading: boolean;
}

export function usePermissions(userId: string | undefined): UsePermissionsReturn {
  const { currentOrganization, isPersonalMode } = useOrganizationContext();
  const { members, isLoading } = useOrganizationMembers(currentOrganization?.id);

  // Get current user's role in the organization
  const currentMember = useMemo(() => {
    if (!userId || !members.length) return null;
    return members.find(m => m.user_id === userId);
  }, [userId, members]);

  const role = useMemo((): OrganizationRole | null => {
    // In personal mode, user has full permissions
    if (isPersonalMode) return 'owner';
    // If no organization, return null
    if (!currentOrganization) return null;
    // Return member's role or null if not a member
    return currentMember?.role || null;
  }, [isPersonalMode, currentOrganization, currentMember]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    // Personal mode = full access
    if (isPersonalMode) return true;
    // No role = no permissions
    if (!role) return false;
    // Check permission matrix
    return ROLE_PERMISSIONS[role].includes(permission);
  }, [isPersonalMode, role]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  }, [hasPermission]);

  const isOwner = role === 'owner';
  const isAdmin = role === 'admin' || role === 'owner';
  const isMember = role === 'member' || isAdmin;
  const isViewer = role === 'viewer' || isMember;

  // Convenience flags
  const canManage = hasAnyPermission(['manage_members', 'manage_teams', 'manage_settings']);
  const canEdit = hasAnyPermission(['update_case', 'update_threshold', 'update_absence']);
  const canView = hasPermission('read_case');

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    role,
    isOwner,
    isAdmin,
    isMember,
    isViewer,
    canManage,
    canEdit,
    canView,
    isLoading,
  };
}

// Hook for team-level permissions
export function useTeamPermissions(userId: string | undefined, teamId?: string) {
  const { members, isLoading } = useTeamMembers(teamId);
  const orgPermissions = usePermissions(userId);

  const isTeamMember = useMemo(() => {
    if (!userId || !teamId || !members.length) return false;
    return members.some(m => m.user_id === userId);
  }, [userId, teamId, members]);

  // Team members inherit their org permissions but are scoped to team resources
  const canAccessTeamResources = useMemo(() => {
    // Org admins/owners can access all team resources
    if (orgPermissions.isAdmin) return true;
    // Regular members can only access their team's resources
    return isTeamMember;
  }, [orgPermissions.isAdmin, isTeamMember]);

  return {
    ...orgPermissions,
    isTeamMember,
    canAccessTeamResources,
    isLoading: isLoading || orgPermissions.isLoading,
  };
}
