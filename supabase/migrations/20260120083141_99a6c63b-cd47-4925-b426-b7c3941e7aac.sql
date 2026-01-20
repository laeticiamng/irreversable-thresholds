-- Fix: Ajouter search_path à la fonction hash_invitation_token
CREATE OR REPLACE FUNCTION public.hash_invitation_token()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Stocker le hash du token pour comparaison sécurisée
  NEW.token_hash := encode(sha256(NEW.token::bytea), 'hex');
  RETURN NEW;
END;
$$;