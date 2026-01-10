import { useMemo } from 'react';
import { subDays, isAfter, startOfDay, format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Target, Eye, XCircle, Leaf,
  Calendar, Clock, Award, AlertCircle, CheckCircle, Activity
} from 'lucide-react';
import { Case, Threshold, InvisibleThreshold, Absence } from '@/types/database';

interface EnhancedStatsProps {
  cases: Case[];
  thresholds: Threshold[];
  invisibleThresholds: InvisibleThreshold[];
  absences: Absence[];
}

export function EnhancedStats({ cases, thresholds, invisibleThresholds, absences }: EnhancedStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = startOfDay(subDays(now, 7));
    const thirtyDaysAgo = startOfDay(subDays(now, 30));

    // Weekly activity
    const weeklyThresholds = thresholds.filter(t => isAfter(new Date(t.created_at), sevenDaysAgo)).length;
    const weeklyInvisible = invisibleThresholds.filter(t => isAfter(new Date(t.created_at), sevenDaysAgo)).length;
    const weeklyAbsences = absences.filter(a => isAfter(new Date(a.created_at), sevenDaysAgo)).length;
    const weeklyTotal = weeklyThresholds + weeklyInvisible + weeklyAbsences;

    // Previous week for comparison
    const fourteenDaysAgo = startOfDay(subDays(now, 14));
    const prevWeekThresholds = thresholds.filter(t => {
      const date = new Date(t.created_at);
      return isAfter(date, fourteenDaysAgo) && !isAfter(date, sevenDaysAgo);
    }).length;
    const prevWeekInvisible = invisibleThresholds.filter(t => {
      const date = new Date(t.created_at);
      return isAfter(date, fourteenDaysAgo) && !isAfter(date, sevenDaysAgo);
    }).length;
    const prevWeekAbsences = absences.filter(a => {
      const date = new Date(a.created_at);
      return isAfter(date, fourteenDaysAgo) && !isAfter(date, sevenDaysAgo);
    }).length;
    const prevWeekTotal = prevWeekThresholds + prevWeekInvisible + prevWeekAbsences;

    const weeklyChange = prevWeekTotal > 0 
      ? ((weeklyTotal - prevWeekTotal) / prevWeekTotal) * 100 
      : weeklyTotal > 0 ? 100 : 0;

    // Completion rates
    const crossedRate = thresholds.length > 0 
      ? (thresholds.filter(t => t.is_crossed).length / thresholds.length) * 100 
      : 0;
    const sensedRate = invisibleThresholds.length > 0 
      ? (invisibleThresholds.filter(t => t.sensed_at).length / invisibleThresholds.length) * 100 
      : 0;

    // Active cases
    const activeCases = cases.filter(c => c.status === 'active').length;
    const completedCases = cases.filter(c => c.status === 'closed' || c.status === 'archived').length;

    // Days since last entry
    const allDates = [
      ...thresholds.map(t => new Date(t.created_at)),
      ...invisibleThresholds.map(t => new Date(t.created_at)),
      ...absences.map(a => new Date(a.created_at)),
    ];
    const lastEntry = allDates.length > 0 
      ? Math.max(...allDates.map(d => d.getTime()))
      : null;
    const daysSinceLastEntry = lastEntry 
      ? differenceInDays(now, new Date(lastEntry))
      : null;

    // Monthly milestones
    const monthlyThresholdsCrossed = thresholds.filter(t => 
      t.is_crossed && t.crossed_at && isAfter(new Date(t.crossed_at), thirtyDaysAgo)
    ).length;
    const monthlySensed = invisibleThresholds.filter(t => 
      t.sensed_at && isAfter(new Date(t.sensed_at), thirtyDaysAgo)
    ).length;

    // Module balance
    const totalItems = thresholds.length + invisibleThresholds.length + absences.length;
    const irreversaShare = totalItems > 0 ? (thresholds.length / totalItems) * 100 : 0;
    const threshShare = totalItems > 0 ? (invisibleThresholds.length / totalItems) * 100 : 0;
    const nullaShare = totalItems > 0 ? (absences.length / totalItems) * 100 : 0;

    // Severity distribution
    const severityCounts = thresholds.reduce((acc, t) => {
      if (t.severity) {
        acc[t.severity] = (acc[t.severity] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      weeklyTotal,
      weeklyChange,
      crossedRate,
      sensedRate,
      activeCases,
      completedCases,
      daysSinceLastEntry,
      monthlyThresholdsCrossed,
      monthlySensed,
      irreversaShare,
      threshShare,
      nullaShare,
      severityCounts,
      totals: {
        thresholds: thresholds.length,
        invisibleThresholds: invisibleThresholds.length,
        absences: absences.length,
        cases: cases.length,
      },
    };
  }, [cases, thresholds, invisibleThresholds, absences]);

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Cette semaine</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-display">{stats.weeklyTotal}</span>
                  <span className={`text-xs flex items-center gap-1 ${
                    stats.weeklyChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stats.weeklyChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stats.weeklyChange >= 0 ? '+' : ''}{stats.weeklyChange.toFixed(0)}%
                  </span>
                </div>
              </div>
              <Activity className="w-5 h-5 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Dossiers actifs</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-display">{stats.activeCases}</span>
                  <span className="text-xs text-muted-foreground">/ {stats.totals.cases}</span>
                </div>
              </div>
              <Target className="w-5 h-5 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Taux franchissement</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-display">{stats.crossedRate.toFixed(0)}%</span>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Dernière activité</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-display">
                    {stats.daysSinceLastEntry !== null ? `${stats.daysSinceLastEntry}j` : '-'}
                  </span>
                </div>
              </div>
              <Clock className="w-5 h-5 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Distribution */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display">Équilibre des modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">IRREVERSA</span>
                  <span className="text-xs text-muted-foreground">{stats.totals.thresholds}</span>
                </div>
                <Progress value={stats.irreversaShare} className="h-2" />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">
                {stats.irreversaShare.toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">THRESH</span>
                  <span className="text-xs text-muted-foreground">{stats.totals.invisibleThresholds}</span>
                </div>
                <Progress value={stats.threshShare} className="h-2" />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">
                {stats.threshShare.toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-violet-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">NULLA</span>
                  <span className="text-xs text-muted-foreground">{stats.totals.absences}</span>
                </div>
                <Progress value={stats.nullaShare} className="h-2" />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">
                {stats.nullaShare.toFixed(0)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Achievements */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display">{stats.monthlyThresholdsCrossed}</p>
                <p className="text-xs text-muted-foreground">Seuils franchis ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-display">{stats.monthlySensed}</p>
                <p className="text-xs text-muted-foreground">Seuils ressentis ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-display">{stats.completedCases}</p>
                <p className="text-xs text-muted-foreground">Dossiers complétés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Severity Distribution */}
      {Object.keys(stats.severityCounts).length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Répartition par sévérité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(stats.severityCounts).map(([severity, count]) => (
                <Badge
                  key={severity}
                  variant="outline"
                  className={`px-3 py-1 ${
                    severity === 'high' ? 'border-red-500/50 text-red-500' :
                    severity === 'medium' ? 'border-amber-500/50 text-amber-500' :
                    'border-green-500/50 text-green-500'
                  }`}
                >
                  {severity === 'high' ? 'Élevée' : severity === 'medium' ? 'Moyenne' : 'Faible'}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
