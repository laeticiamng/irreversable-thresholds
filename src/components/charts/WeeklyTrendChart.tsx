import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { subDays, format, startOfDay, isWithinInterval, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DataPoint {
  created_at: string;
}

interface WeeklyTrendChartProps {
  data: DataPoint[];
  color?: string;
  days?: number;
  height?: number;
}

export function WeeklyTrendChart({ 
  data, 
  color = 'hsl(var(--primary))',
  days = 7,
  height = 200
}: WeeklyTrendChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const daysArray = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const count = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return isWithinInterval(itemDate, { start: dayStart, end: dayEnd });
      }).length;

      daysArray.push({
        date: format(date, 'EEE', { locale: fr }),
        fullDate: format(date, 'd MMM', { locale: fr }),
        count,
      });
    }

    return daysArray;
  }, [data, days]);

  const maxValue = Math.max(...chartData.map(d => d.count), 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          opacity={0.3}
          vertical={false}
        />
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ 
            fill: 'hsl(var(--muted-foreground))', 
            fontSize: 11,
            fontFamily: 'var(--font-display)'
          }}
        />
        <YAxis 
          domain={[0, maxValue + 1]}
          axisLine={false}
          tickLine={false}
          tick={{ 
            fill: 'hsl(var(--muted-foreground))', 
            fontSize: 11 
          }}
          width={30}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-card border border-border/50 rounded px-3 py-2 shadow-lg">
                  <p className="font-display text-sm text-foreground">{data.fullDate}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.count} entrée{data.count > 1 ? 's' : ''}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2}
          fill="url(#colorGradient)"
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
