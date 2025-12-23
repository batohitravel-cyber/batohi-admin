'use client';

import StatCard from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Clock, Users } from 'lucide-react';
import OverviewChart from '@/components/dashboard/overview-chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const peakHoursData = [
    { time: '6 PM - 8 PM', activity: 'High', details: 'Peak user engagement' },
    { time: '12 PM - 2 PM', activity: 'Medium', details: 'Lunchtime browsing' },
    { time: '9 AM - 11 AM', activity: 'Medium', details: 'Morning checks' },
    { time: '10 PM - 12 AM', activity: 'Low', details: 'Late night usage' },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Main Analytics Dashboard</h1>
        <p className="text-muted-foreground">An overview of user activity on the platform.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Daily Active Users (DAU)"
          value="1,250"
          change="+5.2% from yesterday"
          icon={Users}
        />
        <StatCard
          title="Monthly Active Users (MAU)"
          value="15,300"
          change="+12.1% from last month"
          icon={Users}
        />
        <StatCard
          title="Avg. Session Duration"
          value="5m 21s"
          change="+3.4% from last week"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>A graph showing daily active users over the past month.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
                <CardDescription>The most active times for users on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time Range</TableHead>
                            <TableHead>Activity Level</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {peakHoursData.map((hour) => (
                            <TableRow key={hour.time}>
                                <TableCell className="font-medium">{hour.time}</TableCell>
                                <TableCell>{hour.activity}</TableCell>
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
