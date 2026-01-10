import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/hooks/useCases';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useTemplates } from '@/hooks/useTemplates';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  DOMAIN_LABELS, 
  TIME_HORIZON_LABELS, 
  MODULE_LABELS,
  CaseDomain, 
  TimeHorizon, 
  Template,
  ModuleType 
} from '@/types/database';
import { Folder, ArrowRight } from 'lucide-react';

const MODULE_DESCRIPTIONS: Record<ModuleType, string> = {
  irreversa: "Cartographier les seuils d'irréversibilité pour anticiper les points de non-retour",
  thresh: "Identifier et ressentir les seuils invisibles qui structurent votre expérience",
  nulla: "Explorer ce qui n'existe pas et son influence sur ce qui est",
  silva: "Un espace de réflexion libre et silencieuse",
  all: "Tous les modules",
};

const MODULE_COLORS: Record<ModuleType, string> = {
  irreversa: 'border-primary hover:bg-primary/10',
  thresh: 'border-amber-500/50 hover:bg-amber-500/10',
  nulla: 'border-violet-500/50 hover:bg-violet-500/10',
  silva: 'border-emerald-500/50 hover:bg-emerald-500/10',
  all: 'border-border',
};

const MODULE_ROUTES: Record<ModuleType, string> = {
  irreversa: '/irreversa/cases',
  thresh: '/thresh/cases',
  nulla: '/nulla/cases',
  silva: '/silva/spaces',
  all: '/dashboard',
};

export default function CreateCase() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { personalWorkspace, getOrCreatePersonalWorkspace } = useWorkspaces(user?.id);
  const [workspaceId, setWorkspaceId] = useState<string | undefined>();
  const { createCase } = useCases(workspaceId);
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { canUsePremiumTemplates, isPro } = useSubscription(user?.id);

  // Step state
  const [step, setStep] = useState<'module' | 'details'>('module');
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);

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
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  const moduleTemplates = selectedModule 
    ? templates.filter(t => t.module === selectedModule)
    : [];

  const handleTemplateSelect = (template: Template) => {
    if (template.is_premium && !canUsePremiumTemplates) {
      return;
    }
    setSelectedTemplate(template);
    const structure = template.structure as Record<string, string>;
    if (structure.example_title) setTitle(structure.example_title);
    if (structure.example_description) setContext(structure.example_description);
    if (structure.category) setDomain(structure.category as CaseDomain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workspaceId || !selectedModule) return;

    setIsSubmitting(true);
    try {
      const newCase = await createCase.mutateAsync({
        title: title.trim(),
        description: context.trim() || undefined,
        templateId: selectedTemplate?.id,
        metadata: {
          domain,
          time_horizon: timeHorizon || undefined,
          module: selectedModule,
        },
      });
      
      // Navigate to the appropriate module case page
      const modulePath = selectedModule === 'irreversa' 
        ? `/irreversa/cases/${newCase.id}`
        : selectedModule === 'thresh'
        ? `/thresh/cases/${newCase.id}`
        : selectedModule === 'nulla'
        ? `/nulla/cases/${newCase.id}`
        : `/silva/spaces/${newCase.id}`;
      
      navigate(modulePath);
    } catch (error) {
      console.error('Failed to create case:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !workspaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary/50 font-display tracking-widest text-sm animate-pulse">
          Chargement...
        </span>
      </div>
    );
  }

  const availableModules: ModuleType[] = ['irreversa', 'thresh', 'nulla', 'silva'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            ← Retour au tableau de bord
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-foreground">NOUVEAU DOSSIER</span>
          <div className="w-32" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {step === 'module' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">
              Choisir un territoire
            </h1>
            <p className="text-muted-foreground text-sm mb-10">
              Sélectionnez le module dans lequel vous souhaitez créer votre dossier.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {availableModules.map((mod, index) => (
                <motion.button
                  key={mod}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedModule(mod);
                    setStep('details');
                  }}
                  className={`p-6 text-left border-2 transition-all duration-300 group ${MODULE_COLORS[mod]} ${
                    selectedModule === mod ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-xl tracking-wide text-foreground mb-2 group-hover:text-primary transition-colors">
                        {MODULE_LABELS[mod]}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {MODULE_DESCRIPTIONS[mod]}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => setStep('module')}
              className="text-xs text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2"
            >
              ← Changer de territoire
            </button>

            <div className="flex items-center gap-3 mb-6">
              <Folder className="w-6 h-6 text-primary" />
              <h1 className="font-display text-2xl tracking-wide text-foreground">
                Nouveau dossier {MODULE_LABELS[selectedModule!]}
              </h1>
            </div>

            {/* Templates */}
            {!templatesLoading && moduleTemplates.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground mb-4">
                  Commencer avec un modèle
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {moduleTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      disabled={template.is_premium && !canUsePremiumTemplates}
                      className={`p-4 text-left border transition-colors relative ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary bg-primary/10'
                          : template.is_premium && !canUsePremiumTemplates
                            ? 'border-border/30 opacity-60 cursor-not-allowed'
                            : 'border-border/50 hover:border-primary/30'
                      }`}
                    >
                      {template.is_premium && !canUsePremiumTemplates && (
                        <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-primary/20 text-primary">
                          Pro
                        </span>
                      )}
                      <h3 className="font-display text-sm text-foreground mb-1">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </button>
                  ))}
                </div>
                {!isPro && moduleTemplates.some(t => t.is_premium) && (
                  <p className="text-xs text-muted-foreground/60 mt-3 text-center">
                    Passez Pro pour accéder aux modèles premium
                  </p>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="grid md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-display text-foreground mb-2">
                    Horizon temporel
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
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={!title.trim() || isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                >
                  {isSubmitting ? 'Création...' : 'Créer le dossier'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-muted-foreground"
                  onClick={() => navigate('/dashboard')}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
