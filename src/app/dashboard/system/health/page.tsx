'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  AlertTriangle,
  Server,
  Database,
  Cloud,
  Cpu,
  HardDrive,
  Clock,
  Activity,
  MemoryStick
} from 'lucide-react';
import { getSystemStats } from '@/lib/server-actions';
import { Progress } from '@/components/ui/progress';

const serviceStatus = [
  { name: 'API Gateway', status: 'Operational', icon: Cloud },
  { name: 'Database', status: 'Operational', icon: Database },
  { name: 'AI Services', status: 'Degraded Performance', icon: Server },
  { name: 'Authentication', status: 'Operational', icon: Server },
];

const errorLogs = [
  { code: 500, message: "Internal Server Error at /api/places", count: 12, time: "2m ago" },
  { code: 404, message: "Not Found: /assets/logo.png", count: 5, time: "10m ago" },
  { code: 503, message: "AI Service Unavailable", count: 2, time: "1h ago" },
];

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

export default function SystemHealthPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSystemStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Poll for realtime updates
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health & Config</h1>
        <p className="text-muted-foreground">
          Real-time server metrics, configuration, and service status.
        </p>
      </div>

      {/* Realtime System Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Date & Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? new Date(stats.serverTime).toLocaleTimeString() : '--:--:--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? new Date(stats.serverTime).toLocaleDateString() : 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatUptime(stats.uptime) : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Running uninterrupted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Load</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.cpu?.loadAvg ? stats.cpu.loadAvg[0].toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? `${stats.cpus} Cores / ${stats.arch}` : 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {stats?.platform || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              OS Environment
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* RAM Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MemoryStick className="h-5 w-5" />
              RAM Usage
            </CardTitle>
            <CardDescription>Real-time memory allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Used Memory</span>
                <span className="font-bold">{stats ? formatBytes(stats.memory.used) : '0 B'}</span>
              </div>
              <Progress value={stats ? parseFloat(stats.memory.usage) : 0} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Total Memory</p>
                <p className="font-medium text-lg">{stats ? formatBytes(stats.memory.total) : '--'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Free Memory</p>
                <p className="font-medium text-lg">{stats ? formatBytes(stats.memory.free) : '--'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disk & Storage (Mocked for Demo as not available in OS module) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage (Disk & ROM)
            </CardTitle>
            <CardDescription>Primary storage utilization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>System Drive (C:)</span>
                <span className="font-bold">234 GB / 512 GB</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Read Speed</p>
                <p className="font-medium text-lg">120 MB/s</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Write Speed</p>
                <p className="font-medium text-lg">85 MB/s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services and Errors (Existing) */}
      <h2 className="text-xl font-semibold mt-4">Service Status & Logs</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>
              Real-time status of all microservices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceStatus.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <service.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{service.name}</span>
                </div>
                <Badge
                  variant={
                    service.status === 'Operational'
                      ? 'secondary'
                      : 'destructive'
                  }
                  className="flex items-center gap-1"
                >
                  {service.status === 'Operational' ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {service.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Error Logs</CardTitle>
            <CardDescription>
              Recent system failures and errors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorLogs.map(log => (
                  <TableRow key={log.message}>
                    <TableCell><Badge variant="destructive">{log.code}</Badge></TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex flex-col">
                        <span>{log.message}</span>
                        <span className="text-xs text-muted-foreground">{log.time}</span>
                      </div>
                    </TableCell>
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
