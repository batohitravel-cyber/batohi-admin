'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Users,
    ShieldCheck,
    Bell,
    AlertTriangle,
    MapPin,
    Headphones,
    Calendar,
    MessageSquare,
    LogOut,
    Settings,
    Activity,
    ChevronRight,
    PieChart as PieChartIcon
} from 'lucide-react';
import StatCard from './stat-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import OverviewChart from './overview-chart';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const quickActions = [
    { label: 'Manage Users', href: '/dashboard/users', icon: Users, color: 'text-blue-500' },
    { label: 'Manage Admins', href: '/dashboard/admins', icon: ShieldCheck, color: 'text-purple-500' },
    { label: 'Notifications', href: '/dashboard/notifications', icon: Bell, color: 'text-yellow-500' },
    { label: 'Safety Alerts', href: '/dashboard/safety', icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Add Place', href: '/dashboard/places/add', icon: MapPin, color: 'text-green-500' },
    { label: 'Upload Story', href: '/dashboard/audio/upload', icon: Headphones, color: 'text-indigo-500' },
    { label: 'Add Festival', href: '/dashboard/festivals/add', icon: Calendar, color: 'text-orange-500' },
    { label: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare, color: 'text-teal-500' },
];

export default function RealtimeDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        admins: 0,
        notifications: 0,
        safetyAlerts: 0,
        audioStories: 0,
    });

    const [loading, setLoading] = useState(true);

    // Function to fetch initial counts
    const fetchCounts = async () => {
        try {
            // These tables might strictly exist or we fall back. 
            // Using 'count' exact head request if possible.

            const { count: userCount } = await supabase.from('mobile_app_users').select('*', { count: 'exact', head: true });
            const { count: adminCount } = await supabase.from('admins').select('*', { count: 'exact', head: true });
            const { count: notifCount } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
            const { count: safetyCount } = await supabase.from('safety_alerts').select('*', { count: 'exact', head: true });
            const { count: audioCount } = await supabase.from('audio_stories').select('*', { count: 'exact', head: true });

            setStats({
                users: userCount || 0,
                admins: adminCount || 0,
                notifications: notifCount || 0,
                safetyAlerts: safetyCount || 0,
                audioStories: audioCount || 0,
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCounts();

        // Set up realtime subscription
        const channel = supabase
            .channel('dashboard_changes')
            .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
                console.log('Change received!', payload);
                fetchCounts(); // Refetch all on any change for simplicity, or optimize per table
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const pieData = [
        { name: 'Users', value: stats.users },
        { name: 'Admins', value: stats.admins },
        { name: 'Stories', value: stats.audioStories },
        { name: 'Alerts', value: stats.safetyAlerts },
        { name: 'Notifications', value: stats.notifications },
    ].filter(d => d.value > 0); // Only show segments with data

    if (pieData.length === 0 && !loading) {
        // Fallback data if everything is 0 to show chart
        pieData.push({ name: 'System Ready', value: 1 });
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Realtime Dashboard</h1>
                    <p className="text-muted-foreground">Live overview of your platform data.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={loading ? '...' : stats.users.toString()}
                    change="Realtime"
                    icon={Users}
                />
                <StatCard
                    title="Admins"
                    value={loading ? '...' : stats.admins.toString()}
                    change="active"
                    icon={ShieldCheck}
                />
                <StatCard
                    title="Notifications"
                    value={loading ? '...' : stats.notifications.toString()}
                    change="Unread"
                    icon={Bell}
                />
                <StatCard
                    title="Active Alerts"
                    value={loading ? '...' : stats.safetyAlerts.toString()}
                    change="Safety Issues"
                    icon={AlertTriangle}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Activity Overview</CardTitle>
                        <CardDescription>User registration and activity trends</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart />
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Data Distribution</CardTitle>
                        <CardDescription>Current volume by category</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Navigation</CardTitle>
                    <CardDescription>One-click access to all sections</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <Link key={action.href} href={action.href}>
                                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border p-6 transition-all hover:bg-accent hover:shadow-md cursor-pointer group">
                                    <action.icon className={`h-8 w-8 ${action.color} group-hover:scale-110 transition-transform`} />
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
