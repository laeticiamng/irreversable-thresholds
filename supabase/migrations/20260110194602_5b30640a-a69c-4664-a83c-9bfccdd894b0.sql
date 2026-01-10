-- Create AI activity log table for tracking all AI assistant interactions
CREATE TABLE public.ai_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('irreversa', 'nulla', 'thresh')),
  action TEXT NOT NULL,
  input_snapshot JSONB NOT NULL DEFAULT '{}',
  output_snapshot JSONB NOT NULL DEFAULT '{}',
  accepted_items JSONB DEFAULT '[]',
  rejected_items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_ai_activity_log_user_id ON public.ai_activity_log(user_id);
CREATE INDEX idx_ai_activity_log_case_id ON public.ai_activity_log(case_id);
CREATE INDEX idx_ai_activity_log_module ON public.ai_activity_log(module);
CREATE INDEX idx_ai_activity_log_created_at ON public.ai_activity_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.ai_activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access
CREATE POLICY "Users can view their own AI activity logs"
ON public.ai_activity_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI activity logs"
ON public.ai_activity_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI activity logs"
ON public.ai_activity_log
FOR UPDATE
USING (auth.uid() = user_id);

-- Add ai_actions_used column to user_subscriptions for tracking monthly usage
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS ai_actions_used INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_actions_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now();