import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/hooks/useCases';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useTemplates } from '@/hooks/useTemplates';
import { useSubscription } from '@/hooks/useSubscription';
import { DOMAIN_LABELS, TIME_HORIZON_LABELS, CaseDomain, TimeHorizon, Template } from '@/types/database';

export default function CreateCase() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { personalWorkspace, getOrCreatePersonalWorkspace } = useWorkspaces(user?.id);
  const [workspaceId, setWorkspaceId] = useState<string | undefined>();
  const { createCase } = useCases(workspaceId);
  const { templates, isLoading: templatesLoading } = useTemplates('irreversa');
  const { canUsePremiumTemplates, isPro } = useSubscription(user?.id);

  // Form state
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [domain, setDomain] = useState<CaseDomain>('autre');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon | ''>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure workspace
  useEffect(() => {
    const initWorkspace = async () => {
      if (user && !workspaceId) {
        if (personalWorkspace) {
          setWorkspaceId(personalWorkspace.id);
        } else {
          const ws = await getOrCreatePersonalWorkspace();
          setWorkspaceId(ws.id);
        }
      }
    };
    initWorkspace();
  }, [user, personalWorkspace, workspaceId]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleTemplateSelect = (template: Template) => {
    if (template.is_premium && !canUsePremiumTemplates) {
      // Show upgrade prompt
      return;
    }
    setSelectedTemplate(template);
    // Pre-fill from template
    const structure = template.structure as Record<string, string>;
    if (structure.example_title) setTitle(structure.example_title);
    if (structure.example_description) setContext(structure.example_description);
    if (structure.category) setDomain(structure.category as CaseDomain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workspaceId) return;

    setIsSubmitting(true);
    try {
      const newCase = await createCase.mutateAsync({
        title: title.trim(),
        description: context.trim() || undefined,
        templateId: selectedTemplate?.id,
        metadata: {
          domain,
          time_horizon: timeHorizon || undefined,
        },
      });
      navigate(`/irreversa/cases/${newCase.id}`);
    } catch (error) {
      console.error('Failed to create case:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading only during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary/50 font-display tracking-widest text-sm animate-pulse">
          IRREVERSA
        </span>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  // Show loading while workspace initializes
  if (!workspaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary/50 font-display tracking-widest text-sm animate-pulse">
          Préparation...
        </span>
      </div>
    );
  }

  const freeTemplates = templates.filter(t => !t.is_premium);
  const premiumTemplates = templates.filter(t => t.is_premium);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/irreversa/cases" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            ← Retour aux dossiers
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-primary">IRREVERSA</span>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">
          Nouveau dossier
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Créez un dossier pour regrouper les seuils liés à une décision ou trajectoire.
        </p>

        {/* Templates */}
        {!templatesLoading && templates.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Commencer avec un modèle
            </h2>
            
            {/* Free templates */}
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              {freeTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 text-left border transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <h3 className="font-display text-sm text-foreground mb-1">{template.name}</h3>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>

            {/* Premium templates */}
            <div className="grid md:grid-cols-2 gap-3">
              {premiumTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  disabled={!canUsePremiumTemplates}
                  className={`p-4 text-left border transition-colors relative ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/10'
                      : canUsePremiumTemplates
                        ? 'border-border/50 hover:border-primary/30'
                        : 'border-border/30 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {!canUsePremiumTemplates && (
                    <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-primary/20 text-primary">
                      Pro
                    </span>
                  )}
                  <h3 className="font-display text-sm text-foreground mb-1">{template.name}</h3>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>

            {!isPro && (
              <p className="text-xs text-muted-foreground/60 mt-3 text-center">
                Passez Pro pour accéder aux modèles premium
              </p>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-display text-foreground mb-2">
              Titre du dossier <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Changement de carrière, Investissement immobilier..."
              className="border-primary/20 focus:border-primary"
              required
            />
          </div>

          {/* Context */}
          <div>
            <label className="block text-sm font-display text-foreground mb-2">
              Contexte
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Décrivez brièvement la situation ou la décision en question..."
              className="border-primary/20 focus:border-primary min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground/60 mt-1">
              {context.length}/500 caractères
            </p>
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-display text-foreground mb-2">
              Domaine
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value as CaseDomain)}
              className="w-full px-3 py-2 border border-primary/20 bg-background text-foreground"
            >
              {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Time horizon */}
          <div>
            <label className="block text-sm font-display text-foreground mb-2">
              Horizon temporel <span className="text-muted-foreground/60">(optionnel)</span>
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as TimeHorizon | '')}
              className="w-full px-3 py-2 border border-primary/20 bg-background text-foreground"
            >
              <option value="">Sélectionner...</option>
              {Object.entries(TIME_HORIZON_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              {isSubmitting ? 'Création...' : 'Créer le dossier'}
            </Button>
            <Link to="/irreversa/cases">
              <Button type="button" variant="ghost" className="text-muted-foreground">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
