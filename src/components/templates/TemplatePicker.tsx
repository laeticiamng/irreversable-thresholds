import { useState } from 'react';
import { Template, ModuleType, DOMAIN_LABELS, CaseDomain } from '@/types/database';
import { useTemplates } from '@/hooks/useTemplates';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TemplatePickerProps {
  module: ModuleType;
  selectedTemplate: Template | null;
  onSelect: (template: Template | null) => void;
}

export function TemplatePicker({ module, selectedTemplate, onSelect }: TemplatePickerProps) {
  const { user } = useAuth();
  const { templates, isLoading } = useTemplates(module);
  const { canUsePremiumTemplates, isPro } = useSubscription(user?.id);

  const freeTemplates = templates.filter(t => !t.is_premium);
  const premiumTemplates = templates.filter(t => t.is_premium);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-muted-foreground text-sm animate-pulse">
          Chargement des modèles...
        </span>
      </div>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
        Commencer avec un modèle
      </h3>

      {/* Free templates */}
      {freeTemplates.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3">
          {freeTemplates.map((template, index) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              onSelect={onSelect}
              canUse={true}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Premium templates */}
      {premiumTemplates.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span>Modèles Premium</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {premiumTemplates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate?.id === template.id}
                onSelect={onSelect}
                canUse={canUsePremiumTemplates}
                isPremium={true}
                index={index + freeTemplates.length}
              />
            ))}
          </div>
          {!isPro && (
            <p className="text-xs text-muted-foreground/60 text-center mt-2">
              Passez Pro pour accéder aux modèles premium
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: (template: Template | null) => void;
  canUse: boolean;
  isPremium?: boolean;
  index: number;
}

function TemplateCard({ template, isSelected, onSelect, canUse, isPremium, index }: TemplateCardProps) {
  const structure = template.structure as Record<string, unknown>;
  const domain = structure.category ? DOMAIN_LABELS[structure.category as CaseDomain] : null;

  const handleClick = () => {
    if (!canUse) return;
    onSelect(isSelected ? null : template);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      disabled={!canUse}
      className={`p-4 text-left border transition-all duration-200 relative group ${
        isSelected
          ? 'border-primary bg-primary/10 shadow-sm'
          : canUse
            ? 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
            : 'border-border/30 opacity-50 cursor-not-allowed'
      }`}
    >
      {/* Premium badge */}
      {isPremium && !canUse && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Lock className="w-3 h-3 text-primary/60" />
          <Badge variant="outline" className="text-xs border-primary/30 text-primary/60">
            Pro
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
          <FileText className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-display text-sm truncate ${
            isSelected ? 'text-primary' : 'text-foreground'
          }`}>
            {template.name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {template.description}
          </p>
          {domain && (
            <Badge variant="secondary" className="text-xs mt-2">
              {domain}
            </Badge>
          )}
        </div>
      </div>
    </motion.button>
  );
}
