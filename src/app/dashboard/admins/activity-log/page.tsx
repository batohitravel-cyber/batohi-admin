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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

const activityLogs = [
  {
    id: 1,
    admin: 'Content Manager',
    action: 'Added new place: "Eco Park"',
    module: 'Places',
    timestamp: '2024-07-29 11:45 AM',
    severity: 'Low',
  },
  {
    id: 2,
    admin: 'Super Admin',
    action: 'Updated role "Support Admin" permissions',
    module: 'Admins',
    timestamp: '2024-07-29 10:30 AM',
    severity: 'Medium',
  },
  {
    id: 3,
    admin: 'Support Admin',
    action: 'Approved review for "The Patna Kitchen"',
    module: 'Reviews',
    timestamp: '2024-07-29 09:12 AM',
    severity: 'Low',
  },
  {
    id: 4,
    admin: 'Super Admin',
    action: 'Disabled user account: "user_123"',
    module: 'Users',
    timestamp: '2024-07-28 08:00 PM',
    severity: 'High',
  },
];

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'High':
      return 'destructive';
    case 'Medium':
      return 'default';
    case 'Low':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function ActivityLogPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Activity Log</h1>
        <p className="text-muted-foreground">
          View every action taken by administrators in the portal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>
            A detailed record of all admin activities.
          </CardDescription>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <Input placeholder="Filter by admin name..." className="flex-1" />
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="places">Places</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="admins">Admins</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange />
            <Button variant="outline">
              <Download className="mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.admin}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityBadge(log.severity)}>
                      {log.severity}
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
