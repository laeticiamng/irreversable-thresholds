-- Fix the thresholds UPDATE policy to allow:
-- 1. Normal updates before crossing
-- 2. Uncrossing a threshold (reverting is_crossed to false)
-- 3. Updating non-critical fields after crossing

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can mark thresholds as crossed only" ON public.thresholds;

-- Create a new policy that allows the user to update their own thresholds
-- This is more flexible while still maintaining user ownership
CREATE POLICY "Users can update their own thresholds"
  ON public.thresholds 
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also allow org members with admin/owner role to update org thresholds
CREATE POLICY "Org admins can update org thresholds"
  ON public.thresholds 
  FOR UPDATE
  USING (
    organization_id IS NOT NULL 
    AND user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role])
  )
  WITH CHECK (
    organization_id IS NOT NULL 
    AND user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role])
  );