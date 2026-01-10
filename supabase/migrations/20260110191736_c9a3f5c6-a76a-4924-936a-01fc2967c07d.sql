-- Add tags and intensity columns to invisible_thresholds table for THRESH module
ALTER TABLE public.invisible_thresholds 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS intensity smallint DEFAULT NULL CHECK (intensity >= 1 AND intensity <= 5),
ADD COLUMN IF NOT EXISTS context text DEFAULT NULL;

-- Create index for better tag search performance
CREATE INDEX IF NOT EXISTS idx_invisible_thresholds_tags ON public.invisible_thresholds USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_invisible_thresholds_intensity ON public.invisible_thresholds(intensity);
CREATE INDEX IF NOT EXISTS idx_invisible_thresholds_created_at ON public.invisible_thresholds(created_at DESC);