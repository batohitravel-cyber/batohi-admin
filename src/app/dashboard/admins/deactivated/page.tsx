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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Trash2, Undo } from 'lucide-react';
import Link from 'next/link';

const deactivatedAdmins = [
  {
    id: 'admin_3',
    name: 'Former Manager',
    email: 'former.manager@example.com',
    role: 'Content Admin',
    deactivatedOn: '2024-05-10',
    reason: 'Resigned',
  },
  {
    id: 'admin_5',
    name: 'Temp Contractor',
    email: 'temp.contractor@example.com',
    role: 'Custom Role',
    deactivatedOn: '2024-06-20',
    reason: 'Contract Ended',
  },
];

export default function DeactivatedAdminsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deactivated Admins</h1>
        <p className="text-muted-foreground">
          A list of all disabled administrator accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deactivated Accounts</CardTitle>
          <CardDescription>
            These accounts are currently disabled and cannot log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Reason for Deactivation</TableHead>
                <TableHead>Deactivated On</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deactivatedAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{admin.role}</Badge>
                  </TableCell>
                  <TableCell>{admin.reason}</TableCell>
                  <TableCell>{admin.deactivatedOn}</TableCell>
                  <TableCell>
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
                        <DropdownMenuItem>
                          <Undo className="mr-2 h-4 w-4" />
                          Restore Admin Access
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Permanently Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
