import { z } from 'zod';

// =============================================
// AUTH SCHEMAS
// =============================================

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z.string()
    .min(1, 'Mot de passe requis')
    .min(8, 'Minimum 8 caractères'),
});

export const signupSchema = z.object({
  email: z.string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z.string()
    .min(1, 'Mot de passe requis')
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  confirmPassword: z.string()
    .min(1, 'Confirmation requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email requis')
    .email('Email invalide'),
});

export const newPasswordSchema = z.object({
  password: z.string()
    .min(1, 'Mot de passe requis')
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  confirmPassword: z.string()
    .min(1, 'Confirmation requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// =============================================
// CASE SCHEMAS
// =============================================

export const createCaseSchema = z.object({
  title: z.string()
    .min(1, 'Titre requis')
    .max(100, 'Maximum 100 caractères'),
  description: z.string()
    .max(500, 'Maximum 500 caractères')
    .optional(),
  domain: z.enum(['personnel', 'travail', 'finance', 'relation', 'organisation', 'autre'])
    .optional(),
  timeHorizon: z.enum(['3_months', '1_year', '5_years', 'undefined'])
    .optional(),
  module: z.enum(['irreversa', 'nulla', 'thresh', 'silva', 'all']),
});

export const updateCaseSchema = createCaseSchema.partial().extend({
  id: z.string().uuid('ID invalide'),
});

// =============================================
// THRESHOLD SCHEMAS (IRREVERSA)
// =============================================

export const createThresholdSchema = z.object({
  title: z.string()
    .min(1, 'Titre requis')
    .max(150, 'Maximum 150 caractères'),
  description: z.string()
    .min(1, 'Description requise')
    .max(1000, 'Maximum 1000 caractères'),
  category: z.enum(['personnel', 'travail', 'finance', 'relation', 'organisation', 'autre'])
    .optional(),
  severity: z.enum(['low', 'moderate', 'high'])
    .optional(),
  whatCannotBeUndone: z.string()
    .max(500, 'Maximum 500 caractères')
    .optional(),
  whatChangesAfter: z.string()
    .max(500, 'Maximum 500 caractères')
    .optional(),
  conditions: z.string()
    .max(500, 'Maximum 500 caractères')
    .optional(),
  notes: z.string()
    .max(1000, 'Maximum 1000 caractères')
    .optional(),
  caseId: z.string().uuid('ID de dossier invalide')
    .optional(),
});

export const createConsequenceSchema = z.object({
  thresholdId: z.string().uuid('ID de seuil invalide'),
  consequenceType: z.enum(['impossible', 'costly', 'changed', 'enabled']),
  description: z.string()
    .min(1, 'Description requise')
    .max(500, 'Maximum 500 caractères'),
});

// =============================================
// ABSENCE SCHEMAS (NULLA)
// =============================================

export const createAbsenceSchema = z.object({
  title: z.string()
    .min(1, 'Titre requis')
    .max(150, 'Maximum 150 caractères'),
  description: z.string()
    .min(1, 'Description requise')
    .max(1000, 'Maximum 1000 caractères'),
  caseId: z.string().uuid('ID de dossier invalide')
    .optional(),
});

export const createEffectSchema = z.object({
  absenceId: z.string().uuid('ID d\'absence invalide'),
  effectType: z.enum(['prevents', 'enables', 'forces', 'preserves']),
  description: z.string()
    .min(1, 'Description requise')
    .max(500, 'Maximum 500 caractères'),
});

// =============================================
// INVISIBLE THRESHOLD SCHEMAS (THRESH)
// =============================================

export const createInvisibleThresholdSchema = z.object({
  title: z.string()
    .min(1, 'Titre requis')
    .max(150, 'Maximum 150 caractères'),
  description: z.string()
    .min(1, 'Description requise')
    .max(1000, 'Maximum 1000 caractères'),
  threshType: z.enum(['trop', 'pas_assez', 'rupture', 'evidence', 'saturation', 'acceptabilite', 'tolerance']),
  caseId: z.string().uuid('ID de dossier invalide')
    .optional(),
  tags: z.array(z.string().max(30, 'Tag trop long'))
    .max(5, 'Maximum 5 tags')
    .optional(),
  intensity: z.number()
    .min(1, 'Minimum 1')
    .max(5, 'Maximum 5')
    .optional(),
  context: z.string()
    .max(500, 'Maximum 500 caractères')
    .optional(),
});

export const quickCaptureSchema = z.object({
  title: z.string()
    .min(1, 'Phrase requise')
    .max(120, 'Maximum 120 caractères'),
  tags: z.array(z.string())
    .min(1, 'Au moins 1 tag')
    .max(3, 'Maximum 3 tags'),
  intensity: z.number()
    .min(1, 'Minimum 1')
    .max(5, 'Maximum 5'),
  context: z.string()
    .max(280, 'Maximum 280 caractères')
    .optional(),
  caseId: z.string().uuid('ID de dossier invalide')
    .optional(),
});

// =============================================
// SIGNAL SCHEMAS (THRESH)
// =============================================

export const createSignalSchema = z.object({
  content: z.string()
    .min(1, 'Contenu requis')
    .max(500, 'Maximum 500 caractères'),
  signalType: z.enum(['observation', 'fait', 'intuition', 'tension', 'contexte']),
  intensity: z.number()
    .min(1, 'Minimum 1')
    .max(5, 'Maximum 5')
    .optional(),
  occurredAt: z.string().datetime()
    .optional(),
  caseId: z.string().uuid('ID de dossier invalide')
    .optional(),
});

// =============================================
// SILVA SESSION SCHEMAS
// =============================================

export const createSilvaSessionSchema = z.object({
  caseId: z.string().uuid('ID de dossier invalide')
    .optional(),
  notes: z.string()
    .max(2000, 'Maximum 2000 caractères')
    .optional(),
});

// =============================================
// ORGANIZATION SCHEMAS
// =============================================

export const createOrganizationSchema = z.object({
  name: z.string()
    .min(1, 'Nom requis')
    .max(100, 'Maximum 100 caractères'),
  slug: z.string()
    .min(1, 'Slug requis')
    .max(50, 'Maximum 50 caractères')
    .regex(/^[a-z0-9-]+$/, 'Seulement lettres minuscules, chiffres et tirets'),
  description: z.string()
    .max(500, 'Maximum 500 caractères')
    .optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  role: z.enum(['admin', 'member', 'viewer']),
});

export const createTeamSchema = z.object({
  name: z.string()
    .min(1, 'Nom requis')
    .max(50, 'Maximum 50 caractères'),
  description: z.string()
    .max(200, 'Maximum 200 caractères')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur HEX invalide')
    .optional(),
});

// =============================================
// TEMPLATE SCHEMAS
// =============================================

export const createTemplateSchema = z.object({
  name: z.string()
    .min(1, 'Nom requis')
    .max(100, 'Maximum 100 caractères'),
  description: z.string()
    .max(500, 'Maximum 500 caractères')
    .optional(),
  module: z.enum(['irreversa', 'nulla', 'thresh', 'silva', 'all']),
  isPremium: z.boolean().default(false),
  structure: z.record(z.unknown()).default({}),
});

// =============================================
// WORKSPACE SCHEMAS
// =============================================

export const createWorkspaceSchema = z.object({
  name: z.string()
    .min(1, 'Nom requis')
    .max(100, 'Maximum 100 caractères'),
  description: z.string()
    .max(500, 'Maximum 500 caractères')
    .optional(),
  isPersonal: z.boolean().default(false),
});

// =============================================
// PROFILE SCHEMAS
// =============================================

export const updateProfileSchema = z.object({
  displayName: z.string()
    .max(50, 'Maximum 50 caractères')
    .optional(),
  email: z.string()
    .email('Email invalide')
    .optional(),
  avatarUrl: z.string()
    .url('URL invalide')
    .optional(),
});

// =============================================
// TYPE EXPORTS
// =============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type CreateThresholdInput = z.infer<typeof createThresholdSchema>;
export type CreateConsequenceInput = z.infer<typeof createConsequenceSchema>;
export type CreateAbsenceInput = z.infer<typeof createAbsenceSchema>;
export type CreateEffectInput = z.infer<typeof createEffectSchema>;
export type CreateInvisibleThresholdInput = z.infer<typeof createInvisibleThresholdSchema>;
export type QuickCaptureInput = z.infer<typeof quickCaptureSchema>;
export type CreateSignalInput = z.infer<typeof createSignalSchema>;
export type CreateSilvaSessionInput = z.infer<typeof createSilvaSessionSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
