export interface Threshold {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_crossed: boolean;
  created_at: string;
  crossed_at: string | null;
}

export interface Absence {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
  effects?: AbsenceEffect[];
}

export interface AbsenceEffect {
  id: string;
  absence_id: string;
  user_id: string;
  effect_type: 'prevents' | 'enables' | 'forces' | 'preserves';
  description: string;
  created_at: string;
}

export interface InvisibleThreshold {
  id: string;
  user_id: string;
  title: string;
  description: string;
  thresh_type: ThreshType;
  sensed_at: string | null;
  created_at: string;
}

export type ThreshType = 
  | 'trop' 
  | 'pas_assez' 
  | 'rupture' 
  | 'evidence' 
  | 'saturation' 
  | 'acceptabilite' 
  | 'tolerance';

export const THRESH_TYPE_LABELS: Record<ThreshType, string> = {
  trop: 'Seuil de trop',
  pas_assez: 'Seuil de pas assez',
  rupture: 'Seuil de rupture',
  evidence: 'Seuil d\'évidence',
  saturation: 'Seuil de saturation',
  acceptabilite: 'Seuil d\'acceptabilité',
  tolerance: 'Seuil de tolérance',
};

export const EFFECT_LABELS: Record<AbsenceEffect['effect_type'], string> = {
  prevents: 'Empêche',
  enables: 'Rend possible',
  forces: 'Force à contourner',
  preserves: 'Préserve',
};

export interface SilvaSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string;
}
