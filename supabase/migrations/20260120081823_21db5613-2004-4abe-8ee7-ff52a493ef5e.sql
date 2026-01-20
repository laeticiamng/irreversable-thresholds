-- Add case assignment to teams (if not already done)
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS assigned_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cases_assigned_team ON public.cases(assigned_team_id);

-- Create function to notify team members when a case is assigned
CREATE OR REPLACE FUNCTION public.notify_team_case_assigned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  team_member RECORD;
  case_title TEXT;
  team_name TEXT;
BEGIN
  -- Only trigger when assigned_team_id changes to a non-null value
  IF NEW.assigned_team_id IS NOT NULL AND (OLD.assigned_team_id IS NULL OR OLD.assigned_team_id != NEW.assigned_team_id) THEN
    -- Get case title and team name
    SELECT title INTO case_title FROM public.cases WHERE id = NEW.id;
    SELECT name INTO team_name FROM public.teams WHERE id = NEW.assigned_team_id;
    
    -- Notify all team members
    FOR team_member IN 
      SELECT tm.user_id 
      FROM public.team_members tm 
      WHERE tm.team_id = NEW.assigned_team_id
    LOOP
      INSERT INTO public.notifications (user_id, title, message, type, case_id, action_url)
      VALUES (
        team_member.user_id,
        'Nouveau dossier assigné',
        'Le dossier "' || COALESCE(case_title, 'Sans titre') || '" a été assigné à l''équipe ' || COALESCE(team_name, 'Inconnue'),
        'action',
        NEW.id,
        '/cases/' || NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for case assignment notifications
DROP TRIGGER IF EXISTS trigger_notify_team_case_assigned ON public.cases;
CREATE TRIGGER trigger_notify_team_case_assigned
  AFTER UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_team_case_assigned();

-- Create function to notify user on invitation
CREATE OR REPLACE FUNCTION public.notify_invitation_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_name TEXT;
  inviter_name TEXT;
  user_id_to_notify UUID;
BEGIN
  -- Get organization name
  SELECT name INTO org_name FROM public.organizations WHERE id = NEW.organization_id;
  
  -- Get inviter name
  SELECT COALESCE(display_name, email) INTO inviter_name 
  FROM public.profiles WHERE id = NEW.invited_by;
  
  -- Check if user with this email exists
  SELECT id INTO user_id_to_notify FROM public.profiles WHERE email = NEW.email;
  
  IF user_id_to_notify IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, action_url)
    VALUES (
      user_id_to_notify,
      'Invitation reçue',
      'Vous avez été invité à rejoindre l''organisation "' || COALESCE(org_name, 'Inconnue') || '" par ' || COALESCE(inviter_name, 'Un administrateur'),
      'action',
      '/invite/' || NEW.token
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for invitation notifications
DROP TRIGGER IF EXISTS trigger_notify_invitation_created ON public.invitations;
CREATE TRIGGER trigger_notify_invitation_created
  AFTER INSERT ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_invitation_created();