import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, OrgRole } from '@/types/organization';
import { useAuth } from '@/hooks/useAuth';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  userRole: OrgRole | null;
  isLoading: boolean;
  isPersonalMode: boolean;
  switchOrganization: (orgId: string | null) => void;
  refreshOrganizations: () => Promise<void>;
  canManageMembers: boolean;
  canEditContent: boolean;
  canViewContent: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const STORAGE_KEY = 'qt_current_org';

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<OrgRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch organizations where user is a member
      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;

      if (!memberships || memberships.length === 0) {
        setOrganizations([]);
        setCurrentOrganization(null);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      const orgIds = memberships.map(m => m.organization_id);
      
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds);

      if (orgsError) throw orgsError;

      const typedOrgs = (orgs || []) as Organization[];
      const mappedOrgs = typedOrgs.map(org => ({
        ...org,
        plan: org.plan as Organization['plan'],
      }));

      setOrganizations(typedOrgs);

      // Restore saved organization or select first one
      const savedOrgId = localStorage.getItem(STORAGE_KEY);
      const savedOrg = savedOrgId ? mappedOrgs.find(o => o.id === savedOrgId) : null;
      const selectedOrg = savedOrg || (mappedOrgs.length > 0 ? mappedOrgs[0] : null);

      if (selectedOrg) {
        setCurrentOrganization(selectedOrg);
        const membership = memberships.find(m => m.organization_id === selectedOrg.id);
        setUserRole(membership?.role as OrgRole || null);
      } else {
        setCurrentOrganization(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const switchOrganization = useCallback(async (orgId: string | null) => {
    if (orgId === null) {
      // Switch to personal mode
      setCurrentOrganization(null);
      setUserRole(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const org = organizations.find(o => o.id === orgId);
    if (!org || !user) return;

    // Fetch role for this org
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    setCurrentOrganization(org);
    setUserRole(membership?.role as OrgRole || null);
    localStorage.setItem(STORAGE_KEY, orgId);
  }, [organizations, user]);

  const refreshOrganizations = useCallback(async () => {
    await fetchOrganizations();
  }, [fetchOrganizations]);

  const isPersonalMode = currentOrganization === null;
  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  const canEditContent = userRole === 'owner' || userRole === 'admin' || userRole === 'member';
  const canViewContent = userRole !== null;

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        userRole,
        isLoading,
        isPersonalMode,
        switchOrganization,
        refreshOrganizations,
        canManageMembers,
        canEditContent,
        canViewContent,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
}
