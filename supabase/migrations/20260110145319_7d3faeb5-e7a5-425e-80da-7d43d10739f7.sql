-- =============================================
-- SYSTÈME ONTOLOGIQUE : IRREVERSA + NULLA + THRESH
-- =============================================

-- Enum pour les types d'effets d'absence (NULLA)
CREATE TYPE public.absence_effect_type AS ENUM ('prevents', 'enables', 'forces', 'preserves');

-- Enum pour les types de seuils (THRESH)
CREATE TYPE public.thresh_type AS ENUM ('trop', 'pas_assez', 'rupture', 'evidence', 'saturation', 'acceptabilite', 'tolerance');

-- =============================================
-- TABLE: profiles (pour l'authentification)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger pour créer un profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TABLE: thresholds (IRREVERSA - les seuils irréversibles)
-- =============================================
CREATE TABLE public.thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_crossed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  crossed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own thresholds"
  ON public.thresholds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own thresholds"
  ON public.thresholds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- CRITIQUE: Une fois franchi, on ne peut que marquer comme franchi, pas modifier
CREATE POLICY "Users can mark thresholds as crossed only"
  ON public.thresholds FOR UPDATE
  USING (auth.uid() = user_id AND is_crossed = false)
  WITH CHECK (auth.uid() = user_id);

-- PAS DE DELETE - L'irréversibilité est absolue

-- =============================================
-- TABLE: absences (NULLA - les absences structurelles)
-- =============================================
CREATE TABLE public.absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own absences"
  ON public.absences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own absences"
  ON public.absences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les absences peuvent être observées mais pas supprimées
-- PAS DE DELETE - Le vide persiste

-- =============================================
-- TABLE: absence_effects (NULLA - effets des absences)
-- =============================================
CREATE TABLE public.absence_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  absence_id UUID NOT NULL REFERENCES public.absences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  effect_type absence_effect_type NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.absence_effects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view effects of their absences"
  ON public.absence_effects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add effects to their absences"
  ON public.absence_effects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TABLE: invisible_thresholds (THRESH - seuils non mesurables)
-- =============================================
CREATE TABLE public.invisible_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thresh_type thresh_type NOT NULL,
  -- Le seuil n'a pas de valeur, pas d'unité, pas de condition
  -- Il existe, c'est tout
  sensed_at TIMESTAMP WITH TIME ZONE, -- Quand le seuil a été ressenti (optionnel)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invisible_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their invisible thresholds"
  ON public.invisible_thresholds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create invisible thresholds"
  ON public.invisible_thresholds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les seuils invisibles peuvent être marqués comme ressentis
CREATE POLICY "Users can mark thresholds as sensed"
  ON public.invisible_thresholds FOR UPDATE
  USING (auth.uid() = user_id AND sensed_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- PAS DE DELETE - Le seuil ressenti est irréductible

-- =============================================
-- FONCTION: Mise à jour automatique des timestamps
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();