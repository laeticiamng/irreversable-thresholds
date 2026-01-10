-- Create notification trigger function for thresholds
CREATE OR REPLACE FUNCTION public.notify_on_threshold_crossed()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when is_crossed changes from false to true
  IF NEW.is_crossed = true AND OLD.is_crossed = false THEN
    INSERT INTO public.notifications (user_id, title, message, type, module, case_id, action_url)
    VALUES (
      NEW.user_id,
      'Seuil franchi',
      'Le seuil "' || NEW.title || '" a été marqué comme franchi.',
      'threshold_crossed',
      'irreversa',
      NEW.case_id,
      CASE WHEN NEW.case_id IS NOT NULL THEN '/irreversa/cases/' || NEW.case_id ELSE '/irreversa' END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for threshold crossing
DROP TRIGGER IF EXISTS trigger_notify_threshold_crossed ON public.thresholds;
CREATE TRIGGER trigger_notify_threshold_crossed
  AFTER UPDATE ON public.thresholds
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_threshold_crossed();

-- Create notification trigger function for invisible thresholds (sensed)
CREATE OR REPLACE FUNCTION public.notify_on_invisible_threshold_sensed()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when sensed_at changes from NULL to a value
  IF NEW.sensed_at IS NOT NULL AND OLD.sensed_at IS NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, module, case_id, action_url)
    VALUES (
      NEW.user_id,
      'Seuil ressenti',
      'Le seuil invisible "' || NEW.title || '" a été ressenti.',
      'threshold_sensed',
      'thresh',
      NEW.case_id,
      CASE WHEN NEW.case_id IS NOT NULL THEN '/thresh/cases/' || NEW.case_id ELSE '/thresh' END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for invisible threshold sensing
DROP TRIGGER IF EXISTS trigger_notify_invisible_threshold_sensed ON public.invisible_thresholds;
CREATE TRIGGER trigger_notify_invisible_threshold_sensed
  AFTER UPDATE ON public.invisible_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_invisible_threshold_sensed();

-- Create notification trigger function for absences
CREATE OR REPLACE FUNCTION public.notify_on_absence_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, module, case_id, action_url)
  VALUES (
    NEW.user_id,
    'Nouvelle absence créée',
    'L''absence "' || NEW.title || '" a été ajoutée.',
    'absence_created',
    'nulla',
    NEW.case_id,
    CASE WHEN NEW.case_id IS NOT NULL THEN '/nulla/cases/' || NEW.case_id ELSE '/nulla' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for absence creation
DROP TRIGGER IF EXISTS trigger_notify_absence_created ON public.absences;
CREATE TRIGGER trigger_notify_absence_created
  AFTER INSERT ON public.absences
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_absence_created();