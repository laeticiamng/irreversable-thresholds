// =============================================
// CORE ENTITIES
// =============================================

export interface Threshold {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_crossed: boolean;
  created_at: string;
  crossed_at: string | null;
  case_id?: string | null;
}

export interface Absence {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
  case_id?: string | null;
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
  case_id?: string | null;
}

export interface SilvaSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  case_id?: string | null;
}

// =============================================
// THRESHOLD ENGINE - NEW ENTITIES
// =============================================

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  description: string | null;
  is_personal: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface UserWorkspaceRole {
  id: string;
  user_id: string;
  workspace_id: string;
  role: WorkspaceRole;
  created_at: string;
}

export interface Case {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'active' | 'archived' | 'closed';
  template_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type SignalType = 'observation' | 'fait' | 'intuition' | 'tension' | 'contexte';

export interface Signal {
  id: string;
  case_id: string;
  user_id: string;
  content: string;
  signal_type: SignalType;
  intensity: number | null;
  occurred_at: string | null;
  created_at: string;
}

export type ExportType = 'pdf' | 'png' | 'json';
export type ModuleType = 'irreversa' | 'nulla' | 'thresh' | 'silva' | 'all';

export interface Export {
  id: string;
  user_id: string;
  workspace_id: string | null;
  case_id: string | null;
  export_type: ExportType;
  module: ModuleType;
  file_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  module: ModuleType;
  is_premium: boolean;
  structure: Record<string, unknown>;
  created_at: string;
}

// =============================================
// ENUMS & LABELS
// =============================================

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

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  observation: 'Observation',
  fait: 'Fait',
  intuition: 'Intuition',
  tension: 'Tension',
  contexte: 'Contexte',
};

export const MODULE_LABELS: Record<ModuleType, string> = {
  irreversa: 'IRREVERSA',
  nulla: 'NULLA',
  thresh: 'THRESH',
  silva: 'SILVA',
  all: 'Tous les modules',
};
