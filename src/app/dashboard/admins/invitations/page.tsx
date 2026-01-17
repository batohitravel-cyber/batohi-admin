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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Send, XCircle } from 'lucide-react';
import Link from 'next/link';

const invitations = [
  {
    id: 'inv_1',
    email: 'new.admin@example.com',
    role: 'Support Admin',
    status: 'Sent',
    sentOn: '2024-07-28',
  },
  {
    id: 'inv_2',
    email: 'another.admin@example.com',
    role: 'Content Admin',
    status: 'Expired',
    sentOn: '2024-07-15',
  },
  {
    id: 'inv_3',
    email: 'accepted.admin@example.com',
    role: 'Content Admin',
    status: 'Accepted',
    sentOn: '2024-07-25',
  },
];

export default function AdminInvitationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Invitation Management
        </h1>
        <p className="text-muted-foreground">
          Track the status of all sent invitations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invitation Status</CardTitle>
          <CardDescription>
            A log of all invitations sent to new administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent On</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="font-medium">{invite.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{invite.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invite.status === 'Sent'
                          ? 'default'
                          : invite.status === 'Accepted'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {invite.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invite.sentOn}</TableCell>
                  <TableCell>
                    {invite.status !== 'Accepted' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {invite.status === 'Sent' && (
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Resend Invitation
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Invitation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
