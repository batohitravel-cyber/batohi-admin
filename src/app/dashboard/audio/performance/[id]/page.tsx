'use client';

import StatCard from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Droplets, Ear, Share2, Star } from 'lucide-react';
import OverviewChart from '@/components/dashboard/overview-chart';

export default function AudioStoryPerformancePage({ params }: { params: { id: string } }) {
  const story = {
    id: '1',
    title: 'The Legend of Golghar',
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Story Performance</h1>
        <p className="text-muted-foreground">Analytics for "{story.title}"</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Plays"
          value="1,250"
          change="+8.1% from last week"
          icon={Ear}
        />
        <StatCard
          title="Avg. Engagement Time"
          value="3m 45s"
          change="-2.2% from last week"
          icon={BarChart}
        />
        <StatCard
          title="Total Shares"
          value="480"
          change="+25 from last week"
          icon={Share2}
        />
        <StatCard
          title="Total Saves"
          value="612"
          change="+40 from last week"
          icon={Star}
        />
      </div>

      <Card>
          <CardHeader>
            <CardTitle>User Drop-off Graph</CardTitle>
            <CardDescription>
              This chart shows at what point users stopped listening to the audio story.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
    </div>
  );
}
