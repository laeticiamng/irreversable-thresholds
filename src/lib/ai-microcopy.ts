// AI Assistant Micro-copy - All UI texts in one place

export const AI_MICROCOPY = {
  // Panel header
  panel: {
    title: 'Aide IA ✨',
    subtitle: 'L\'IA propose, tu décides',
  },

  // Actions section
  actions: {
    sectionTitle: 'QUE VEUX-TU FAIRE ?',
    placeholder: 'Choisis une action...',
  },

  // Context section
  context: {
    sectionTitle: 'CE QUI SERA ANALYSÉ',
    caseLabel: 'Dossier :',
    noCase: 'Aucun dossier sélectionné',
    dataLabel: 'Données :',
    dataCount: (count: number) => `${count} élément${count > 1 ? 's' : ''}`,
  },

  // Execute button states
  execute: {
    idle: 'Lancer l\'analyse',
    loading: 'Analyse en cours...',
    disabled: 'Sélectionne une action',
  },

  // Proposals section
  proposals: {
    sectionTitle: 'PROPOSITIONS',
    badge: (index: number) => `Proposition ${index + 1}`,
    accepted: '✓ Accepté',
    rejected: '✗ Refusé',
    modified: '✎ Modifié',
  },

  // Action buttons
  buttons: {
    accept: 'Accepter',
    reject: 'Refuser',
    modify: 'Modifier',
    save: 'Sauvegarder',
    cancel: 'Annuler',
  },

  // Errors
  errors: {
    notAuthenticated: 'Tu dois être connecté pour utiliser l\'IA',
    proRequired: 'Cette fonctionnalité nécessite un abonnement Pro',
    limitReached: (used: number, limit: number) => 
      `Limite atteinte : ${used}/${limit} actions ce mois`,
    serviceUnavailable: 'Service IA temporairement indisponible',
    invalidResponse: 'Réponse IA invalide, réessaie',
    generic: 'Une erreur s\'est produite',
  },

  // Usage section
  usage: {
    proLabel: '∞ Actions illimitées',
    freeLabel: (used: number, limit: number) => 
      `${used}/${limit} actions ce mois`,
    historyLink: 'Voir l\'historique',
  },

  // Tooltips
  tooltips: {
    proAction: 'Action réservée aux abonnés Pro',
    remainingActions: (remaining: number) => 
      `${remaining} action${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}`,
  },

  // Empty states
  empty: {
    noProposals: 'Lance une analyse pour voir des propositions',
    noHistory: 'Aucune action IA enregistrée',
  },

  // Confirmation messages
  confirmations: {
    proposalAccepted: 'Proposition appliquée !',
    proposalRejected: 'Proposition ignorée',
    proposalModified: 'Proposition modifiée et appliquée',
  },

  // Help texts
  help: {
    disclaimer: 'L\'IA propose, tu décides. Aucune modification automatique.',
    dataPrivacy: 'Tes données sont analysées mais non stockées par l\'IA.',
  },
} as const;

// Action-specific placeholders and help texts
export const AI_ACTION_HELP = {
  irreversa_structure_draft: {
    inputPlaceholder: 'Décris ton seuil en quelques mots...',
    helpText: 'L\'IA va structurer ton texte en catégories et implications',
    exampleInput: 'Ex: "Je quitte mon emploi sans plan B"',
  },
  irreversa_missing_fields: {
    inputPlaceholder: 'Colle le contenu de ton seuil...',
    helpText: 'L\'IA identifie ce qu\'il manque pour clarifier',
    exampleInput: 'Ex: Un seuil avec titre mais sans conséquences',
  },
  irreversa_report_outline: {
    inputPlaceholder: 'Sélectionne les seuils à inclure...',
    helpText: 'L\'IA propose une structure de rapport exportable',
    exampleInput: 'Inclut timeline, synthèse et recommandations',
  },
  nulla_absence_to_effect: {
    inputPlaceholder: 'Décris ce qui manque...',
    helpText: 'L\'IA transforme ton texte en absence + effet structuré',
    exampleInput: 'Ex: "Je n\'ai pas de contrat écrit"',
  },
  nulla_detect_duplicates: {
    inputPlaceholder: 'Sélectionne plusieurs absences...',
    helpText: 'L\'IA détecte les doublons et propose des fusions',
    exampleInput: 'Sélectionne 2+ absences similaires',
  },
  thresh_suggest_tags: {
    inputPlaceholder: 'Écris ce que tu ressens...',
    helpText: 'L\'IA suggère des tags et une reformulation',
    exampleInput: 'Ex: "Je sens que c\'est trop"',
  },
  thresh_period_summary: {
    inputPlaceholder: 'Période à analyser...',
    helpText: 'L\'IA synthétise les tendances de la période',
    exampleInput: 'Les 30 derniers jours de captures',
  },
} as const;