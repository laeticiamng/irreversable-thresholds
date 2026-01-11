-- =============================================
-- MULTI-TENANCY B2B SCHEMA
-- =============================================

-- Enum for organization roles
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Table: organizations (entreprises clientes)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  domain TEXT,
  plan TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: organization_members
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Table: invitations
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: team_members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Add organization_id to existing tables
ALTER TABLE public.thresholds ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.absences ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.invisible_thresholds ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.silva_sessions ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.cases ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.silva_spaces ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Create indexes for performance
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_teams_org ON public.teams(organization_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_thresholds_org ON public.thresholds(organization_id);
CREATE INDEX idx_absences_org ON public.absences(organization_id);
CREATE INDEX idx_invisible_thresholds_org ON public.invisible_thresholds(organization_id);
CREATE INDEX idx_cases_org ON public.cases(organization_id);

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Check if user belongs to organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = auth.uid()
  )
$$;

-- Get user role in organization
CREATE OR REPLACE FUNCTION public.user_org_role(_org_id UUID)
RETURNS org_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = _org_id AND user_id = auth.uid()
$$;

-- Check if user has specific role in organization
CREATE OR REPLACE FUNCTION public.user_has_org_role(_org_id UUID, _roles org_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id 
      AND user_id = auth.uid()
      AND role = ANY(_roles)
  )
$$;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Members can view their organizations"
  ON public.organizations FOR SELECT
  USING (public.user_belongs_to_org(id));

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update organization"
  ON public.organizations FOR UPDATE
  USING (public.user_has_org_role(id, ARRAY['owner'::org_role]));

CREATE POLICY "Owners can delete organization"
  ON public.organizations FOR DELETE
  USING (public.user_has_org_role(id, ARRAY['owner'::org_role]));

-- Organization members policies
CREATE POLICY "Members can view org members"
  ON public.organization_members FOR SELECT
  USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "Admins can add members"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    public.user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role])
    OR NOT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = organization_members.organization_id)
  );

CREATE POLICY "Admins can update members"
  ON public.organization_members FOR UPDATE
  USING (public.user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role]));

CREATE POLICY "Admins can remove members"
  ON public.organization_members FOR DELETE
  USING (
    public.user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role])
    OR user_id = auth.uid()
  );

-- Invitations policies
CREATE POLICY "Members can view invitations"
  ON public.invitations FOR SELECT
  USING (public.user_belongs_to_org(organization_id) OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (public.user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role]));

CREATE POLICY "Admins can update invitations"
  ON public.invitations FOR UPDATE
  USING (public.user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role]));

CREATE POLICY "Admins can delete invitations"
  ON public.invitations FOR DELETE
  USING (public.user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role]));

-- Teams policies
CREATE POLICY "Members can view teams"
  ON public.teams FOR SELECT
  USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "Admins can manage teams"
  ON public.teams FOR ALL
  USING (public.user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role]));

-- Team members policies
CREATE POLICY "Members can view team members"
  ON public.team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_members.team_id
    AND public.user_belongs_to_org(t.organization_id)
  ));

CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_members.team_id
    AND public.user_has_org_role(t.organization_id, ARRAY['owner'::org_role, 'admin'::org_role])
  ));

-- Update existing table policies for multi-tenancy
-- Thresholds: users can see their own OR organization's thresholds
DROP POLICY IF EXISTS "Users can view their own thresholds" ON public.thresholds;
CREATE POLICY "Users can view thresholds"
  ON public.thresholds FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (organization_id IS NOT NULL AND public.user_belongs_to_org(organization_id))
  );

-- Absences: users can see their own OR organization's absences
DROP POLICY IF EXISTS "Users can view their own absences" ON public.absences;
CREATE POLICY "Users can view absences"
  ON public.absences FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (organization_id IS NOT NULL AND public.user_belongs_to_org(organization_id))
  );

-- Invisible thresholds: users can see their own OR organization's
DROP POLICY IF EXISTS "Users can view their invisible thresholds" ON public.invisible_thresholds;
CREATE POLICY "Users can view invisible thresholds"
  ON public.invisible_thresholds FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (organization_id IS NOT NULL AND public.user_belongs_to_org(organization_id))
  );

-- Trigger for updated_at on organizations
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();