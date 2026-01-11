-- Fix templates RLS policy: restrict to authenticated users only
-- Drop the public read policy
DROP POLICY IF EXISTS "Anyone can view templates" ON public.templates;

-- Create new policy: only authenticated users can view templates
CREATE POLICY "Authenticated users can view templates" 
ON public.templates 
FOR SELECT 
TO authenticated
USING (true);