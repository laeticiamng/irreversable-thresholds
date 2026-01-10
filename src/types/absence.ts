export interface Absence {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  effects: AbsenceEffect[];
}

export interface AbsenceEffect {
  id: string;
  type: 'prevents' | 'enables' | 'forces' | 'preserves';
  description: string;
  createdAt: Date;
}

export const EFFECT_LABELS: Record<AbsenceEffect['type'], string> = {
  prevents: 'Empêche',
  enables: 'Rend possible',
  forces: 'Force à contourner',
  preserves: 'Préserve',
};
