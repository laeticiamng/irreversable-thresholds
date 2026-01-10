import { useMemo } from 'react';
import { Case, Threshold, InvisibleThreshold, Absence } from '@/types/database';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, format, differenceInDays, eachDayOfInterval, eachWeekOfInterval, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnalyticsData {
  // Totals
  totalCases: number;
  activeCases: number;
  archivedCases: number;
  totalThresholds: number;
  crossedThresholds: number;
  totalInvisibleThresholds: number;
  sensedThresholds: number;
  totalAbsences: number;
  
  // Trends
  casesThisWeek: number;
  casesLastWeek: number;
  casesTrend: number;
  thresholdsThisMonth: number;
  thresholdsLastMonth: number;
  thresholdsTrend: number;
  
  // Time series
  dailyActivity: { date: string; count: number; type: string }[];
  weeklyTrends: { week: string; thresholds: number; absences: number; cases: number }[];
  
  // Predictions
  predictedCrossings: number;
  riskLevel: 'low' | 'medium' | 'high';
  
  // Insights
  insights: Insight[];
  
  // Domain breakdown
  domainBreakdown: { domain: string; count: number }[];
  moduleActivity: { module: string; count: number }[];
}

interface Insight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
}

interface UseAnalyticsProps {
  cases: Case[];
  thresholds: Threshold[];
  invisibleThresholds: InvisibleThreshold[];
  absences: Absence[];
}

