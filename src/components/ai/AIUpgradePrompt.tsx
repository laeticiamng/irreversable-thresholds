import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sparkles, Clock, FileText, Zap, CheckCircle } from 'lucide-react';

interface AIUpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: 'limit' | 'pro_action' | 'general';
  actionsUsed?: number;
  limit?: number;
}

export function AIUpgradePrompt({ 
  open, 
  onOpenChange, 
  reason, 
  actionsUsed = 0, 
  limit = 5 
}: AIUpgradePromptProps) {
  const content = {
    limit: {
      title: 'Limite mensuelle atteinte',
      description: `Tu as utilisé tes ${limit} actions IA gratuites ce mois-ci.`,
      cta: 'Passe Pro pour des actions illimitées',
    },
    pro_action: {
      title: 'Fonctionnalité Pro',
      description: 'Cette action IA est réservée aux abonnés Pro.',
      cta: 'Débloquer les actions Pro',
    },
    general: {
      title: 'Passe à Pro',
      description: 'Débloque tout le potentiel de l\'assistant IA.',
      cta: 'Voir les avantages Pro',
    },
  }[reason];

  const benefits = [
    { icon: Zap, text: 'Actions IA illimitées (fair use)' },
    { icon: FileText, text: 'Synthèses et rapports automatiques' },
    { icon: Clock, text: 'Gain de temps : structuration en 1 clic' },
    { icon: CheckCircle, text: 'Dédoublonnage et fusion intelligente' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display tracking-wider">
            <Sparkles className="w-5 h-5 text-primary" />
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {reason === 'limit' && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Actions utilisées</span>
                <span className="font-mono text-primary">{actionsUsed}/{limit}</span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Renouvellement le mois prochain
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-display tracking-wider text-muted-foreground">
              AVEC PRO TU GAGNES :
            </p>
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <benefit.icon className="w-4 h-4 text-primary shrink-0" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            className="w-full bg-primary hover:bg-primary/90"
            onClick={() => window.location.href = '/account'}
          >
            {content.cta}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            Peut-être plus tard
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground/60 mt-2">
          L'IA propose, tu décides. Aucune action automatique.
        </p>
      </DialogContent>
    </Dialog>
  );
}