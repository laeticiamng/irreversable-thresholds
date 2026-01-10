import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Target, Eye, XCircle, Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';

const modules = [
  {
    id: 'irreversa',
    name: 'IRREVERSA',
    tagline: 'Points de non-retour',
    description: 'Repère les seuils où une trajectoire bascule définitivement. Visualise ce qui change après, et ce qui ne peut être défait.',
    icon: Target,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    path: '/irreversa/home',
    examples: ['Signer un contrat', 'Démissionner', 'Publier', 'Rompre'],
  },
  {
    id: 'thresh',
    name: 'THRESH',
    tagline: 'Seuils ressentis',
    description: "Note une bascule ressentie avant qu'elle devienne un événement. L'intuition des transitions, capturée en 1 minute.",
    icon: Eye,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    path: '/thresh/home',
    examples: ['Tension', 'Saturation', 'Flou', 'Élan'],
  },
  {
    id: 'nulla',
    name: 'NULLA',
    tagline: 'Absences structurantes',
    description: 'Repère ce qui manque et ce que ça provoque. Diagnostic des vulnérabilités invisibles qui bloquent la progression.',
    icon: XCircle,
    color: 'text-nulla',
    bgColor: 'bg-nulla/10',
    borderColor: 'border-nulla/30',
    path: '/nulla/home',
    examples: ['Preuve manquante', 'Ressource absente', 'Accès bloqué'],
  },
  {
    id: 'silva',
    name: 'SILVA',
    tagline: 'Présence sans fonction',
    description: "Un espace neutre au sein de la suite. Aucun objectif, aucune métrique. Les autres modules structurent, SILVA stabilise.",
    icon: Leaf,
    color: 'text-silva',
    bgColor: 'bg-silva/10',
    borderColor: 'border-silva/30',
    path: '/silva/home',
    examples: ['Espace de respiration', 'Pause contemplative'],
  },
];

const steps = [
  {
    number: 1,
    title: 'Choisis ton territoire',
    description: 'Chaque module répond à un besoin différent. Commence par celui qui résonne le plus.',
  },
  {
    number: 2,
    title: 'Crée ton premier dossier',
    description: 'Un dossier = un sujet, une décision, une trajectoire à clarifier.',
  },
  {
    number: 3,
    title: 'Ajoute des entrées',
    description: 'Seuils, absences, bascules ressenties... Structure ta réflexion progressivement.',
  },
  {
    number: 4,
    title: 'Exporte si besoin',
    description: 'Génère un rapport PDF pour garder une trace ou partager.',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const handleStart = () => {
    if (selectedModule) {
      const module = modules.find(m => m.id === selectedModule);
      if (module) {
        navigate(module.path);
      }
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="font-display text-sm tracking-[0.3em] text-muted-foreground uppercase">
            Suite
          </Link>
          {user && (
            <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Aller au dashboard →
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="font-display text-3xl md:text-4xl tracking-wide text-foreground mb-4">
            Bienvenue dans ta suite de lucidité
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            4 outils pour structurer tes décisions, anticiper les transitions, 
            et voir plus clair avant d'agir.
          </p>
        </section>

        {/* Modules Grid */}
        <section className="mb-20">
          <h2 className="text-xs font-display tracking-[0.3em] text-center text-muted-foreground uppercase mb-8">
            Les 4 territoires
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              const isSelected = selectedModule === module.id;
              
              return (
                <button
                  key={module.id}
                  onClick={() => setSelectedModule(isSelected ? null : module.id)}
                  className={`
                    relative p-6 text-left rounded-none border transition-all duration-300
                    ${isSelected 
                      ? `${module.borderColor} ${module.bgColor}` 
                      : 'border-border/50 hover:border-border bg-card/20 hover:bg-card/40'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className={`w-5 h-5 ${module.color}`} />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full ${module.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${module.color}`} />
                    </div>
                    <div>
                      <h3 className={`font-display text-lg tracking-wide ${isSelected ? module.color : 'text-foreground'}`}>
                        {module.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{module.tagline}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {module.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {module.examples.map((ex, i) => (
                      <span 
                        key={i} 
                        className={`text-xs px-2 py-1 border ${isSelected ? module.borderColor : 'border-border/30'} text-muted-foreground`}
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Steps */}
        <section className="mb-20">
          <h2 className="text-xs font-display tracking-[0.3em] text-center text-muted-foreground uppercase mb-8">
            Premiers pas
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-border/30 -translate-x-1/2" />
                )}
                <div className="p-6 border border-border/30 bg-card/10">
                  <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center text-primary text-sm font-display mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-display text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Philosophy */}
        <section className="max-w-2xl mx-auto text-center mb-16 p-8 border border-border/30 bg-card/10">
          <h2 className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase mb-4">
            Notre philosophie
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Cette suite ne donne pas de conseils. Elle ne promet rien. 
            Elle structure ta réflexion sans décider à ta place. 
            <strong className="text-foreground"> Lucidité, pas injonction.</strong>
          </p>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Button 
            onClick={handleStart}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider px-12"
          >
            {selectedModule 
              ? `Commencer avec ${modules.find(m => m.id === selectedModule)?.name}`
              : 'Accéder au dashboard'
            }
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          {!user && (
            <p className="text-xs text-muted-foreground mt-4">
              <Link to="/exposition" className="text-primary hover:underline">
                Créer un compte
              </Link>
              {' '}pour sauvegarder ta progression
            </p>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>Outil de structuration. Pas de promesse. Pas de décision à ta place.</p>
          <div className="flex items-center gap-6">
            <Link to="/manifesto" className="hover:text-foreground">Manifeste</Link>
            <Link to="/about" className="hover:text-foreground">À propos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
