import { useMemo } from 'react';
import { subDays, startOfWeek, format, isAfter, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, TrendingUp, BarChart3, Calendar, Repeat } from 'lucide-react';

interface ThreshEntry {
  id: string;
  title: string;
  tags: string[];
  intensity: number;
  created_at: string;
}

interface ThreshPatternsProps {
  entries: ThreshEntry[];
  isSubscribed: boolean;
}

export function ThreshPatterns({ entries, isSubscribed }: ThreshPatternsProps) {
  // Calculate patterns
  const patterns = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = startOfDay(subDays(now, 30));
    const recentEntries = entries.filter(e => isAfter(new Date(e.created_at), thirtyDaysAgo));

    // Tag frequency
    const tagCounts: Record<string, number> = {};
    recentEntries.forEach(e => {
      e.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Average intensity
    const intensities = recentEntries.filter(e => e.intensity).map(e => e.intensity);
    const avgIntensity = intensities.length > 0 
      ? intensities.reduce((a, b) => a + b, 0) / intensities.length 
      : 0;

    // Entries per week
    const weekCounts: Record<string, number> = {};
    recentEntries.forEach(e => {
      const weekStart = format(startOfWeek(new Date(e.created_at), { weekStartsOn: 1 }), 'dd/MM');
      weekCounts[weekStart] = (weekCounts[weekStart] || 0) + 1;
    });
    const weeklyData = Object.entries(weekCounts).slice(-4);

    // Repeated phrases (simple detection)
    const phraseCounts: Record<string, number> = {};
    recentEntries.forEach(e => {
      // Normalize phrase
      const normalized = e.title.toLowerCase().trim();
      const words = normalized.split(' ').slice(0, 3).join(' ');
      if (words.length > 5) {
        phraseCounts[words] = (phraseCounts[words] || 0) + 1;
      }
    });
    const repeatedPhrases = Object.entries(phraseCounts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      topTags,
      avgIntensity,
      weeklyData,
      repeatedPhrases,
      totalEntries: recentEntries.length,
    };
  }, [entries]);

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 1.5) return 'Léger';
    if (intensity <= 2.5) return 'Faible';
    if (intensity <= 3.5) return 'Modéré';
    if (intensity <= 4.5) return 'Fort';
    return 'Très fort';
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="font-display text-xl text-foreground mb-2">Patterns</h3>
        <p className="text-sm text-muted-foreground">
          Tendances et répétitions sur les 30 derniers jours.
        </p>
        <p className="text-xs text-amber-500/60 mt-1">
          ⚠️ Pas de prédiction. Pas de diagnostic. Juste ce qui revient.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Tags - Free */}
        <Card className="border-amber-500/20 bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Tags fréquents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patterns.topTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas assez de données</p>
            ) : (
              <div className="space-y-3">
                {patterns.topTags.map(([tag, count]) => (
                  <div key={tag} className="flex items-center gap-3">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                      {tag}
                    </Badge>
                    <Progress 
                      value={(count / patterns.totalEntries) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-muted-foreground">{count}x</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average Intensity - Pro */}
        <Card className={`border-amber-500/20 bg-card/30 ${!isSubscribed ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Intensité moyenne
              {!isSubscribed && <Lock className="w-3 h-3 text-amber-500 ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isSubscribed ? (
              <p className="text-sm text-muted-foreground">Disponible en Pro</p>
            ) : patterns.totalEntries === 0 ? (
              <p className="text-sm text-muted-foreground">Pas assez de données</p>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl font-display text-amber-500 mb-2">
                  {patterns.avgIntensity.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getIntensityLabel(patterns.avgIntensity)} en moyenne
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly concentration - Pro */}
        <Card className={`border-amber-500/20 bg-card/30 ${!isSubscribed ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Pics par semaine
              {!isSubscribed && <Lock className="w-3 h-3 text-amber-500 ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isSubscribed ? (
              <p className="text-sm text-muted-foreground">Disponible en Pro</p>
            ) : patterns.weeklyData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas assez de données</p>
            ) : (
              <div className="space-y-2">
                {patterns.weeklyData.map(([week, count]) => (
                  <div key={week} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">Sem. {week}</span>
                    <Progress 
                      value={(count / Math.max(...patterns.weeklyData.map(w => w[1]))) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-amber-500">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Repeated phrases - Pro */}
        <Card className={`border-amber-500/20 bg-card/30 ${!isSubscribed ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Repeat className="w-4 h-4 text-amber-500" />
              Ce qui revient
              {!isSubscribed && <Lock className="w-3 h-3 text-amber-500 ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isSubscribed ? (
              <p className="text-sm text-muted-foreground">Disponible en Pro</p>
            ) : patterns.repeatedPhrases.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune répétition détectée</p>
            ) : (
              <div className="space-y-2">
                {patterns.repeatedPhrases.map(([phrase, count]) => (
                  <div key={phrase} className="flex items-center justify-between gap-2 p-2 bg-amber-500/5 border border-amber-500/10">
                    <span className="text-sm text-foreground italic">"{phrase}..."</span>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-xs">
                      {count}x
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
