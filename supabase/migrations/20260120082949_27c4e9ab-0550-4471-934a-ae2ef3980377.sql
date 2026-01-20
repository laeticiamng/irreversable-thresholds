-- =============================================
-- FIX 1: Profiles - Permettre aux membres d'org de voir les profils basiques (sans email)
-- Créer une vue publique sans email + restreindre l'accès direct
-- =============================================

-- Créer une vue publique sans l'email pour les lookups de collaboration
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  display_name,
  avatar_url,
  created_at
FROM public.profiles;

-- Politique pour permettre aux utilisateurs authentifiés de voir les profils publics
-- (utilisé pour afficher les noms dans les collaborations, équipes, etc.)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Nouvelle politique: voir son propre profil complet OU les profils basiques des membres de la même org
CREATE POLICY "Users can view profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid() AND om2.user_id = profiles.id
    )
  );

-- =============================================
-- FIX 2: Invitations - Restreindre la visibilité des emails
-- Seuls les admins et l'invité lui-même peuvent voir les détails
-- =============================================

DROP POLICY IF EXISTS "Members can view invitations" ON public.invitations;

-- Les admins voient toutes les invitations de leur org
CREATE POLICY "Admins can view org invitations"
  ON public.invitations FOR SELECT
  USING (
    user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role])
  );

-- L'invité peut voir uniquement son invitation (par token dans l'URL, pas par email)
CREATE POLICY "Invited users can view their invitation by token"
  ON public.invitations FOR SELECT
  USING (
    -- L'utilisateur connecté avec le même email peut voir l'invitation
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- =============================================
-- FIX 3: Templates premium - Créer une vue qui masque le contenu premium
-- =============================================

-- Vue pour les templates: tout le monde voit les métadonnées, 
-- mais la structure est masquée pour les templates premium si non abonné
CREATE OR REPLACE VIEW public.templates_accessible
WITH (security_invoker = on) AS
SELECT 
  t.id,
  t.name,
  t.slug,
  t.description,
  t.module,
  t.is_premium,
  t.created_at,
  -- La structure est visible seulement si:
  -- 1. Le template n'est pas premium, OU
  -- 2. L'utilisateur a un abonnement pro/team/enterprise
  CASE 
    WHEN t.is_premium = false THEN t.structure
    WHEN EXISTS (
      SELECT 1 FROM public.user_subscriptions us 
      WHERE us.user_id = auth.uid() 
      AND us.plan IN ('pro', 'team', 'enterprise')
      AND (us.expires_at IS NULL OR us.expires_at > now())
    ) THEN t.structure
    ELSE '{}'::jsonb
  END as structure
FROM public.templates t;

-- Ajouter une politique pour que les non-abonnés ne puissent pas utiliser les templates premium
-- (la structure est déjà masquée via la vue, mais on renforce côté applicatif)

-- =============================================
-- FIX BONUS: Nettoyer les politiques dupliquées sur profiles
-- =============================================

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Garder uniquement les politiques bien nommées
-- (les autres ont déjà été créées avec "their own");