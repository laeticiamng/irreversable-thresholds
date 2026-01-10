import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Threshold, InvisibleThreshold, Absence } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Target, Eye, XCircle, Plus, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecentActivityProps {
  irreversaThresholds: Threshold[];
  threshThresholds: InvisibleThreshold[];
  absences: Absence[];
}

interface ActivityItem {
  type: 'irreversa' | 'thresh' | 'nulla';
  title: string;
  date: string;
  status: string;
  url: string;
  id: string;
}

export function RecentActivity({ irreversaThresholds, threshThresholds, absences }: RecentActivityProps) {
  // Combine and sort recent activity
  const recentActivity: ActivityItem[] = [
    ...irreversaThresholds.slice(0, 5).map(t => ({
      type: 'irreversa' as const,
      title: t.title,
      date: t.created_at,
      status: t.is_crossed ? 'Franchi' : 'En attente',
      url: t.case_id ? `/irreversa/cases/${t.case_id}` : '/irreversa/cases',
      id: t.id,
    })),
    ...threshThresholds.slice(0, 5).map(t => ({
      type: 'thresh' as const,
      title: t.title,
      date: t.created_at,
      status: t.sensed_at ? 'Ressenti' : 'Latent',
      url: t.case_id ? `/thresh/cases/${t.case_id}` : '/thresh/cases',
      id: t.id,
    })),
    ...absences.slice(0, 5).map(a => ({
      type: 'nulla' as const,
      title: a.title,
      date: a.created_at,
      status: 'Documenté',
      url: a.case_id ? `/nulla/cases/${a.case_id}` : '/nulla/cases',
      id: a.id,
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'irreversa':
        return <Target className="w-3.5 h-3.5 text-primary" />;
      case 'thresh':
        return <Eye className="w-3.5 h-3.5 text-amber-500" />;
      case 'nulla':
        return <XCircle className="w-3.5 h-3.5 text-nulla" />;
    }
  };

  const getColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'irreversa':
        return 'bg-primary/20 border-primary/30';
      case 'thresh':
        return 'bg-amber-500/20 border-amber-500/30';
      case 'nulla':
        return 'bg-nulla/20 border-nulla/30';
    }
  };

  const getTextColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'irreversa':
        return 'text-primary';
      case 'thresh':
        return 'text-amber-500';
      case 'nulla':
        return 'text-nulla';
    }
  };

  if (recentActivity.length === 0) {
    return (
      <div className="border border-border/30 bg-card/10 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm tracking-[0.15em] uppercase text-foreground/80">
            Activité récente
          </h3>
        </div>
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-border/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Aucune activité récente.
          </p>
          <p className="text-muted-foreground/60 text-xs mb-6">
            Crée ton premier dossier pour commencer.
          </p>
          <Link to="/cases/new">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Créer un dossier
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/30 bg-card/10 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm tracking-[0.15em] uppercase text-foreground/80">
            Activité récente
          </h3>
        </div>
        <span className="text-xs text-muted-foreground/60">
          {recentActivity.length} entrées
        </span>
      </div>

      <div className="space-y-2">
        {recentActivity.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link 
              to={item.url}
              className="block p-3 border border-border/20 bg-background/30 hover:bg-card/30 hover:border-border/40 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${getColor(item.type)}`}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate group-hover:text-foreground/80">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] uppercase tracking-wide ${getTextColor(item.type)}`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40">·</span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground/50">
                    {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: fr })}
                  </span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* View all link */}
      <div className="mt-4 pt-4 border-t border-border/20 text-center">
        <Link 
          to="/irreversa/cases"
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors inline-flex items-center gap-1"
        >
          Voir tous les dossiers
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}
