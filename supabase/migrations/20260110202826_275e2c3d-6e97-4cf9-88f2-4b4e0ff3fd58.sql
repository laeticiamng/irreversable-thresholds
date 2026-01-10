-- Allow users to delete their own thresholds
CREATE POLICY "Users can delete their own thresholds" 
ON public.thresholds 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow users to delete their own invisible thresholds
CREATE POLICY "Users can delete their own invisible thresholds" 
ON public.invisible_thresholds 
FOR DELETE 
USING (auth.uid() = user_id);