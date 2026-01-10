-- Create silva_spaces table for the SILVA module
CREATE TABLE public.silva_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('global', 'case')),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  format_mode TEXT NOT NULL DEFAULT 'default' CHECK (format_mode IN ('default', 'silence')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure case_id is set when scope is 'case'
  CONSTRAINT case_scope_requires_case_id CHECK (
    (scope = 'global' AND case_id IS NULL) OR 
    (scope = 'case' AND case_id IS NOT NULL)
  )
);

-- Create unique partial index for global scope (one global per user)
CREATE UNIQUE INDEX idx_silva_unique_global ON public.silva_spaces (user_id) WHERE scope = 'global';

-- Create unique index for case scope (one per case per user)
CREATE UNIQUE INDEX idx_silva_unique_case ON public.silva_spaces (user_id, case_id) WHERE scope = 'case';

-- Create index for case lookups
CREATE INDEX idx_silva_spaces_case ON public.silva_spaces(case_id) WHERE case_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.silva_spaces ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own silva spaces" 
ON public.silva_spaces 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own silva spaces" 
ON public.silva_spaces 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own silva spaces" 
ON public.silva_spaces 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own silva spaces" 
ON public.silva_spaces 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_silva_spaces_updated_at
BEFORE UPDATE ON public.silva_spaces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();