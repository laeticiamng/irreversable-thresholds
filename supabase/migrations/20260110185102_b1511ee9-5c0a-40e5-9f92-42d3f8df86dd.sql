-- Add enhanced fields to absences table for NULLA module
ALTER TABLE public.absences 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'autre',
ADD COLUMN IF NOT EXISTS impact_level text DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS counterfactual text,
ADD COLUMN IF NOT EXISTS evidence_needed text;

-- Insert NULLA templates (2 free + 6 premium)
INSERT INTO public.templates (name, slug, description, module, is_premium, structure)
VALUES 
  -- Free templates
  ('Absence de ressource', 'nulla-ressource', 'Modèle pour les ressources manquantes (argent, temps, outils)', 'nulla', false, '{"category": "ressource", "example_title": "Manque de financement", "example_effect": "Cela rend impossible le lancement du projet dans les délais prévus."}'),
  ('Absence de preuve / document', 'nulla-preuve', 'Modèle pour les preuves ou documents manquants', 'nulla', false, '{"category": "preuve", "example_title": "Absence de justificatif", "example_effect": "Cela rend très difficile la validation administrative du dossier."}'),
  
  -- Premium templates
  ('Absence d''accès', 'nulla-acces', 'Modèle pour les accès manquants (infrastructure, service, réseau)', 'nulla', true, '{"category": "acces", "example_title": "Pas d''accès au système interne", "example_effect": "Cela force à contourner par des canaux informels, augmentant le risque d''erreur."}'),
  ('Absence de protection', 'nulla-protection', 'Modèle pour les protections manquantes (filet de sécurité, assurance)', 'nulla', true, '{"category": "protection", "example_title": "Pas de couverture santé", "example_effect": "Cela rend très coûteux tout imprévu médical et limite les choix professionnels."}'),
  ('Absence d''information fiable', 'nulla-information', 'Modèle pour les informations manquantes ou peu fiables', 'nulla', true, '{"category": "information", "example_title": "Données de marché incomplètes", "example_effect": "Cela force à prendre des décisions sur des hypothèses non vérifiées."}'),
  ('Absence de compétence clé', 'nulla-competence', 'Modèle pour les compétences manquantes dans l''équipe', 'nulla', true, '{"category": "competence", "example_title": "Pas de développeur backend", "example_effect": "Cela bloque la progression technique et rend impossible l''autonomie sur le produit."}'),
  ('Absence de continuité / stabilité', 'nulla-stabilite', 'Modèle pour le manque de stabilité ou continuité', 'nulla', true, '{"category": "stabilite", "example_title": "Turnover élevé dans l''équipe", "example_effect": "Cela empêche la capitalisation des connaissances et ralentit chaque nouveau projet."}'),
  ('Absence de soutien / relation', 'nulla-relation', 'Modèle pour le manque de soutien ou relations clés', 'nulla', true, '{"category": "relation", "example_title": "Pas de mentor ou sponsor interne", "example_effect": "Cela rend très difficile l''avancement de carrière et l''accès aux opportunités cachées."}')
ON CONFLICT (slug) DO NOTHING;

-- Also add 2 free + 6 premium THRESH templates
INSERT INTO public.templates (name, slug, description, module, is_premium, structure)
VALUES 
  -- Free templates
  ('Seuil de rupture', 'thresh-rupture', 'Modèle pour les points de rupture', 'thresh', false, '{"thresh_type": "rupture", "example_title": "Burn-out imminent", "example_desc": "Le niveau de charge de travail dépasse ce qui est soutenable."}'),
  ('Seuil de trop', 'thresh-trop', 'Modèle pour les excès détectés', 'thresh', false, '{"thresh_type": "trop", "example_title": "Trop d''engagements simultanés", "example_desc": "Le nombre de projets en cours dépasse ma capacité de suivi."}'),
  
  -- Premium templates
  ('Seuil de pas assez', 'thresh-pas-assez', 'Modèle pour les manques ressentis', 'thresh', true, '{"thresh_type": "pas_assez", "example_title": "Pas assez de temps libre", "example_desc": "Le temps personnel a été réduit sous le seuil acceptable."}'),
  ('Seuil d''évidence', 'thresh-evidence', 'Modèle pour les prises de conscience', 'thresh', true, '{"thresh_type": "evidence", "example_title": "Cette relation ne fonctionne plus", "example_desc": "Ce qui était flou devient soudainement évident."}'),
  ('Seuil de saturation', 'thresh-saturation', 'Modèle pour la saturation mentale ou émotionnelle', 'thresh', true, '{"thresh_type": "saturation", "example_title": "Saturation d''informations", "example_desc": "Le flux d''informations dépasse ma capacité d''absorption."}'),
  ('Seuil d''acceptabilité', 'thresh-acceptabilite', 'Modèle pour ce qui devient inacceptable', 'thresh', true, '{"thresh_type": "acceptabilite", "example_title": "Comportement inacceptable", "example_desc": "Ce qui était toléré ne l''est plus."}'),
  ('Seuil de tolérance', 'thresh-tolerance', 'Modèle pour les limites de tolérance', 'thresh', true, '{"thresh_type": "tolerance", "example_title": "Limite de patience atteinte", "example_desc": "La tolérance envers cette situation est épuisée."}'),
  ('Seuil personnel', 'thresh-personnel', 'Modèle générique pour les seuils personnels', 'thresh', true, '{"thresh_type": "acceptabilite", "example_title": "Mon seuil", "example_desc": "Un seuil invisible que je ressens."}')
ON CONFLICT (slug) DO NOTHING;