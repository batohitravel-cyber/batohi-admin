'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, RotateCcw } from 'lucide-react';

const backupHistory = [
  {
    id: 'backup_3',
    timestamp: '2024-07-29 03:00 AM',
    status: 'Success',
    size: '1.2 GB',
    type: 'Automatic',
  },
  {
    id: 'backup_2',
    timestamp: '2024-07-28 03:00 AM',
    status: 'Success',
    size: '1.1 GB',
    type: 'Automatic',
  },
  {
    id: 'backup_1',
    timestamp: '2024-07-27 11:30 PM',
    status: 'Failed',
    size: 'N/A',
    type: 'Manual',
  },
];

export default function BackupRestorePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
        <p className="text-muted-foreground">
          Manage system backups and restore previous versions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Backup</CardTitle>
          <CardDescription>
            Create a new backup or restore from an existing one.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Button size="lg">
            <Download className="mr-2" />
            Create System Backup
          </Button>
          <Button size="lg" variant="outline">
            <Upload className="mr-2" />
            Restore from Backup
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>A log of all recent backup attempts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupHistory.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{backup.timestamp}</TableCell>
                  <TableCell>{backup.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        backup.status === 'Success' ? 'secondary' : 'destructive'
                      }
                    >
                      {backup.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell className="text-right">
                    {backup.status === 'Success' && (
                      <Button variant="outline" size="sm">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore This Version
                      </Button>
                    )}
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