export function useAnalytics({ cases, thresholds, invisibleThresholds, absences }: UseAnalyticsProps): AnalyticsData {
  return useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { locale: fr });
    const thisWeekEnd = endOfWeek(now, { locale: fr });
    const lastWeekStart = subDays(thisWeekStart, 7);
    const lastWeekEnd = subDays(thisWeekEnd, 7);
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    
    // Basic counts
    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status === 'active').length;
    const archivedCases = cases.filter(c => c.status === 'archived').length;
    const totalThresholds = thresholds.length;
    const crossedThresholds = thresholds.filter(t => t.is_crossed).length;
    const totalInvisibleThresholds = invisibleThresholds.length;
    const sensedThresholds = invisibleThresholds.filter(t => t.sensed_at).length;
    const totalAbsences = absences.length;
    
    // Weekly trends for cases
    const casesThisWeek = cases.filter(c => {
      const date = new Date(c.created_at);
      return isWithinInterval(date, { start: thisWeekStart, end: thisWeekEnd });
    }).length;
    
    const casesLastWeek = cases.filter(c => {
      const date = new Date(c.created_at);
      return isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd });
    }).length;
    
    const casesTrend = casesLastWeek > 0 
      ? Math.round(((casesThisWeek - casesLastWeek) / casesLastWeek) * 100)
      : casesThisWeek > 0 ? 100 : 0;
    
    // Monthly trends for thresholds
    const thresholdsThisMonth = thresholds.filter(t => {
      const date = new Date(t.created_at);
      return isWithinInterval(date, { start: thisMonthStart, end: thisMonthEnd });
    }).length;
    
    const thresholdsLastMonth = thresholds.filter(t => {
      const date = new Date(t.created_at);
      return isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd });
    }).length;
    
    const thresholdsTrend = thresholdsLastMonth > 0
      ? Math.round(((thresholdsThisMonth - thresholdsLastMonth) / thresholdsLastMonth) * 100)
      : thresholdsThisMonth > 0 ? 100 : 0;
    
    // Daily activity (last 14 days)
    const last14Days = eachDayOfInterval({
      start: subDays(now, 13),
      end: now,
    });
    
    const dailyActivity = last14Days.flatMap(day => {
      const dayStart = new Date(day.setHours(0, 0, 0, 0));
      const dayEnd = new Date(day.setHours(23, 59, 59, 999));
      const interval = { start: dayStart, end: dayEnd };
      
      const dayThresholds = thresholds.filter(t => 
        isWithinInterval(new Date(t.created_at), interval)
      ).length;
      
      const dayAbsences = absences.filter(a => 
        isWithinInterval(new Date(a.created_at), interval)
      ).length;
      
      return [
        { date: format(day, 'dd/MM'), count: dayThresholds, type: 'thresholds' },
        { date: format(day, 'dd/MM'), count: dayAbsences, type: 'absences' },
      ];
    });
    
    // Weekly trends (last 8 weeks)
    const last8Weeks = eachWeekOfInterval({
      start: subDays(now, 56),
      end: now,
    }, { locale: fr });
    
    const weeklyTrends = last8Weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { locale: fr });
      const interval = { start: weekStart, end: weekEnd };
      
      return {
        week: format(weekStart, 'dd/MM'),
        thresholds: thresholds.filter(t => 
          isWithinInterval(new Date(t.created_at), interval)
        ).length,
        absences: absences.filter(a => 
          isWithinInterval(new Date(a.created_at), interval)
        ).length,
        cases: cases.filter(c => 
          isWithinInterval(new Date(c.created_at), interval)
        ).length,
      };
    });
    
    // Simple prediction based on recent activity
    const recentCrossings = thresholds.filter(t => {
      if (!t.crossed_at) return false;
      const crossedDate = new Date(t.crossed_at);
      return differenceInDays(now, crossedDate) <= 30;
    }).length;
    
    const uncrossedThresholds = thresholds.filter(t => !t.is_crossed);
    const avgDaysToClose = thresholds
      .filter(t => t.is_crossed && t.crossed_at)
      .map(t => differenceInDays(new Date(t.crossed_at!), new Date(t.created_at)))
      .reduce((a, b) => a + b, 0) / Math.max(crossedThresholds, 1);
    
    const predictedCrossings = Math.round(
      uncrossedThresholds.filter(t => {
        const age = differenceInDays(now, new Date(t.created_at));
        return age >= avgDaysToClose * 0.8;
      }).length
    );
    
    // Risk assessment
    const crossingRate = totalThresholds > 0 ? crossedThresholds / totalThresholds : 0;
    const recentActivityRate = thresholdsThisMonth / Math.max(thresholdsLastMonth, 1);
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (crossingRate > 0.7 || recentActivityRate > 2) {
      riskLevel = 'high';
    } else if (crossingRate > 0.4 || recentActivityRate > 1.5) {
      riskLevel = 'medium';
    }
    
    // Generate insights
    const insights: Insight[] = [];
    
    if (uncrossedThresholds.length > 5) {
      insights.push({
        id: 'many-pending',
        type: 'warning',
        title: `${uncrossedThresholds.length} seuils en attente`,
        description: 'Vous avez plusieurs seuils non franchis. Considérez une révision.',
        actionLabel: 'Voir les seuils',
        actionUrl: '/irreversa/cases',
      });
    }
    
    if (casesTrend > 50) {
      insights.push({
        id: 'high-activity',
        type: 'info',
        title: 'Activité en hausse',
        description: `${casesTrend}% de dossiers en plus cette semaine.`,
      });
    }
    
    if (sensedThresholds > 0 && sensedThresholds < totalInvisibleThresholds * 0.3) {
      insights.push({
        id: 'low-sensing',
        type: 'tip',
        title: 'Seuils invisibles à explorer',
        description: 'Prenez le temps de ressentir vos seuils THRESH.',
        actionLabel: 'Explorer THRESH',
        actionUrl: '/thresh/home',
      });
    }
    
    if (activeCases > 0 && archivedCases === 0) {
      insights.push({
        id: 'no-archives',
        type: 'success',
        title: 'Tous vos dossiers sont actifs',
        description: 'Pensez à archiver les dossiers terminés pour garder une vue claire.',
      });
    }
    
    // Domain breakdown
    const domainCounts: Record<string, number> = {};
    cases.forEach(c => {
      const domain = (c.metadata as { domain?: string })?.domain || c.domain || 'autre';
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });
    
    const domainBreakdown = Object.entries(domainCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);
    
    // Module activity
    const moduleActivity = [
      { module: 'IRREVERSA', count: thresholds.length },
      { module: 'THRESH', count: invisibleThresholds.length },
      { module: 'NULLA', count: absences.length },
    ].sort((a, b) => b.count - a.count);
    
    return {
      totalCases,
      activeCases,
      archivedCases,
      totalThresholds,
      crossedThresholds,
      totalInvisibleThresholds,
      sensedThresholds,
      totalAbsences,
      casesThisWeek,
      casesLastWeek,
      casesTrend,
      thresholdsThisMonth,
      thresholdsLastMonth,
      thresholdsTrend,
      dailyActivity,
      weeklyTrends,
      predictedCrossings,
      riskLevel,
      insights,
      domainBreakdown,
      moduleActivity,
    };
  }, [cases, thresholds, invisibleThresholds, absences]);
}
