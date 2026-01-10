import { useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, Plus, Edit, Trash2, CheckCircle, Eye, 
  Target, XCircle, Leaf, UserPlus, Clock
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'cross' | 'sense' | 'invite' | 'join';
  module: 'irreversa' | 'thresh' | 'nulla' | 'silva' | 'case' | 'collaboration';
  title: string;
  description?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  created_at: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  showHeader?: boolean;
}

const TYPE_CONFIG = {
  create: { icon: Plus, color: 'text-green-500', label: 'Créé' },
  update: { icon: Edit, color: 'text-amber-500', label: 'Modifié' },
  delete: { icon: Trash2, color: 'text-red-500', label: 'Supprimé' },
  cross: { icon: CheckCircle, color: 'text-primary', label: 'Franchi' },
  sense: { icon: Eye, color: 'text-amber-500', label: 'Ressenti' },
  invite: { icon: UserPlus, color: 'text-blue-500', label: 'Invité' },
  join: { icon: UserPlus, color: 'text-green-500', label: 'Rejoint' },
};

const MODULE_CONFIG = {
  irreversa: { icon: Target, color: 'text-primary', label: 'IRREVERSA' },
  thresh: { icon: Eye, color: 'text-amber-500', label: 'THRESH' },
  nulla: { icon: XCircle, color: 'text-violet-500', label: 'NULLA' },
  silva: { icon: Leaf, color: 'text-emerald-500', label: 'SILVA' },
  case: { icon: Target, color: 'text-primary', label: 'Dossier' },
  collaboration: { icon: UserPlus, color: 'text-blue-500', label: 'Collaboration' },
};

export function ActivityFeed({ activities, maxItems = 10, showHeader = true }: ActivityFeedProps) {
  const sortedActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, maxItems);
  }, [activities, maxItems]);

  if (sortedActivities.length === 0) {
    return (
      <Card className="border-border/50">
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="py-8 text-center">
          <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucune activité récente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5" />
            Activité récente
            <Badge variant="secondary" className="ml-auto">
              {sortedActivities.length}
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ScrollArea className="max-h-80">
          <div className="space-y-4">
            {sortedActivities.map((activity, index) => {
              const typeConfig = TYPE_CONFIG[activity.type];
              const moduleConfig = MODULE_CONFIG[activity.module];
              const TypeIcon = typeConfig.icon;
              const ModuleIcon = moduleConfig.icon;

              return (
                <div
                  key={activity.id}
                  className="flex gap-3 pb-4 border-b border-border/30 last:border-0 last:pb-0"
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${typeConfig.color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
                      <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                    </div>
                    {index < sortedActivities.length - 1 && (
                      <div className="w-px flex-1 bg-border/50 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium truncate">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={`${moduleConfig.color} border-current shrink-0`}>
                        <ModuleIcon className="w-3 h-3 mr-1" />
                        {moduleConfig.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      {activity.user && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {activity.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {activity.user.name}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Helper to generate activity items from data
export function generateActivities(data: {
  thresholds?: any[];
  invisibleThresholds?: any[];
  absences?: any[];
  collaborators?: any[];
}): ActivityItem[] {
  const activities: ActivityItem[] = [];

  // Thresholds
  data.thresholds?.forEach(t => {
    activities.push({
      id: `threshold-create-${t.id}`,
      type: 'create',
      module: 'irreversa',
      title: t.title,
      description: t.description,
      created_at: t.created_at,
    });

    if (t.is_crossed && t.crossed_at) {
      activities.push({
        id: `threshold-cross-${t.id}`,
        type: 'cross',
        module: 'irreversa',
        title: `Seuil franchi: ${t.title}`,
        created_at: t.crossed_at,
      });
    }
  });

  // Invisible Thresholds
  data.invisibleThresholds?.forEach(t => {
    activities.push({
      id: `invisible-create-${t.id}`,
      type: 'create',
      module: 'thresh',
      title: t.title,
      description: t.description,
      created_at: t.created_at,
    });

    if (t.sensed_at) {
      activities.push({
        id: `invisible-sense-${t.id}`,
        type: 'sense',
        module: 'thresh',
        title: `Seuil ressenti: ${t.title}`,
        created_at: t.sensed_at,
      });
    }
  });

  // Absences
  data.absences?.forEach(a => {
    activities.push({
      id: `absence-create-${a.id}`,
      type: 'create',
      module: 'nulla',
      title: a.title,
      description: a.description,
      created_at: a.created_at,
    });
  });

  // Collaborators
  data.collaborators?.forEach(c => {
    activities.push({
      id: `collab-invite-${c.id}`,
      type: 'invite',
      module: 'collaboration',
      title: `Invitation envoyée`,
      description: c.profile?.email,
      created_at: c.invited_at,
    });

    if (c.accepted_at) {
      activities.push({
        id: `collab-join-${c.id}`,
        type: 'join',
        module: 'collaboration',
        title: `${c.profile?.display_name || 'Utilisateur'} a rejoint`,
        created_at: c.accepted_at,
      });
    }
  });

  return activities;
}
