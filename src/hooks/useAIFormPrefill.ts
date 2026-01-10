import { useState, useCallback } from 'react';
import type { AIProposal } from '@/hooks/useAIAssist';

export interface IrreversaFormData {
  title: string;
  category: string;
  whatCannotBeUndone: string;
  whatChangesAfter: string;
  severity?: string;
  conditions?: string;
}

export interface NullaFormData {
  title: string;
  category: string;
  effect: string;
  impactLevel: string;
  counterfactual?: string;
}

export interface ThreshFormData {
  title: string;
  description: string;
  threshType?: string;
  tags: string[];
  intensity: number;
  context?: string;
}

type FormData = IrreversaFormData | NullaFormData | ThreshFormData;

export function useAIFormPrefill<T extends FormData>() {
  const [prefillData, setPrefillData] = useState<Partial<T> | null>(null);
  const [showFormWithPrefill, setShowFormWithPrefill] = useState(false);

  const handleAIAccept = useCallback((proposal: AIProposal, module: 'irreversa' | 'nulla' | 'thresh') => {
    const content = proposal.modifiedContent || proposal.content;
    
    let formData: Partial<FormData> = {};

    if (module === 'irreversa') {
      formData = {
        title: content.title || '',
        category: content.category?.toLowerCase() || 'autre',
        whatCannotBeUndone: content.non_reversible_statement || '',
        whatChangesAfter: content.after_effects || '',
        severity: mapSeverity(content.severity),
        conditions: content.conditions || '',
      } as IrreversaFormData;
    } else if (module === 'nulla') {
      formData = {
        title: content.absence_title || content.title || '',
        category: mapNullaCategory(content.category),
        effect: content.effect || '',
        impactLevel: mapImpactLevel(content.impact_level),
        counterfactual: content.counterfactual || '',
      } as NullaFormData;
    } else if (module === 'thresh') {
      formData = {
        title: content.suggested_rewrite || content.phrase || '',
        description: content.description || content.context || '',
        threshType: mapThreshType(content.type || content.thresh_type),
        tags: content.suggested_tags || content.tags || [],
        intensity: content.suggested_intensity || content.intensity || 3,
        context: content.context || '',
      } as ThreshFormData;
    }

    setPrefillData(formData as Partial<T>);
    setShowFormWithPrefill(true);
  }, []);

  const clearPrefill = useCallback(() => {
    setPrefillData(null);
    setShowFormWithPrefill(false);
  }, []);

  return {
    prefillData,
    showFormWithPrefill,
    setShowFormWithPrefill,
    handleAIAccept,
    clearPrefill,
  };
}

// Helper mappers
function mapSeverity(severity?: string): string {
  const map: Record<string, string> = {
    'faible': 'minor',
    'modéré': 'moderate',
    'modérée': 'moderate',
    'élevé': 'major',
    'élevée': 'major',
    'critique': 'critical',
    'minor': 'minor',
    'moderate': 'moderate',
    'major': 'major',
    'critical': 'critical',
  };
  return map[(severity || '').toLowerCase()] || 'moderate';
}

function mapNullaCategory(category?: string): string {
  const map: Record<string, string> = {
    'ressource': 'ressource',
    'preuve/document': 'preuve',
    'preuve': 'preuve',
    'document': 'preuve',
    'accès': 'acces',
    'acces': 'acces',
    'compétence': 'competence',
    'competence': 'competence',
    'protection': 'protection',
    'information': 'information',
    'soutien': 'relation',
    'relation': 'relation',
    'stabilité': 'stabilite',
    'stabilite': 'stabilite',
    'autre': 'autre',
  };
  return map[(category || '').toLowerCase()] || 'autre';
}

function mapImpactLevel(level?: string): string {
  const map: Record<string, string> = {
    'faible': 'low',
    'low': 'low',
    'modéré': 'moderate',
    'modérée': 'moderate',
    'moderate': 'moderate',
    'élevé': 'high',
    'élevée': 'high',
    'high': 'high',
  };
  return map[(level || '').toLowerCase()] || 'moderate';
}

function mapThreshType(type?: string): string {
  const map: Record<string, string> = {
    'trop': 'trop',
    'pas assez': 'pas_assez',
    'pas_assez': 'pas_assez',
    'rupture': 'rupture',
    'evidence': 'evidence',
    'évidence': 'evidence',
    'saturation': 'saturation',
    'acceptabilité': 'acceptabilite',
    'acceptabilite': 'acceptabilite',
    'tolérance': 'tolerance',
    'tolerance': 'tolerance',
  };
  return map[(type || '').toLowerCase()] || 'trop';
}
