'use client';

import StatCard from '@/components/dashboard/stat-card';
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
} from 'lucide-react';
import OverviewChart from '@/components/dashboard/overview-chart';

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
]

export default function SystemHealthPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health Monitor</h1>
        <p className="text-muted-foreground">
          An overview of API uptime, error logs, and database status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-2xl font-bold text-yellow-600">
            <AlertTriangle />
            <span>Degraded Performance</span>
          </div>
          <p className="text-muted-foreground mt-1">
            One or more services are experiencing issues.
          </p>
        </CardContent>
      </Card>

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
            <CardTitle>API Uptime (Last 24h)</CardTitle>
             <CardDescription>
              The percentage of time the API was available.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-green-600">99.95%</div>
            <p className="text-sm text-muted-foreground mt-2">2 minor incidents reported</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Error Logs</CardTitle>
           <CardDescription>
              A stream of the most recent system failures and errors.
            </CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Last Seen</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {errorLogs.map(log => (
                    <TableRow key={log.message}>
                        <TableCell><Badge variant="destructive">{log.code}</Badge></TableCell>
                        <TableCell className="font-mono text-sm">{log.message}</TableCell>
                        <TableCell>{log.count}</TableCell>
                        <TableCell>{log.time}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}
