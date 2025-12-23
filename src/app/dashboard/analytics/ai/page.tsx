'use client';

import StatCard from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, CheckCircle, Smile, MessageCircle } from 'lucide-react';
import OverviewChart from '@/components/dashboard/overview-chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const topQueries = [
    { query: 'History of Golghar', count: 1200 },
    { query: 'Best litti chokha near me', count: 950 },
    { query: 'Patna Museum opening times', count: 800 },
    { query: 'How to reach Patna Sahib', count: 750 },
    { query: 'Shopping in Patna', count: 600 },
];

export default function AiAnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Analytics</h1>
        <p className="text-muted-foreground">Insights into the performance of the "Ask Batohi" AI assistant.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total AI Queries"
          value="25,480"
          change="+15% from last week"
          icon={MessageCircle}
        />
        <StatCard
          title="Accuracy Score"
          value="94.5%"
          change="+1.2% from last week"
          icon={CheckCircle}
        />
        <StatCard
          title="User Satisfaction"
          value="88%"
          change="-0.5% from last week"
          icon={Smile}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>AI Query Volume</CardTitle>
            <CardDescription>Daily query counts over the last month.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Queries</CardTitle>
            <CardDescription>The most frequently asked questions to the AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Count</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {topQueries.map((q) => (
                        <TableRow key={q.query}>
                            <TableCell className="font-medium">{q.query}</TableCell>
                            <TableCell>{q.count.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
