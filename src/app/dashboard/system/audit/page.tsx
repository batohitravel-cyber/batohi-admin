'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

const auditLogs = [
  {
    id: 'audit_1',
    event: 'System Backup Created',
    actor: 'System',
    details: 'Full system backup completed successfully.',
    timestamp: '2024-07-29 03:00 AM',
    level: 'Info',
  },
  {
    id: 'audit_2',
    actor: 'Super Admin',
    event: 'Security Policy Change',
    details: '2FA policy changed to "Mandatory for All".',
    timestamp: '2024-07-28 05:20 PM',
    level: 'Critical',
  },
  {
    id: 'audit_3',
    actor: 'Super Admin',
    event: 'Admin Promoted',
    details: 'User "content.manager@batohi.com" promoted to Super Admin.',
    timestamp: '2024-07-28 05:18 PM',
    level: 'High',
  },
];

const getLevelBadge = (level: string) => {
  switch (level) {
    case 'Critical':
      return 'destructive';
    case 'High':
      return 'default';
    case 'Info':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function GlobalAuditTrailPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Audit Trail</h1>
        <p className="text-muted-foreground">
          Critical system-wide logs and high-level security events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            A record of all major system events.
          </CardDescription>
           <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <DatePickerWithRange />
            <Button variant="outline" className="w-full md:w-auto">
              <Download className="mr-2" />
              Export Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.event}</TableCell>
                  <TableCell>{log.actor}</TableCell>
                  <TableCell className="text-muted-foreground">{log.details}</TableCell>
                  <TableCell>
                    <Badge variant={getLevelBadge(log.level)}>
                      {log.level}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
