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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

const activeSessions = [
  {
    id: 'sess_1',
    adminName: 'Admin User',
    role: 'Super Admin',
    device: 'Chrome on macOS',
    location: 'Patna, India',
    lastActive: '2 minutes ago',
  },
  {
    id: 'sess_2',
    adminName: 'Content Manager',
    role: 'Content Admin',
    device: 'Safari on iPhone',
    location: 'Delhi, India',
    lastActive: '15 minutes ago',
  },
  {
    id: 'sess_3',
    adminName: 'Support Specialist',
    role: 'Support Admin',
    device: 'Firefox on Windows',
    location: 'Mumbai, India',
    lastActive: '1 hour ago',
  },
];

export default function AdminSessionsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Login Sessions
        </h1>
        <p className="text-muted-foreground">
          View all currently active administrator sessions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            A list of all admins currently logged into the portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Location (Approx.)</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="font-medium">{session.adminName}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.role}
                    </div>
                  </TableCell>
                  <TableCell>{session.device}</TableCell>
                  <TableCell>{session.location}</TableCell>
                  <TableCell>{session.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm">
                      <LogOut className="mr-2 h-4 w-4" />
                      Force Logout
                    </Button>
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
