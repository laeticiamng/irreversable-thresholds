import { useMemo } from 'react';
import { subDays, startOfDay, isAfter, format, getDay, getHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Minus, Clock, Calendar, 
  Zap, AlertTriangle, Target, BarChart3, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ThreshEntry {
  id: string;
  title: string;
  tags: string[];
  intensity: number;
  created_at: string;
  sensed_at?: string | null;
  thresh_type?: string;
}

interface ThreshAdvancedPatternsProps {
  entries: ThreshEntry[];
}

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const HOUR_RANGES: { label: string; start: number; end: number; count?: number }[] = [
  { label: 'Matin (6-12h)', start: 6, end: 12 },
  { label: 'Après-midi (12-18h)', start: 12, end: 18 },
  { label: 'Soir (18-23h)', start: 18, end: 23 },
  { label: 'Nuit (23-6h)', start: 23, end: 6 },
];

export function ThreshAdvancedPatterns({ entries }: ThreshAdvancedPatternsProps) {
  const patterns = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = startOfDay(subDays(now, 30));
    const recentEntries = entries.filter(e => isAfter(new Date(e.created_at), thirtyDaysAgo));

    // Intensity trend over time
    const intensityByDay: Record<string, { total: number; count: number }> = {};
    recentEntries.forEach(e => {
      if (e.intensity) {
        const day = format(new Date(e.created_at), 'yyyy-MM-dd');
        if (!intensityByDay[day]) {
          intensityByDay[day] = { total: 0, count: 0 };
        }
        intensityByDay[day].total += e.intensity;
        intensityByDay[day].count += 1;
      }
    });

    const intensityTrend = Object.entries(intensityByDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([day, { total, count }]) => ({
        day: format(new Date(day), 'dd/MM'),
        intensity: Math.round((total / count) * 10) / 10,
      }));

    // Time distribution (when do entries happen?)
    const hourDistribution: Record<number, number> = {};
    const dayDistribution: Record<number, number> = {};
    recentEntries.forEach(e => {
      const date = new Date(e.created_at);
      const hour = getHours(date);
      const day = getDay(date);
      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
      dayDistribution[day] = (dayDistribution[day] || 0) + 1;
    });

    const peakHourRange = HOUR_RANGES.reduce((peak: { label: string; start: number; end: number; count: number }, range) => {
      let count = 0;
      if (range.start < range.end) {
        for (let h = range.start; h < range.end; h++) {
          count += hourDistribution[h] || 0;
        }
      } else {
        for (let h = range.start; h < 24; h++) {
          count += hourDistribution[h] || 0;
        }
        for (let h = 0; h < range.end; h++) {
          count += hourDistribution[h] || 0;
        }
      }
      return count > peak.count ? { ...range, count } : peak;
    }, { label: '', count: 0, start: 0, end: 0 });

    const peakDay = Object.entries(dayDistribution)
      .sort((a, b) => b[1] - a[1])[0];

    const dayData = DAY_NAMES.map((name, index) => ({
      day: name,
      count: dayDistribution[index] || 0,
    }));

    // Type distribution
    const typeDistribution: Record<string, number> = {};
    recentEntries.forEach(e => {
      if (e.thresh_type) {
        typeDistribution[e.thresh_type] = (typeDistribution[e.thresh_type] || 0) + 1;
      }
    });
    const topTypes = Object.entries(typeDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Intensity evolution
    const firstHalfIntensities = recentEntries
      .filter((e, i) => i < recentEntries.length / 2 && e.intensity)
      .map(e => e.intensity);
    const secondHalfIntensities = recentEntries
      .filter((e, i) => i >= recentEntries.length / 2 && e.intensity)
      .map(e => e.intensity);

    const firstHalfAvg = firstHalfIntensities.length > 0
      ? firstHalfIntensities.reduce((a, b) => a + b, 0) / firstHalfIntensities.length
      : 0;
    const secondHalfAvg = secondHalfIntensities.length > 0
      ? secondHalfIntensities.reduce((a, b) => a + b, 0) / secondHalfIntensities.length
      : 0;
    
    const intensityChange = firstHalfAvg > 0 
      ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 
      : 0;

    // Streak detection
    let currentStreak = 0;
    let maxStreak = 0;
    const sortedDays = Object.keys(intensityByDay).sort();
    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedDays[i - 1]);
        const currDate = new Date(sortedDays[i]);
        const diff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    // High intensity alerts
    const highIntensityEntries = recentEntries.filter(e => e.intensity >= 4);
    const highIntensityRate = recentEntries.length > 0
      ? (highIntensityEntries.length / recentEntries.length) * 100
      : 0;

    return {
      intensityTrend,
      peakHourRange,
      peakDay: peakDay ? { day: DAY_NAMES[parseInt(peakDay[0])], count: peakDay[1] } : null,
      dayData,
      topTypes,
      intensityChange,
      maxStreak,
      highIntensityRate,
      totalEntries: recentEntries.length,
    };
  }, [entries]);

  const getTrendIcon = () => {
    if (patterns.intensityChange > 5) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (patterns.intensityChange < -5) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  if (patterns.totalEntries < 3) {
    return (
      <Card className="border-amber-500/20 bg-card/30">
        <CardContent className="py-8 text-center">
          <Activity className="w-8 h-8 text-amber-500/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Pas assez de données pour les patterns avancés
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Minimum 3 entrées requises
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="font-display text-xl text-foreground mb-2">Patterns avancés</h3>
        <p className="text-sm text-muted-foreground">
          Analyse approfondie de vos tendances sur 30 jours.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Intensity Trend Chart */}
        <Card className="border-amber-500/20 bg-card/30 col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Évolution de l'intensité
              <div className="ml-auto flex items-center gap-2">
                {getTrendIcon()}
                <span className={`text-sm ${
                  patterns.intensityChange > 5 ? 'text-red-500' : 
                  patterns.intensityChange < -5 ? 'text-green-500' : 
                  'text-muted-foreground'
                }`}>
                  {patterns.intensityChange > 0 ? '+' : ''}{patterns.intensityChange.toFixed(0)}%
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patterns.intensityTrend}>
                  <defs>
                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="#f59e0b" 
                    fillOpacity={1} 
                    fill="url(#colorIntensity)"
                    name="Intensité moyenne"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Day Distribution */}
        <Card className="border-amber-500/20 bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Répartition par jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patterns.dayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Entrées" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {patterns.peakDay && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Pic : <span className="text-amber-500">{patterns.peakDay.day}</span> ({patterns.peakDay.count} entrées)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Time Pattern */}
        <Card className="border-amber-500/20 bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Moment préféré
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-2xl font-display text-amber-500 mb-2">
                {patterns.peakHourRange.label || 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground">
                {patterns.peakHourRange.count} entrées à ce moment
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="border-amber-500/20 bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Meilleure série
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-4xl font-display text-amber-500 mb-2">
                {patterns.maxStreak}
              </div>
              <p className="text-sm text-muted-foreground">
                jours consécutifs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* High Intensity Alert */}
        <Card className={`border-amber-500/20 bg-card/30 ${patterns.highIntensityRate > 30 ? 'border-red-500/30' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${patterns.highIntensityRate > 30 ? 'text-red-500' : 'text-amber-500'}`} />
              Alertes haute intensité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className={`text-4xl font-display mb-2 ${
                patterns.highIntensityRate > 30 ? 'text-red-500' : 
                patterns.highIntensityRate > 15 ? 'text-amber-500' : 
                'text-green-500'
              }`}>
                {patterns.highIntensityRate.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">
                d'entrées à intensité ≥4
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        {patterns.topTypes.length > 0 && (
          <Card className="border-amber-500/20 bg-card/30 col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                Types dominants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.topTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500 min-w-24 justify-center">
                      {type}
                    </Badge>
                    <Progress 
                      value={(count / patterns.totalEntries) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {((count / patterns.totalEntries) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
