export interface Threshold {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  crossedAt?: Date;
  isCrossed: boolean;
}

export type ThresholdStatus = 'pending' | 'crossed';
