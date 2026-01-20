import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ModuleDistributionChartProps {
  data: {
    irreversa: number;
    nulla: number;
    thresh: number;
    silva: number;
  };
  size?: 'sm' | 'md' | 'lg';
}

const COLORS = {
  irreversa: 'hsl(35, 65%, 40%)',
  nulla: 'hsl(220, 25%, 45%)',
  thresh: 'hsl(38, 80%, 50%)',
  silva: 'hsl(150, 35%, 30%)',
};

const LABELS = {
  irreversa: 'IRREVERSA',
  nulla: 'NULLA',
  thresh: 'THRESH',
  silva: 'SILVA',
};

export function ModuleDistributionChart({ data, size = 'md' }: ModuleDistributionChartProps) {
  const chartData = useMemo(() => {
    return [
      { name: 'IRREVERSA', value: data.irreversa, color: COLORS.irreversa },
      { name: 'NULLA', value: data.nulla, color: COLORS.nulla },
      { name: 'THRESH', value: data.thresh, color: COLORS.thresh },
      { name: 'SILVA', value: data.silva, color: COLORS.silva },
    ].filter(item => item.value > 0);
  }, [data]);

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  const sizeConfig = {
    sm: { height: 150, innerRadius: 30, outerRadius: 50 },
    md: { height: 200, innerRadius: 40, outerRadius: 70 },
    lg: { height: 280, innerRadius: 60, outerRadius: 100 },
  };

  const config = sizeConfig[size];

  if (total === 0) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground/60"
        style={{ height: config.height }}
      >
        <p className="text-sm font-display">Aucune donnée</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={config.height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={config.innerRadius}
          outerRadius={config.outerRadius}
          paddingAngle={2}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              const percentage = ((data.value / total) * 100).toFixed(0);
              return (
                <div className="bg-card border border-border/50 rounded px-3 py-2 shadow-lg">
                  <p className="font-display text-sm text-foreground">{data.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.value} ({percentage}%)
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs font-display text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
