import { Loader2, Milestone, CircleDot, Eye, Trees } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OrgStatsProps {
  organizationId: string;
}

export function OrgStats({ organizationId }: OrgStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['org-stats', organizationId],
    queryFn: async () => {
      // Fetch all stats in parallel
      const [thresholdsRes, absencesRes, invisibleRes, silvaRes] = await Promise.all([
        supabase
          .from('thresholds')
          .select('id, is_crossed')
          .eq('organization_id', organizationId),
        supabase
          .from('absences')
          .select('id')
          .eq('organization_id', organizationId),
        supabase
          .from('invisible_thresholds')
          .select('id')
          .eq('organization_id', organizationId),
        supabase
          .from('silva_sessions')
          .select('id, duration_seconds')
          .eq('organization_id', organizationId),
      ]);

      const thresholds = thresholdsRes.data || [];
      const absences = absencesRes.data || [];
      const invisibleThresholds = invisibleRes.data || [];
      const silvaSessions = silvaRes.data || [];

      return {
        thresholdsCount: thresholds.length,
        thresholdsCrossed: thresholds.filter(t => t.is_crossed).length,
        absencesCount: absences.length,
        invisibleThresholdsCount: invisibleThresholds.length,
        silvaSessionsCount: silvaSessions.length,
        silvaTimeSpent: silvaSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0),
      };
    },
    enabled: !!organizationId,
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statItems = [
    {
      title: 'IRREVERSA',
      subtitle: 'Seuils irréversibles',
      value: stats?.thresholdsCount || 0,
      subValue: `${stats?.thresholdsCrossed || 0} franchis`,
      icon: Milestone,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'NULLA',
      subtitle: 'Absences structurantes',
      value: stats?.absencesCount || 0,
      subValue: 'documentées',
      icon: CircleDot,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'THRESH',
      subtitle: 'Seuils ressentis',
      value: stats?.invisibleThresholdsCount || 0,
      subValue: 'identifiés',
      icon: Eye,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'SILVA',
      subtitle: 'Sessions de réflexion',
      value: stats?.silvaSessionsCount || 0,
      subValue: formatTime(stats?.silvaTimeSpent || 0),
      icon: Trees,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bgColor} rounded-full -mr-8 -mt-8 opacity-50`} />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <CardTitle className={`text-sm font-bold ${stat.color}`}>
                  {stat.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.subValue}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
