import { useMemo, useState } from 'react';
import { subDays, format, isAfter, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, FileText, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { UpgradeModal } from '@/components/UpgradeModal';

interface ThreshEntry {
  id: string;
  title: string;
  tags: string[];
  intensity: number;
  created_at: string;
}

interface ThreshSynthesisProps {
  entries: ThreshEntry[];
  isSubscribed: boolean;
}

export function ThreshSynthesis({ entries, isSubscribed }: ThreshSynthesisProps) {
  const [period, setPeriod] = useState<'week' | 'month'>('month');

  const synthesis = useMemo(() => {
    const now = new Date();
    const daysAgo = period === 'week' ? 7 : 30;
    const previousDaysAgo = daysAgo * 2;
    
    const periodStart = startOfDay(subDays(now, daysAgo));
    const previousPeriodStart = startOfDay(subDays(now, previousDaysAgo));
    
    const currentEntries = entries.filter(e => isAfter(new Date(e.created_at), periodStart));
    const previousEntries = entries.filter(e => {
      const date = new Date(e.created_at);
      return isAfter(date, previousPeriodStart) && !isAfter(date, periodStart);
    });

    // Dominant tags
    const tagCounts: Record<string, number> = {};
    currentEntries.forEach(e => {
      e.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const dominantTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Intensity variations
    const currentAvg = currentEntries.length > 0
      ? currentEntries.filter(e => e.intensity).reduce((a, b) => a + b.intensity, 0) / currentEntries.length
      : 0;
    const previousAvg = previousEntries.length > 0
      ? previousEntries.filter(e => e.intensity).reduce((a, b) => a + b.intensity, 0) / previousEntries.length
      : 0;
    const intensityTrend = currentAvg - previousAvg;

    // Marked entries (top 3 by intensity)
    const markedEntries = [...currentEntries]
      .sort((a, b) => (b.intensity || 0) - (a.intensity || 0))
      .slice(0, 3);

    return {
      dominantTags,
      currentAvg,
      previousAvg,
      intensityTrend,
      markedEntries,
      totalCurrent: currentEntries.length,
      totalPrevious: previousEntries.length,
      periodLabel: period === 'week' ? 'cette semaine' : 'ce mois',
      previousLabel: period === 'week' ? 'semaine précédente' : 'mois précédent',
    };
  }, [entries, period]);

  const getTrendIcon = () => {
    if (synthesis.intensityTrend > 0.3) return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (synthesis.intensityTrend < -0.3) return <TrendingDown className="w-4 h-4 text-green-400" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendLabel = () => {
    if (synthesis.intensityTrend > 0.3) return 'En hausse';
    if (synthesis.intensityTrend < -0.3) return 'En baisse';
    return 'Stable';
  };

  if (!isSubscribed) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h3 className="font-display text-xl text-foreground mb-2 flex items-center gap-2">
            Synthèse périodique
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-sm text-muted-foreground">
            Résumé automatique de tes entrées sur une période.
          </p>
        </div>

        <div className="p-8 border border-amber-500/30 bg-amber-500/5 text-center">
          <Lock className="w-8 h-8 text-amber-500 mx-auto mb-4" />
          <h4 className="font-display text-lg text-foreground mb-2">Fonctionnalité Pro</h4>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            La synthèse périodique te donne un résumé clair de tes bascules ressenties: 
            tags dominants, variations d'intensité, entrées marquantes.
          </p>
          <UpgradeModal 
            trigger={
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider">
                Débloquer Pro — 9,90€/mois
              </Button>
            }
          />
        </div>

        <div className="p-4 bg-card/30 border border-amber-500/10 text-xs text-muted-foreground text-center">
          Ce résumé n'est pas une vérité. C'est une mise en ordre.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-display text-xl text-foreground mb-2 flex items-center gap-2">
            Synthèse périodique
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-sm text-muted-foreground">
            Résumé automatique de tes entrées.
          </p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')}>
          <SelectTrigger className="w-[140px] bg-card/50 border-amber-500/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Hebdomadaire</SelectItem>
            <SelectItem value="month">Mensuelle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {synthesis.totalCurrent === 0 ? (
        <div className="text-center py-12 border border-dashed border-amber-500/20">
          <FileText className="w-8 h-8 text-amber-500/40 mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune entrée {synthesis.periodLabel}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview */}
          <Card className="border-amber-500/20 bg-card/30">
            <CardHeader>
              <CardTitle className="font-display text-lg">Vue d'ensemble</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-display text-amber-500">{synthesis.totalCurrent}</div>
                  <p className="text-xs text-muted-foreground">entrées {synthesis.periodLabel}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-display text-muted-foreground">{synthesis.totalPrevious}</div>
                  <p className="text-xs text-muted-foreground">{synthesis.previousLabel}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-display text-amber-500">{synthesis.currentAvg.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">intensité moyenne</p>
                </div>
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    {getTrendIcon()}
                    <span className="text-lg font-display">{getTrendLabel()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs. période précédente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dominant tags */}
          <Card className="border-amber-500/20 bg-card/30">
            <CardHeader>
              <CardTitle className="font-display text-lg">Tags dominants</CardTitle>
            </CardHeader>
            <CardContent>
              {synthesis.dominantTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun tag</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {synthesis.dominantTags.map(([tag, count], index) => (
                    <Badge 
                      key={tag}
                      className={`${
                        index === 0 
                          ? 'bg-amber-500 text-black' 
                          : 'bg-amber-500/20 text-amber-500'
                      }`}
                    >
                      {tag} ({count}x)
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Marked entries */}
          <Card className="border-amber-500/20 bg-card/30">
            <CardHeader>
              <CardTitle className="font-display text-lg">Entrées marquantes</CardTitle>
            </CardHeader>
            <CardContent>
              {synthesis.markedEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune entrée</p>
              ) : (
                <div className="space-y-3">
                  {synthesis.markedEntries.map((entry) => (
                    <div key={entry.id} className="p-3 bg-amber-500/5 border border-amber-500/10">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), 'dd MMM', { locale: fr })}
                        </span>
                        {entry.intensity && (
                          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-500">
                            Intensité {entry.intensity}/5
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground">{entry.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-4 bg-card/30 border border-amber-500/10 text-xs text-muted-foreground text-center">
        Ce résumé n'est pas une vérité. C'est une mise en ordre.
      </div>
    </div>
  );
}
