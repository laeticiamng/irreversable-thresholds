import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Threshold, InvisibleThreshold, Absence } from '@/types/database';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrendingUp, PieChartIcon, Calendar } from 'lucide-react';

interface StatsChartsProps {
  irreversaThresholds: Threshold[];
  threshThresholds: (InvisibleThreshold & { tags?: string[]; intensity?: number; context?: string })[];
  absences: Absence[];
}

export function StatsCharts({ irreversaThresholds, threshThresholds, absences }: StatsChartsProps) {
  // Generate timeline data for last 30 days
  const timelineData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    });

    let irreversaCumulative = 0;
    let threshCumulative = 0;

    return days.map(day => {
      const dayStart = startOfDay(day);
      
      // Count items created/crossed on this day
      const irreversaOnDay = irreversaThresholds.filter(t => 
        t.crossed_at && startOfDay(new Date(t.crossed_at)).getTime() === dayStart.getTime()
      ).length;
      
      const threshOnDay = threshThresholds.filter(t => 
        t.sensed_at && startOfDay(new Date(t.sensed_at)).getTime() === dayStart.getTime()
      ).length;

      irreversaCumulative += irreversaOnDay;
      threshCumulative += threshOnDay;

      return {
        date: format(day, 'd MMM', { locale: fr }),
        fullDate: day,
        irreversa: irreversaCumulative,
        thresh: threshCumulative,
        irreversaNew: irreversaOnDay,
        threshNew: threshOnDay,
      };
    });
  }, [irreversaThresholds, threshThresholds]);

  // Module distribution data
  const distributionData = useMemo(() => {
    return [
      { name: 'IRREVERSA', value: irreversaThresholds.length, color: 'hsl(var(--primary))' },
      { name: 'THRESH', value: threshThresholds.length, color: '#f59e0b' },
      { name: 'NULLA', value: absences.length, color: 'hsl(var(--nulla))' },
    ].filter(d => d.value > 0);
  }, [irreversaThresholds, threshThresholds, absences]);

  // Status breakdown
  const statusData = useMemo(() => {
    const crossedIrreversa = irreversaThresholds.filter(t => t.is_crossed).length;
    const pendingIrreversa = irreversaThresholds.filter(t => !t.is_crossed).length;
    const sensedThresh = threshThresholds.filter(t => t.sensed_at).length;
    const latentThresh = threshThresholds.filter(t => !t.sensed_at).length;

    return {
      irreversa: { crossed: crossedIrreversa, pending: pendingIrreversa },
      thresh: { sensed: sensedThresh, latent: latentThresh },
    };
  }, [irreversaThresholds, threshThresholds]);

  const totalItems = irreversaThresholds.length + threshThresholds.length + absences.length;

  if (totalItems === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border/30">
        <p className="text-muted-foreground text-sm">
          Aucune donnée à afficher. Commencez par créer des entrées dans les modules.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border border-primary/20 bg-primary/5">
          <p className="text-xs text-muted-foreground mb-1">Seuils franchis</p>
          <p className="text-2xl font-display text-primary">{statusData.irreversa.crossed}</p>
          <p className="text-xs text-muted-foreground/60">sur {irreversaThresholds.length}</p>
        </div>
        <div className="p-4 border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-muted-foreground mb-1">Seuils ressentis</p>
          <p className="text-2xl font-display text-amber-500">{statusData.thresh.sensed}</p>
          <p className="text-xs text-muted-foreground/60">sur {threshThresholds.length}</p>
        </div>
        <div className="p-4 border border-nulla/20 bg-nulla/5">
          <p className="text-xs text-muted-foreground mb-1">Absences</p>
          <p className="text-2xl font-display text-nulla">{absences.length}</p>
          <p className="text-xs text-muted-foreground/60">documentées</p>
        </div>
        <div className="p-4 border border-border/30 bg-card/30">
          <p className="text-xs text-muted-foreground mb-1">Total entrées</p>
          <p className="text-2xl font-display text-foreground">{totalItems}</p>
          <p className="text-xs text-muted-foreground/60">tous modules</p>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="p-6 border border-border/30 bg-card/10">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm tracking-[0.15em] uppercase text-foreground/80">
            Évolution (30 derniers jours)
          </h3>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorIrreversa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorThresh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area 
                type="monotone" 
                dataKey="irreversa" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorIrreversa)" 
                name="IRREVERSA"
              />
              <Area 
                type="monotone" 
                dataKey="thresh" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorThresh)" 
                name="THRESH"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary" />
            <span className="text-xs text-muted-foreground">IRREVERSA franchis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500" />
            <span className="text-xs text-muted-foreground">THRESH ressentis</span>
          </div>
        </div>
      </div>

      {/* Distribution Pie */}
      {distributionData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-border/30 bg-card/10">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-display text-sm tracking-[0.15em] uppercase text-foreground/80">
                Distribution par module
              </h3>
            </div>
            <div className="h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              {distributionData.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-muted-foreground">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border border-border/30 bg-card/10">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-display text-sm tracking-[0.15em] uppercase text-foreground/80">
                Progression
              </h3>
            </div>
            <div className="space-y-4">
              {/* IRREVERSA progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">IRREVERSA</span>
                  <span className="text-primary">{Math.round((statusData.irreversa.crossed / Math.max(irreversaThresholds.length, 1)) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted/30 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(statusData.irreversa.crossed / Math.max(irreversaThresholds.length, 1)) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-primary"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {statusData.irreversa.crossed} franchis · {statusData.irreversa.pending} en attente
                </p>
              </div>

              {/* THRESH progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">THRESH</span>
                  <span className="text-amber-500">{Math.round((statusData.thresh.sensed / Math.max(threshThresholds.length, 1)) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted/30 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(statusData.thresh.sensed / Math.max(threshThresholds.length, 1)) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-amber-500"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {statusData.thresh.sensed} ressentis · {statusData.thresh.latent} latents
                </p>
              </div>

              {/* NULLA progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">NULLA</span>
                  <span className="text-nulla">100%</span>
                </div>
                <div className="h-2 bg-muted/30 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: absences.length > 0 ? '100%' : '0%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                    className="h-full bg-nulla"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {absences.length} absences documentées
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
