-- Table pour l'historique de présence SILVA
CREATE TABLE public.silva_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.silva_sessions ENABLE ROW LEVEL SECURITY;

-- Users can create their own sessions
CREATE POLICY "Users can create silva sessions"
ON public.silva_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own sessions
CREATE POLICY "Users can view their silva sessions"
ON public.silva_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own sessions (to set ended_at)
CREATE POLICY "Users can end their silva sessions"
ON public.silva_sessions
FOR UPDATE
USING (auth.uid() = user_id AND ended_at IS NULL)
WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_silva_sessions_user_id ON public.silva_sessions(user_id);
CREATE INDEX idx_silva_sessions_started_at ON public.silva_sessions(started_at DESC);