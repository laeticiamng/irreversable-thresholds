-- Table for user preferences
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  theme TEXT DEFAULT 'system',
  display_density TEXT DEFAULT 'comfortable',
  show_animations BOOLEAN DEFAULT true,
  default_module TEXT DEFAULT 'irreversa',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  sound_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Table for notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  module TEXT,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable realtime for thresholds (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.thresholds;

-- Enable realtime for invisible_thresholds
ALTER PUBLICATION supabase_realtime ADD TABLE public.invisible_thresholds;

-- Enable realtime for absences
ALTER PUBLICATION supabase_realtime ADD TABLE public.absences;

-- Enable realtime for cases
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;

-- Trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();