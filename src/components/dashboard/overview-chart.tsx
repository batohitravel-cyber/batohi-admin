'use client';

import {
  Area,
  AreaChart,
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
  { month: 'January', users: 186 },
  { month: 'February', users: 305 },
  { month: 'March', users: 237 },
  { month: 'April', users: 273 },
  { month: 'May', users: 209 },
  { month: 'June', users: 214 },
];

const chartConfig = {
  users: {
    label: 'Users',
    color: 'hsl(var(--primary))',
  },
};

export default function OverviewChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer>
        <AreaChart 
          data={chartData}
          margin={{
            left: -20,
            right: 20,
            top: 20,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
          <XAxis
            dataKey="month"
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
          <Area
            dataKey="users"
            type="monotone"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#colorUsers)"
            dot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
