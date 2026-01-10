import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  X, ArrowRight, ArrowLeft, Target, Eye, XCircle, Leaf, 
  Sparkles, CheckCircle, Lightbulb, LayoutDashboard
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  highlight?: string;
  action?: {
    label: string;
    path?: string;
  };
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue dans la Suite',
    description: 'Une suite d\'outils pour structurer vos décisions et anticiper les transitions. Pas de promesses, pas de conseils — juste de la clarté.',
    icon: Sparkles,
    color: 'text-primary',
  },
  {
    id: 'irreversa',
    title: 'IRREVERSA — Points de non-retour',
    description: 'Identifiez les seuils où une trajectoire bascule définitivement. Visualisez ce qui change après et ce qui ne peut être défait.',
    icon: Target,
    color: 'text-primary',
    action: { label: 'Explorer IRREVERSA', path: '/irreversa/home' },
  },
  {
    id: 'thresh',
    title: 'THRESH — Seuils ressentis',
    description: 'Notez une bascule ressentie avant qu\'elle devienne un événement. L\'intuition des transitions, capturée en 1 minute.',
    icon: Eye,
    color: 'text-amber-500',
    action: { label: 'Explorer THRESH', path: '/thresh/home' },
  },
  {
    id: 'nulla',
    title: 'NULLA — Absences structurantes',
    description: 'Repérez ce qui manque et ce que ça provoque. Diagnostic des vulnérabilités invisibles qui bloquent la progression.',
    icon: XCircle,
    color: 'text-violet-500',
    action: { label: 'Explorer NULLA', path: '/nulla/home' },
  },
  {
    id: 'silva',
    title: 'SILVA — Présence sans fonction',
    description: 'Un espace neutre au sein de la suite. Aucun objectif, aucune métrique. Les autres modules structurent, SILVA stabilise.',
    icon: Leaf,
    color: 'text-emerald-500',
    action: { label: 'Explorer SILVA', path: '/silva/home' },
  },
  {
    id: 'dashboard',
    title: 'Dashboard — Vue d\'ensemble',
    description: 'Retrouvez tous vos dossiers, statistiques et activités récentes au même endroit. Votre centre de contrôle.',
    icon: LayoutDashboard,
    color: 'text-primary',
    action: { label: 'Aller au Dashboard', path: '/dashboard' },
  },
  {
    id: 'complete',
    title: 'Prêt à commencer !',
    description: 'Vous avez fait le tour des bases. Créez votre premier dossier et commencez à structurer vos décisions.',
    icon: CheckCircle,
    color: 'text-green-500',
  },
];

interface GuidedTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function GuidedTour({ onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <Card className="max-w-lg w-full border-border/50 bg-card">
        <CardContent className="pt-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">
                Étape {currentStep + 1} / {TOUR_STEPS.length}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={onSkip} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <Progress value={progress} className="h-1 mb-8" />

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div className={`w-16 h-16 rounded-full ${step.color.replace('text-', 'bg-')}/10 flex items-center justify-center mx-auto mb-6`}>
                <Icon className={`w-8 h-8 ${step.color}`} />
              </div>

              <h2 className="font-display text-xl mb-3">{step.title}</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {step.description}
              </p>

              {step.action && (
                <Button variant="outline" size="sm" className="mb-6" asChild>
                  <a href={step.action.path}>
                    {step.action.label}
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </a>
                </Button>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Précédent
            </Button>

            <div className="flex gap-1">
              {TOUR_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button onClick={handleNext} className="gap-2">
              {currentStep === TOUR_STEPS.length - 1 ? 'Terminer' : 'Suivant'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Hook to manage tour state
export function useGuidedTour() {
  const [showTour, setShowTour] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    return localStorage.getItem('guided-tour-completed') === 'true';
  });

  const startTour = () => setShowTour(true);
  
  const completeTour = () => {
    setShowTour(false);
    setHasCompletedTour(true);
    localStorage.setItem('guided-tour-completed', 'true');
  };

  const skipTour = () => {
    setShowTour(false);
    setHasCompletedTour(true);
    localStorage.setItem('guided-tour-completed', 'true');
  };

  const resetTour = () => {
    setHasCompletedTour(false);
    localStorage.removeItem('guided-tour-completed');
  };

  return {
    showTour,
    hasCompletedTour,
    startTour,
    completeTour,
    skipTour,
    resetTour,
  };
}
