'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ChartTooltipContent,
  ChartTooltip,
  ChartContainer,
} from '@/components/ui/chart';

const chartData = [
  { category: 'Places', engagement: 450 },
  { category: 'Audio', engagement: 580 },
  { category: 'Restaurants', engagement: 320 },
  { category: 'Festivals', engagement: 610 },
  { category: 'Itineraries', engagement: 250 },
];

const chartConfig = {
  engagement: {
    label: 'Engagement',
    color: 'hsl(var(--primary))',
  },
};

export default function BarChartComponent() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer>
        <BarChart 
            data={chartData}
            margin={{
                left: -20,
                right: 20,
                top: 20,
                bottom: 20,
            }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
          <XAxis
            dataKey="category"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
             padding={{ left: 20, right: 20 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
             padding={{ top: 20, bottom: 20 }}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))', radius: 'var(--radius)' }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar 
            dataKey="engagement" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
