-- =============================================
-- IRREVERSA MODULE - Enhanced Schema
-- =============================================

-- 1. Add new columns to thresholds for enhanced functionality
ALTER TABLE public.thresholds 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'autre' CHECK (category IN ('personnel', 'travail', 'finance', 'relation', 'organisation', 'autre')),
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'moderate' CHECK (severity IN ('low', 'moderate', 'high')),
ADD COLUMN IF NOT EXISTS what_cannot_be_undone TEXT,
ADD COLUMN IF NOT EXISTS what_changes_after TEXT,
ADD COLUMN IF NOT EXISTS conditions TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Add domain and time_horizon to cases
ALTER TABLE public.cases
ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'autre' CHECK (domain IN ('personnel', 'travail', 'finance', 'relation', 'organisation', 'autre')),
ADD COLUMN IF NOT EXISTS time_horizon TEXT CHECK (time_horizon IN ('3_months', '1_year', '5_years', 'undefined'));

-- 3. Create consequences table for structured implications
CREATE TABLE IF NOT EXISTS public.threshold_consequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  threshold_id UUID NOT NULL REFERENCES public.thresholds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  consequence_type TEXT NOT NULL CHECK (consequence_type IN ('impossible', 'costly', 'changed', 'enabled')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.threshold_consequences ENABLE ROW LEVEL SECURITY;

-- RLS for consequences
CREATE POLICY "Users can view consequences of their thresholds"
  ON public.threshold_consequences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create consequences"
  ON public.threshold_consequences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their consequences"
  ON public.threshold_consequences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their consequences"
  ON public.threshold_consequences FOR DELETE
  USING (user_id = auth.uid());

-- 4. Create user_subscriptions table for paywall
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscription"
  ON public.user_subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (user_id = auth.uid());

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Add more IRREVERSA templates (6 premium + 2 free)
INSERT INTO public.templates (name, slug, description, module, is_premium, structure) VALUES
-- Free templates
(
  'Changement de trajectoire',
  'changement-trajectoire',
  'Pour tout moment où votre chemin bifurque définitivement.',
  'irreversa',
  false,
  '{"fields": ["title", "description", "what_cannot_be_undone", "what_changes_after"], "example_title": "Nouvelle direction", "example_description": "Un choix qui change la trajectoire de manière durable."}'
),
(
  'Engagement contractuel',
  'engagement-contractuel', 
  'Pour les signatures et engagements formels qui vous lient.',
  'irreversa',
  false,
  '{"fields": ["title", "description", "what_cannot_be_undone", "what_changes_after", "conditions"], "example_title": "Signature de contrat", "example_description": "Un engagement formel avec des obligations légales."}'
),
-- Premium templates
(
  'Décision financière irréversible',
  'decision-financiere',
  'Investissements majeurs, dettes, engagements financiers à long terme.',
  'irreversa',
  true,
  '{"fields": ["title", "description", "what_cannot_be_undone", "what_changes_after", "conditions", "severity"], "category": "finance", "example_title": "Investissement majeur", "suggested_consequences": ["impossible de récupérer le capital", "nouvelles obligations de remboursement"]}'
),
(
  'Exposition publique',
  'exposition-publique',
  'Publications, déclarations, révélations qui ne peuvent être retirées.',
  'irreversa',
  true,
  '{"fields": ["title", "description", "what_cannot_be_undone", "what_changes_after"], "category": "personnel", "example_title": "Publication publique", "suggested_consequences": ["impossible d''effacer de l''internet", "réputation modifiée durablement"]}'
),
(
  'Rupture d''accord',
  'rupture-accord',
  'Fin de partenariat, divorce, résiliation définitive.',
  'irreversa',
  true,
  '{"fields": ["title", "description", "what_cannot_be_undone", "what_changes_after", "conditions"], "category": "relation", "example_title": "Fin de partenariat", "suggested_consequences": ["confiance rompue", "nouvelles dynamiques relationnelles"]}'
),
(
  'Perte de preuve ou document',
  'perte-preuve',
  'Destruction ou perte irrémédiable d''éléments importants.',
  'irreversa',
  true,
  '{"fields": ["title", "description", "what_cannot_be_undone", "what_changes_after", "notes"], "category": "autre", "example_title": "Document perdu", "suggested_consequences": ["impossible de prouver", "options légales réduites"]}'
),
(
  'Point de rupture organisationnel',
  'rupture-organisationnelle',
  'Restructuration, licenciement, fermeture définitive.',
  'irreversa',
  true,
  '{"fields": ["title", "description", "what_cannot_be_undone", "what_changes_after", "conditions"], "category": "organisation", "example_title": "Restructuration", "suggested_consequences": ["équipes dispersées", "culture modifiée"]}'
),
(
  'Décision à effet juridique',
  'effet-juridique',
  'Actions ayant des conséquences légales permanentes.',
  'irreversa',
  true,
  '{"fields": ["title", "description", "what_cannot_be_undone", "what_changes_after", "conditions", "severity"], "category": "autre", "example_title": "Action juridique", "suggested_consequences": ["précédent créé", "responsabilités engagées"]}'
)
ON CONFLICT (slug) DO NOTHING;
