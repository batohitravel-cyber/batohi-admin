import {
  Activity,
  AlertTriangle,
  HeartHandshake,
  Users,
  PlusCircle,
  Eye,
  MapPin,
  Headphones,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/dashboard/stat-card';
import OverviewChart from '@/components/dashboard/overview-chart';
import RecentReviews from '@/components/dashboard/recent-reviews';
import BarChartComponent from '@/components/dashboard/bar-chart';
import Link from 'next/link';

const quickActions = [
  {
    label: 'Add Place',
    href: '/dashboard/places/add',
    icon: MapPin,
    color: 'text-blue-500',
  },
  {
    label: 'Upload Story',
    href: '/dashboard/audio/upload',
    icon: Headphones,
    color: 'text-purple-500',
  },
  {
    label: 'Add Festival',
    href: '/dashboard/festivals/add',
    icon: Calendar,
    color: 'text-orange-500',
  },
  {
    label: 'Review Queue',
    href: '/dashboard/reviews',
    icon: MessageSquare,
    color: 'text-green-500',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">A high-level overview of your platform's activity.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="15,300"
          change="+12.1% from last month"
          icon={Users}
        />
        <StatCard
          title="Total Admins"
          value="5"
          change="3 Active, 2 Disabled"
          icon={HeartHandshake}
        />
        <StatCard
          title="Content Engagement"
          value="78%"
          change="-0.5% from last week"
          icon={Activity}
        />
        <StatCard
          title="New Alerts"
          value="4"
          change="Last 24 hours"
          icon={AlertTriangle}
        />
      </div>
      <Tabs defaultValue="overview">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
          <Card className="col-span-1 lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Visualize key metrics for your platform.
                </CardDescription>
              </div>
              <TabsList>
                <TabsTrigger value="overview">User Activity</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pl-2">
              <TabsContent value="overview">
                <OverviewChart />
              </TabsContent>
              <TabsContent value="engagement">
                <BarChartComponent />
              </TabsContent>
            </CardContent>
          </Card>
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                A feed of recent user reviews and feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentReviews />
            </CardContent>
          </Card>
        </div>
      </Tabs>
       <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border p-6 transition-all hover:bg-accent hover:shadow-md">
                  <action.icon className={`h-8 w-8 ${action.color}`} />
                  <p className="text-sm font-medium">{action.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
