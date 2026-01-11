// Organization types for B2B multi-tenancy

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
export type OrgPlan = 'trial' | 'starter' | 'pro' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  domain: string | null;
  plan: string;
  trial_ends_at: string | null;
  settings: unknown;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  // Joined data
  profile?: {
    email: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: OrgRole;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  // Joined data
  organization?: Organization;
  inviter_profile?: {
    display_name: string | null;
    email: string | null;
  };
}

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  // Computed
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  created_at: string;
  // Joined data
  profile?: {
    email: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  member: 'Membre',
  viewer: 'Lecteur',
};

export const ORG_PLAN_LABELS: Record<OrgPlan, string> = {
  trial: 'Essai',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export const ORG_ROLE_COLORS: Record<OrgRole, string> = {
  owner: 'bg-amber-500/20 text-amber-400',
  admin: 'bg-purple-500/20 text-purple-400',
  member: 'bg-blue-500/20 text-blue-400',
  viewer: 'bg-gray-500/20 text-gray-400',
};

export const ORG_PLAN_COLORS: Record<OrgPlan, string> = {
  trial: 'bg-yellow-500/20 text-yellow-400',
  starter: 'bg-green-500/20 text-green-400',
  pro: 'bg-indigo-500/20 text-indigo-400',
  enterprise: 'bg-purple-500/20 text-purple-400',
};
