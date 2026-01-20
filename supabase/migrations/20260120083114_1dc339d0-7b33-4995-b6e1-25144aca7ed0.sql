-- =============================================
-- FIX: Supprimer la colonne email de la politique profiles
-- et restreindre strictement l'accès
-- =============================================

-- Supprimer la politique trop permissive
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Nouvelle politique: UNIQUEMENT son propre profil
CREATE POLICY "Users can view their own profile only"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Pour les lookups de collaboration (afficher les noms), utiliser la vue profiles_public
-- qui n'expose PAS l'email

-- =============================================
-- FIX: Sécuriser les vues avec des grants appropriés
-- =============================================

-- Permettre aux utilisateurs authentifiés de lire la vue profiles_public
GRANT SELECT ON public.profiles_public TO authenticated;

-- Permettre aux utilisateurs authentifiés de lire la vue templates_accessible  
GRANT SELECT ON public.templates_accessible TO authenticated;

-- =============================================
-- FIX: Hasher les tokens d'invitation (pour les futures invitations)
-- Note: Les tokens existants restent en clair mais les nouveaux seront hashés
-- =============================================

-- Ajouter une colonne pour le hash (optionnel - le token actuel reste pour compatibilité)
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS token_hash text;

-- Fonction pour hasher les nouveaux tokens
CREATE OR REPLACE FUNCTION public.hash_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Stocker le hash du token pour comparaison sécurisée
  NEW.token_hash := encode(sha256(NEW.token::bytea), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour hasher automatiquement les nouveaux tokens
DROP TRIGGER IF EXISTS hash_invitation_token_trigger ON public.invitations;
CREATE TRIGGER hash_invitation_token_trigger
  BEFORE INSERT ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_invitation_token();

-- Hasher les tokens existants
UPDATE public.invitations 
SET token_hash = encode(sha256(token::bytea), 'hex')
WHERE token_hash IS NULL;

-- =============================================
-- FIX: Ajouter politiques DELETE manquantes (info niveau)
-- =============================================

-- Permettre suppression des logs AI (respect du RGPD)
CREATE POLICY "Users can delete their own AI activity logs"
  ON public.ai_activity_log FOR DELETE
  USING (auth.uid() = user_id);

-- Permettre suppression des préférences
CREATE POLICY "Users can delete their own preferences"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);