import { Milestone, CircleDot, Eye, Trees } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrgStatsProps {
  thresholdsCount: number;
  thresholdsCrossed: number;
  absencesCount: number;
  invisibleThresholdsCount: number;
  silvaSessionsCount: number;
  silvaTimeSpent: number; // in seconds
}

export function OrgStats({
  thresholdsCount,
  thresholdsCrossed,
  absencesCount,
  invisibleThresholdsCount,
  silvaSessionsCount,
  silvaTimeSpent,
}: OrgStatsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const stats = [
    {
      title: 'IRREVERSA',
      subtitle: 'Seuils irréversibles',
      value: thresholdsCount,
      subValue: `${thresholdsCrossed} franchis`,
      icon: Milestone,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'NULLA',
      subtitle: 'Absences structurantes',
      value: absencesCount,
      subValue: 'documentées',
      icon: CircleDot,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'THRESH',
      subtitle: 'Seuils ressentis',
      value: invisibleThresholdsCount,
      subValue: 'identifiés',
      icon: Eye,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'SILVA',
      subtitle: 'Sessions de réflexion',
      value: silvaSessionsCount,
      subValue: formatTime(silvaTimeSpent),
      icon: Trees,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
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
