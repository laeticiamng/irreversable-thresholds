import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SilvaSession } from '@/hooks/useSilvaSessions';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';

interface SessionsChartProps {
  sessions: SilvaSession[];
}

export function SessionsChart({ sessions }: SessionsChartProps) {
  const chartData = useMemo(() => {
    // Get last 14 days
    const today = startOfDay(new Date());
    const twoWeeksAgo = subDays(today, 13);
    
    const days = eachDayOfInterval({ start: twoWeeksAgo, end: today });
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      // Get sessions for this day
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.started_at);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });
      
      // Total duration for the day
      const totalSeconds = daySessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
      
      return {
        date: format(day, 'dd/MM', { locale: fr }),
        fullDate: format(day, 'EEEE d MMMM', { locale: fr }),
        sessions: daySessions.length,
        minutes: Math.round(totalSeconds / 60),
      };
    });
  }, [sessions]);

  const hasData = sessions.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <Card className="border-border/30 bg-card/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-display text-foreground/70">
          <TrendingUp className="w-4 h-4 text-foreground/40" />
          Évolution des sessions (14 jours)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="silvaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
                labelFormatter={(_, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullDate;
                  }
                  return '';
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'minutes') return [`${value} min`, 'Durée'];
                  if (name === 'sessions') return [value, 'Sessions'];
                  return [value, name];
                }}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="hsl(var(--foreground))"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#silvaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-foreground/25 text-center mt-2">
          Temps passé dans SILVA par jour
        </p>
      </CardContent>
    </Card>
  );
}
