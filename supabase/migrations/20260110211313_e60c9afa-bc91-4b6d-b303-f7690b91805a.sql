-- Create tags table
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create case_tags junction table
CREATE TABLE public.case_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(case_id, tag_id)
);

-- Create case_collaborators table for sharing
CREATE TABLE public.case_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  invited_by uuid NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone,
  UNIQUE(case_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_collaborators ENABLE ROW LEVEL SECURITY;

-- Tags policies
CREATE POLICY "Users can view their own tags" ON public.tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);

-- Case tags policies
CREATE POLICY "Users can view case tags for accessible cases" ON public.case_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c 
      WHERE c.id = case_tags.case_id 
      AND has_workspace_role(auth.uid(), c.workspace_id, ARRAY['owner'::workspace_role, 'admin'::workspace_role, 'editor'::workspace_role, 'viewer'::workspace_role])
    )
  );

CREATE POLICY "Editors can manage case tags" ON public.case_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c 
      WHERE c.id = case_tags.case_id 
      AND has_workspace_role(auth.uid(), c.workspace_id, ARRAY['owner'::workspace_role, 'admin'::workspace_role, 'editor'::workspace_role])
    )
  );

-- Case collaborators policies
CREATE POLICY "Users can view collaborators on their cases" ON public.case_collaborators
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM cases c 
      WHERE c.id = case_collaborators.case_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Case owners can manage collaborators" ON public.case_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases c 
      WHERE c.id = case_collaborators.case_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Case owners can update collaborators" ON public.case_collaborators
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cases c 
      WHERE c.id = case_collaborators.case_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Case owners can remove collaborators" ON public.case_collaborators
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM cases c 
      WHERE c.id = case_collaborators.case_id 
      AND c.user_id = auth.uid()
    )
  );

-- Enable realtime for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_collaborators;