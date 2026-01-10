-- =============================================
-- THRESHOLD ENGINE - Core Schema
-- =============================================

-- 1. WORKSPACES (B2B / Personal)
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  description TEXT,
  is_personal BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Update trigger
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. USER ROLES ENUM
CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- 3. USER WORKSPACE ROLES (many-to-many)
CREATE TABLE public.user_workspace_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, workspace_id)
);

ALTER TABLE public.user_workspace_roles ENABLE ROW LEVEL SECURITY;

-- 4. SECURITY DEFINER FUNCTION for role checking (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_workspace_role(_user_id UUID, _workspace_id UUID, _roles workspace_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_workspace_roles
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
      AND role = ANY(_roles)
  )
$$;

-- 5. CASES (A project/decision/trajectory within a workspace)
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  template_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. SIGNALS (Facts/indices/context attached to cases)
CREATE TABLE public.signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  signal_type TEXT NOT NULL DEFAULT 'observation' CHECK (signal_type IN ('observation', 'fait', 'intuition', 'tension', 'contexte')),
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
  occurred_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- 7. EXPORTS (Track exported documents)
CREATE TABLE public.exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'png', 'json')),
  module TEXT NOT NULL CHECK (module IN ('irreversa', 'nulla', 'thresh', 'silva', 'all')),
  file_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- 8. TEMPLATES (Premium templates)
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  module TEXT NOT NULL CHECK (module IN ('irreversa', 'nulla', 'thresh', 'silva')),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  structure JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- WORKSPACES policies
CREATE POLICY "Users can view workspaces they belong to"
  ON public.workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    public.has_workspace_role(auth.uid(), id, ARRAY['owner', 'admin', 'editor', 'viewer']::workspace_role[])
  );

CREATE POLICY "Users can create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners and admins can update workspaces"
  ON public.workspaces FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    public.has_workspace_role(auth.uid(), id, ARRAY['owner', 'admin']::workspace_role[])
  );

CREATE POLICY "Only owners can delete workspaces"
  ON public.workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- USER_WORKSPACE_ROLES policies
CREATE POLICY "Users can view roles in their workspaces"
  ON public.user_workspace_roles FOR SELECT
  USING (
    user_id = auth.uid() OR
    public.has_workspace_role(auth.uid(), workspace_id, ARRAY['owner', 'admin']::workspace_role[])
  );

CREATE POLICY "Owners and admins can manage roles"
  ON public.user_workspace_roles FOR INSERT
  WITH CHECK (
    public.has_workspace_role(auth.uid(), workspace_id, ARRAY['owner', 'admin']::workspace_role[])
  );

CREATE POLICY "Owners and admins can update roles"
  ON public.user_workspace_roles FOR UPDATE
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, ARRAY['owner', 'admin']::workspace_role[])
  );

CREATE POLICY "Owners and admins can delete roles"
  ON public.user_workspace_roles FOR DELETE
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, ARRAY['owner', 'admin']::workspace_role[])
  );

-- CASES policies
CREATE POLICY "Users can view cases in their workspaces"
  ON public.cases FOR SELECT
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, ARRAY['owner', 'admin', 'editor', 'viewer']::workspace_role[])
  );

CREATE POLICY "Editors+ can create cases"
  ON public.cases FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    public.has_workspace_role(auth.uid(), workspace_id, ARRAY['owner', 'admin', 'editor']::workspace_role[])
  );

CREATE POLICY "Editors+ can update cases"
  ON public.cases FOR UPDATE
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, ARRAY['owner', 'admin', 'editor']::workspace_role[])
  );

CREATE POLICY "Admins+ can delete cases"
  ON public.cases FOR DELETE
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, ARRAY['owner', 'admin']::workspace_role[])
  );

-- SIGNALS policies
CREATE POLICY "Users can view signals in their cases"
  ON public.signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id
      AND public.has_workspace_role(auth.uid(), c.workspace_id, ARRAY['owner', 'admin', 'editor', 'viewer']::workspace_role[])
    )
  );

CREATE POLICY "Editors+ can create signals"
  ON public.signals FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id
      AND public.has_workspace_role(auth.uid(), c.workspace_id, ARRAY['owner', 'admin', 'editor']::workspace_role[])
    )
  );

CREATE POLICY "Users can update their own signals"
  ON public.signals FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own signals"
  ON public.signals FOR DELETE
  USING (user_id = auth.uid());

-- EXPORTS policies
CREATE POLICY "Users can view their exports"
  ON public.exports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create exports"
  ON public.exports FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- TEMPLATES policies (read-only for users)
CREATE POLICY "Anyone can view templates"
  ON public.templates FOR SELECT
  USING (true);

-- =============================================
-- LINK EXISTING TABLES TO CASES (optional foreign key)
-- =============================================

-- Add case_id to thresholds (optional link)
ALTER TABLE public.thresholds ADD COLUMN case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL;

-- Add case_id to absences (optional link)
ALTER TABLE public.absences ADD COLUMN case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL;

-- Add case_id to invisible_thresholds (optional link)
ALTER TABLE public.invisible_thresholds ADD COLUMN case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL;

-- Add case_id to silva_sessions (optional link)
ALTER TABLE public.silva_sessions ADD COLUMN case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL;

-- =============================================
-- INSERT INITIAL TEMPLATES
-- =============================================

INSERT INTO public.templates (name, slug, description, module, is_premium, structure) VALUES
(
  'Point de non-retour',
  'point-de-non-retour',
  'Un seuil irréversible classique : décision majeure, engagement définitif, rupture assumée.',
  'irreversa',
  true,
  '{"fields": ["title", "description", "context", "consequences"], "suggested_signals": ["fait déclencheur", "point de bascule", "conséquence immédiate"]}'
),
(
  'Absence critique',
  'absence-critique',
  'Une ressource, un droit ou une protection qui manque et structure la situation.',
  'nulla',
  true,
  '{"fields": ["title", "description", "category"], "effect_types": ["prevents", "enables", "forces", "preserves"], "categories": ["ressource", "droit", "compétence", "protection"]}'
),
(
  'Transition ressentie',
  'transition-ressentie',
  'Un moment de bascule perçu mais non mesurable. Signal faible, intuition, tension.',
  'thresh',
  true,
  '{"fields": ["title", "description", "thresh_type"], "tags": ["signal faible", "tension", "intuition", "saturation"]}'
);
