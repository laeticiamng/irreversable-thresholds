import { useAnalytics } from '@/hooks/useAnalytics';
import { Case, Threshold, InvisibleThreshold, Absence } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb, 
  Target, BarChart3, PieChart, Activity, ArrowRight,
  CheckCircle, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';

interface AdvancedAnalyticsProps {
  cases: Case[];
  thresholds: Threshold[];
  invisibleThresholds: InvisibleThreshold[];
  absences: Absence[];
}

const COLORS = ['#6366f1', '#f59e0b', '#8b5cf6', '#22c55e', '#ef4444'];

export function AdvancedAnalytics({ cases, thresholds, invisibleThresholds, absences }: AdvancedAnalyticsProps) {
  const analytics = useAnalytics({ cases, thresholds, invisibleThresholds, absences });

  const insightIcons = {
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
    tip: Lightbulb,
  };

  const insightColors = {
    warning: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    info: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    success: 'text-green-500 bg-green-500/10 border-green-500/30',
    tip: 'text-violet-500 bg-violet-500/10 border-violet-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Dossiers actifs"
          value={analytics.activeCases}
          trend={analytics.casesTrend}
          icon={Target}
        />
        <MetricCard
          title="Seuils franchis"
          value={analytics.crossedThresholds}
          total={analytics.totalThresholds}
          icon={CheckCircle}
          color="text-primary"
        />
        <MetricCard
          title="Seuils ressentis"
          value={analytics.sensedThresholds}
          total={analytics.totalInvisibleThresholds}
          icon={Activity}
          color="text-amber-500"
        />
        <MetricCard
          title="Absences explorées"
          value={analytics.totalAbsences}
          icon={PieChart}
          color="text-violet-500"
        />
      </div>

      {/* Predictions & Risk */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Prédictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display text-primary mb-1">
              {analytics.predictedCrossings}
            </div>
            <p className="text-xs text-muted-foreground">
              seuils susceptibles d'être franchis prochainement
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Niveau de risque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={`text-lg px-3 py-1 ${
                analytics.riskLevel === 'high' 
                  ? 'border-destructive text-destructive' 
                  : analytics.riskLevel === 'medium'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-green-500 text-green-500'
              }`}
            >
              {analytics.riskLevel === 'high' ? 'Élevé' : analytics.riskLevel === 'medium' ? 'Moyen' : 'Faible'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Basé sur l'activité récente
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Tendance mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {analytics.thresholdsTrend >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-500" />
              )}
              <span className={`text-2xl font-display ${
                analytics.thresholdsTrend >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {analytics.thresholdsTrend >= 0 ? '+' : ''}{analytics.thresholdsTrend}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs mois précédent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-display">Activité hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.weeklyTrends}>
                  <defs>
                    <linearGradient id="colorThresholds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAbsences" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="thresholds" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorThresholds)"
                    name="Seuils"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="absences" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorAbsences)"
                    name="Absences"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Module Distribution */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-display">Répartition par module</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={analytics.moduleActivity}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {analytics.moduleActivity.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {analytics.moduleActivity.map((item, index) => (
                  <div key={item.module} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground">{item.module}</span>
                    <span className="text-xs font-medium ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {analytics.insights.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Insights & Recommandations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {analytics.insights.map((insight, index) => {
                const Icon = insightIcons[insight.type];
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${insightColors[insight.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-xs opacity-80 mt-1">{insight.description}</p>
                        {insight.actionUrl && (
                          <Link to={insight.actionUrl}>
                            <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs">
                              {insight.actionLabel || 'En savoir plus'}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domain Breakdown */}
      {analytics.domainBreakdown.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-display">Répartition par domaine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.domainBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="domain" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  total?: number;
  trend?: number;
  icon: React.ElementType;
  color?: string;
}

function MetricCard({ title, value, total, trend, icon: Icon, color = 'text-foreground' }: MetricCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-display ${color}`}>{value}</span>
              {total !== undefined && (
                <span className="text-sm text-muted-foreground">/ {total}</span>
              )}
            </div>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                trend >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend >= 0 ? '+' : ''}{trend}%
              </div>
            )}
          </div>
          <Icon className={`w-5 h-5 ${color} opacity-50`} />
        </div>
      </CardContent>
    </Card>
  );
}
