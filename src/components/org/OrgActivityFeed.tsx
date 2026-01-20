import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Loader2, 
  Target, 
  XCircle, 
  Eye, 
  Leaf,
  Plus,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface OrgActivityFeedProps {
  organizationId: string;
  limit?: number;
}

interface Activity {
  id: string;
  type: 'threshold' | 'absence' | 'invisible_threshold' | 'silva_session';
  title: string;
  description?: string;
  createdAt: string;
  status?: string;
  caseId?: string | null;
}

const ACTIVITY_CONFIG = {
  threshold: {
    icon: Target,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    module: 'irreversa',
  },
  absence: {
    icon: XCircle,
    color: 'text-nulla',
    bgColor: 'bg-nulla/10',
    module: 'nulla',
  },
  invisible_threshold: {
    icon: Eye,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    module: 'thresh',
  },
  silva_session: {
    icon: Leaf,
    color: 'text-silva',
    bgColor: 'bg-silva/10',
    module: 'silva',
  },
};

export function OrgActivityFeed({ organizationId, limit = 10 }: OrgActivityFeedProps) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['org-activity', organizationId, limit],
    queryFn: async () => {
      const [thresholdsRes, absencesRes, invisibleRes, silvaRes] = await Promise.all([
        supabase
          .from('thresholds')
          .select('id, title, created_at, is_crossed, case_id')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('absences')
          .select('id, title, created_at, case_id')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('invisible_thresholds')
          .select('id, title, created_at, sensed_at, case_id')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('silva_sessions')
          .select('id, started_at, duration_seconds')
          .eq('organization_id', organizationId)
          .order('started_at', { ascending: false })
          .limit(limit),
      ]);

      const allActivities: Activity[] = [
        ...(thresholdsRes.data || []).map(t => ({
          id: t.id,
          type: 'threshold' as const,
          title: t.title,
          description: t.is_crossed ? 'Seuil franchi' : 'Seuil créé',
          createdAt: t.created_at,
          status: t.is_crossed ? 'crossed' : 'pending',
          caseId: t.case_id,
        })),
        ...(absencesRes.data || []).map(a => ({
          id: a.id,
          type: 'absence' as const,
          title: a.title,
          description: 'Absence documentée',
          createdAt: a.created_at,
          caseId: a.case_id,
        })),
        ...(invisibleRes.data || []).map(t => ({
          id: t.id,
          type: 'invisible_threshold' as const,
          title: t.title,
          description: t.sensed_at ? 'Seuil ressenti' : 'Seuil identifié',
          createdAt: t.created_at,
          status: t.sensed_at ? 'sensed' : 'latent',
          caseId: t.case_id,
        })),
        ...(silvaRes.data || []).map(s => ({
          id: s.id,
          type: 'silva_session' as const,
          title: 'Session SILVA',
          description: s.duration_seconds 
            ? `${Math.round(s.duration_seconds / 60)} minutes de présence`
            : 'Session en cours',
          createdAt: s.started_at,
        })),
      ];

      return allActivities
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    },
    enabled: !!organizationId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </div>
        <p className="font-display text-sm">Aucune activité récente</p>
        <p className="text-xs mt-1">Les actions de l'équipe apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => {
        const config = ACTIVITY_CONFIG[activity.type];
        const Icon = config.icon;
        const moduleUrl = `/${config.module}/cases/${activity.caseId || ''}`;

        return (
          <div
            key={`${activity.type}-${activity.id}`}
            className="group relative flex items-start gap-3 p-3 rounded-lg hover:bg-card/50 transition-colors"
          >
            {/* Timeline connector */}
            {index < activities.length - 1 && (
              <div className="absolute left-[1.4rem] top-12 w-px h-[calc(100%-1rem)] bg-border/30" />
            )}
            
            {/* Icon */}
            <div className={cn(
              'relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0',
              config.bgColor
            )}>
              <Icon className={cn('w-4 h-4', config.color)} />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground/90 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground/60 shrink-0">
                  {formatDistanceToNow(new Date(activity.createdAt), { 
                    addSuffix: true, 
                    locale: fr 
                  })}
                </span>
              </div>
              
              {/* Status badge */}
              {activity.status && (
                <div className="mt-1">
                  {activity.status === 'crossed' && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                      <CheckCircle className="w-3 h-3" />
                      Franchi
                    </span>
                  )}
                  {activity.status === 'sensed' && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                      <CheckCircle className="w-3 h-3" />
                      Ressenti
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Link arrow */}
            {activity.caseId && (
              <Link 
                to={moduleUrl}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
