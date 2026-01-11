import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useThresholdsDB } from '@/hooks/useThresholdsDB';
import { useAbsencesDB } from '@/hooks/useAbsencesDB';
import { useInvisibleThresholds } from '@/hooks/useInvisibleThresholds';
import { useUserCases } from '@/hooks/useUserCases';
import { GlobalNav } from '@/components/GlobalNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Eye,
  XCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subWeeks, 
  subMonths, 
  isWithinInterval, 
  format, 
  eachDayOfInterval,
  differenceInDays,
} from 'date-fns';
import { fr } from 'date-fns/locale';

type ComparisonPeriod = 'week' | 'month' | 'quarter';

interface PeriodStats {
  casesCreated: number;
  thresholdsCrossed: number;
  thresholdsCreated: number;
  absencesDocumented: number;
  invisibleSensed: number;
  invisibleCreated: number;
  dailyData: { date: string; thresholds: number; absences: number; invisible: number }[];
}

export default function StatsComparison() {
  const { user } = useAuth();
  const { thresholds } = useThresholdsDB(user?.id);
  const { absences } = useAbsencesDB(user?.id);
  const { thresholds: invisibleThresholds } = useInvisibleThresholds(user?.id);
  const { cases } = useUserCases(user?.id);
  
  const [period, setPeriod] = useState<ComparisonPeriod>('week');

  const { current, previous, comparison, chartData } = useMemo(() => {
    const now = new Date();
    
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;
    
    switch (period) {
      case 'week':
        currentStart = startOfWeek(now, { locale: fr });
        currentEnd = endOfWeek(now, { locale: fr });
        previousStart = startOfWeek(subWeeks(now, 1), { locale: fr });
        previousEnd = endOfWeek(subWeeks(now, 1), { locale: fr });
        break;
      case 'month':
        currentStart = startOfMonth(now);
        currentEnd = endOfMonth(now);
        previousStart = startOfMonth(subMonths(now, 1));
        previousEnd = endOfMonth(subMonths(now, 1));
        break;
      case 'quarter':
        currentStart = startOfMonth(subMonths(now, 2));
        currentEnd = endOfMonth(now);
        previousStart = startOfMonth(subMonths(now, 5));
        previousEnd = endOfMonth(subMonths(now, 3));
        break;
    }

    const getStats = (start: Date, end: Date): PeriodStats => {
      const interval = { start, end };
      
      const casesInPeriod = cases.filter(c => 
        isWithinInterval(new Date(c.created_at), interval)
      );
      
      const thresholdsInPeriod = thresholds.filter(t => 
        isWithinInterval(new Date(t.created_at), interval)
      );
      
      const crossedInPeriod = thresholds.filter(t => 
        t.crossed_at && isWithinInterval(new Date(t.crossed_at), interval)
      );
      
      const absencesInPeriod = absences.filter(a => 
        isWithinInterval(new Date(a.created_at), interval)
      );
      
      const invisibleInPeriod = invisibleThresholds.filter(t => 
        isWithinInterval(new Date(t.created_at), interval)
      );
      
      const sensedInPeriod = invisibleThresholds.filter(t => 
        t.sensed_at && isWithinInterval(new Date(t.sensed_at), interval)
      );

      // Daily breakdown
      const days = eachDayOfInterval({ start, end });
      const dailyData = days.map(day => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        const dayInterval = { start: dayStart, end: dayEnd };

        return {
          date: format(day, 'dd/MM', { locale: fr }),
          thresholds: thresholds.filter(t => isWithinInterval(new Date(t.created_at), dayInterval)).length,
          absences: absences.filter(a => isWithinInterval(new Date(a.created_at), dayInterval)).length,
          invisible: invisibleThresholds.filter(t => isWithinInterval(new Date(t.created_at), dayInterval)).length,
        };
      });
      
      return {
        casesCreated: casesInPeriod.length,
        thresholdsCrossed: crossedInPeriod.length,
        thresholdsCreated: thresholdsInPeriod.length,
        absencesDocumented: absencesInPeriod.length,
        invisibleSensed: sensedInPeriod.length,
        invisibleCreated: invisibleInPeriod.length,
        dailyData,
      };
    };

    const currentStats = getStats(currentStart, currentEnd);
    const previousStats = getStats(previousStart, previousEnd);

    // Calculate comparisons
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const comp = {
      cases: calcChange(currentStats.casesCreated, previousStats.casesCreated),
      thresholdsCrossed: calcChange(currentStats.thresholdsCrossed, previousStats.thresholdsCrossed),
      thresholdsCreated: calcChange(currentStats.thresholdsCreated, previousStats.thresholdsCreated),
      absences: calcChange(currentStats.absencesDocumented, previousStats.absencesDocumented),
      invisibleSensed: calcChange(currentStats.invisibleSensed, previousStats.invisibleSensed),
      invisibleCreated: calcChange(currentStats.invisibleCreated, previousStats.invisibleCreated),
    };

    // Merge chart data for comparison
    const maxLength = Math.max(currentStats.dailyData.length, previousStats.dailyData.length);
    const mergedChartData = Array.from({ length: maxLength }, (_, i) => ({
      index: i + 1,
      currentThresholds: currentStats.dailyData[i]?.thresholds || 0,
      previousThresholds: previousStats.dailyData[i]?.thresholds || 0,
      currentAbsences: currentStats.dailyData[i]?.absences || 0,
      previousAbsences: previousStats.dailyData[i]?.absences || 0,
    }));

    return {
      current: currentStats,
      previous: previousStats,
      comparison: comp,
      chartData: mergedChartData,
    };
  }, [cases, thresholds, absences, invisibleThresholds, period]);

  const periodLabels = {
    week: { current: 'Cette semaine', previous: 'Semaine précédente' },
    month: { current: 'Ce mois', previous: 'Mois précédent' },
    quarter: { current: 'Ce trimestre', previous: 'Trimestre précédent' },
  };

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const TrendBadge = ({ value, inverse = false }: { value: number; inverse?: boolean }) => {
    const isPositive = inverse ? value < 0 : value > 0;
    const isNegative = inverse ? value > 0 : value < 0;
    
    return (
      <Badge 
        variant="secondary"
        className={`${
          isPositive ? 'bg-green-500/10 text-green-500 border-green-500/20' :
          isNegative ? 'bg-red-500/10 text-red-500 border-red-500/20' :
          'bg-muted text-muted-foreground'
        }`}
      >
        {value > 0 ? '+' : ''}{value}%
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <p className="text-muted-foreground">Connexion requise.</p>
          <Link to="/exposition">
            <Button variant="monument">Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />

      <main className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl tracking-widest text-foreground/80">
                  COMPARAISON
                </h1>
                <p className="text-muted-foreground/60 text-sm">
                  Évolution de ton activité
                </p>
              </div>
            </div>

            <Select value={period} onValueChange={(v) => setPeriod(v as ComparisonPeriod)}>
              <SelectTrigger className="w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semaine vs Semaine</SelectItem>
                <SelectItem value="month">Mois vs Mois</SelectItem>
                <SelectItem value="quarter">Trimestre vs Trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Period Labels */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-foreground">{periodLabels[period].current}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
              <span className="text-sm text-muted-foreground">{periodLabels[period].previous}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Cases Created */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Dossiers créés
                  </CardTitle>
                  <TrendIcon value={comparison.cases} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display">{current.casesCreated}</span>
                    <span className="text-sm text-muted-foreground">
                      vs {previous.casesCreated}
                    </span>
                  </div>
                  <TrendBadge value={comparison.cases} />
                </div>
              </CardContent>
            </Card>

            {/* Thresholds Crossed (IRREVERSA) */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Seuils franchis
                    </CardTitle>
                  </div>
                  <TrendIcon value={comparison.thresholdsCrossed} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display text-primary">{current.thresholdsCrossed}</span>
                    <span className="text-sm text-muted-foreground">
                      vs {previous.thresholdsCrossed}
                    </span>
                  </div>
                  <TrendBadge value={comparison.thresholdsCrossed} />
                </div>
              </CardContent>
            </Card>

            {/* Thresholds Created */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Seuils identifiés
                  </CardTitle>
                  <TrendIcon value={comparison.thresholdsCreated} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display">{current.thresholdsCreated}</span>
                    <span className="text-sm text-muted-foreground">
                      vs {previous.thresholdsCreated}
                    </span>
                  </div>
                  <TrendBadge value={comparison.thresholdsCreated} />
                </div>
              </CardContent>
            </Card>

            {/* THRESH Sensed */}
            <Card className="border-amber-500/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Seuils ressentis
                    </CardTitle>
                  </div>
                  <TrendIcon value={comparison.invisibleSensed} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display text-amber-500">{current.invisibleSensed}</span>
                    <span className="text-sm text-muted-foreground">
                      vs {previous.invisibleSensed}
                    </span>
                  </div>
                  <TrendBadge value={comparison.invisibleSensed} />
                </div>
              </CardContent>
            </Card>

            {/* Absences Documented */}
            <Card className="border-nulla/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-nulla" />
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Absences documentées
                    </CardTitle>
                  </div>
                  <TrendIcon value={comparison.absences} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display text-nulla">{current.absencesDocumented}</span>
                    <span className="text-sm text-muted-foreground">
                      vs {previous.absencesDocumented}
                    </span>
                  </div>
                  <TrendBadge value={comparison.absences} />
                </div>
              </CardContent>
            </Card>

            {/* THRESH Created */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Seuils THRESH créés
                  </CardTitle>
                  <TrendIcon value={comparison.invisibleCreated} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display">{current.invisibleCreated}</span>
                    <span className="text-sm text-muted-foreground">
                      vs {previous.invisibleCreated}
                    </span>
                  </div>
                  <TrendBadge value={comparison.invisibleCreated} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thresholds Comparison Chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Évolution des seuils IRREVERSA
                </CardTitle>
                <CardDescription>
                  Comparaison jour par jour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="index" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="currentThresholds"
                        name={periodLabels[period].current}
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="previousThresholds"
                        name={periodLabels[period].previous}
                        stroke="hsl(var(--muted-foreground))"
                        fill="hsl(var(--muted-foreground))"
                        fillOpacity={0.1}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Absences Comparison Chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <XCircle className="w-4 h-4 text-nulla" />
                  Évolution des absences NULLA
                </CardTitle>
                <CardDescription>
                  Comparaison jour par jour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="index" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="currentAbsences"
                        name={periodLabels[period].current}
                        fill="hsl(var(--nulla))"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="previousAbsences"
                        name={periodLabels[period].previous}
                        fill="hsl(var(--muted-foreground))"
                        opacity={0.3}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <Card className="mt-8 border-border/50">
            <CardHeader>
              <CardTitle>Résumé de la période</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Activité globale</p>
                  <p className="text-2xl font-display">
                    {current.thresholdsCreated + current.absencesDocumented + current.invisibleCreated}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    entrées créées
                  </p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Taux de franchissement</p>
                  <p className="text-2xl font-display text-primary">
                    {current.thresholdsCreated > 0 
                      ? Math.round((current.thresholdsCrossed / current.thresholdsCreated) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    seuils franchis
                  </p>
                </div>
                <div className="text-center p-4 bg-amber-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Taux de perception</p>
                  <p className="text-2xl font-display text-amber-500">
                    {current.invisibleCreated > 0 
                      ? Math.round((current.invisibleSensed / current.invisibleCreated) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    seuils ressentis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
