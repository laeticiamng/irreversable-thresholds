-- =============================================
-- FIX: THRESH module RLS policies for invisible_thresholds
-- The current UPDATE policy only allows updates when sensed_at IS NULL
-- This prevents editing thresholds or un-sensing them
-- =============================================

-- Drop the restrictive UPDATE policy
DROP POLICY IF EXISTS "Users can mark thresholds as sensed" ON public.invisible_thresholds;

-- Create a new policy that allows users to update their own thresholds
-- regardless of sensed_at status (for editing title, description, tags, etc.)
CREATE POLICY "Users can update their own invisible thresholds"
  ON public.invisible_thresholds 
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for organization admins/owners to update org thresholds
CREATE POLICY "Org admins can update org invisible thresholds"
  ON public.invisible_thresholds 
  FOR UPDATE
  USING (
    organization_id IS NOT NULL 
    AND public.user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role])
  )
  WITH CHECK (
    organization_id IS NOT NULL 
    AND public.user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role])
  );

-- Also ensure org members can INSERT thresholds for their org
DROP POLICY IF EXISTS "Users can create invisible thresholds" ON public.invisible_thresholds;
CREATE POLICY "Users can create invisible thresholds"
  ON public.invisible_thresholds 
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      organization_id IS NULL 
      OR public.user_belongs_to_org(organization_id)
    )
  );

-- Ensure org members can DELETE their own or org's thresholds (if admin/owner)
DROP POLICY IF EXISTS "Users can delete their own invisible thresholds" ON public.invisible_thresholds;
CREATE POLICY "Users can delete their own invisible thresholds"
  ON public.invisible_thresholds 
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Org admins can delete org invisible thresholds"
  ON public.invisible_thresholds 
  FOR DELETE
  USING (
    organization_id IS NOT NULL 
    AND public.user_has_org_role(organization_id, ARRAY['owner'::org_role, 'admin'::org_role])
  );