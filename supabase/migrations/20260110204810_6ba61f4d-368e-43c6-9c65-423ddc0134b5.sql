-- Add missing RLS policies for absences UPDATE and DELETE
CREATE POLICY "Users can update their own absences" 
ON public.absences 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own absences" 
ON public.absences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add missing RLS policies for absence_effects UPDATE and DELETE
CREATE POLICY "Users can update their own effects" 
ON public.absence_effects 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own effects" 
ON public.absence_effects 
FOR DELETE 
USING (auth.uid() = user_id);