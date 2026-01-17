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
import { Input } from '@/components/ui/input';
import {
  MoreHorizontal,
  Search,
  UserCog,
  Eye,
  ShieldOff,
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const admins = [
  {
    id: 'admin_1',
    name: 'Admin User',
    email: 'admin.user@batohi.com',
    role: 'Super Admin',
    status: 'Active',
    lastLogin: '2024-07-29 10:00 AM',
  },
  {
    id: 'admin_2',
    name: 'Content Manager',
    email: 'content.manager@batohi.com',
    role: 'Content Admin',
    status: 'Active',
    lastLogin: '2024-07-29 09:15 AM',
  },
  {
    id: 'admin_3',
    name: 'Support Specialist',
    email: 'support.specialist@batohi.com',
    role: 'Support Admin',
    status: 'Disabled',
    lastLogin: '2024-07-28 05:45 PM',
  },
];

export default function AdminListPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Admins</h1>
        <p className="text-muted-foreground">
          Manage all administrator accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Accounts</CardTitle>
          <CardDescription>
            A list of all admins with access to the portal.
          </CardDescription>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="w-full pl-8"
              />
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="content-admin">Content Admin</SelectItem>
                  <SelectItem value="support-admin">Support Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        admin.role === 'Super Admin' ? 'default' : 'secondary'
                      }
                    >
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{admin.lastLogin}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        admin.status === 'Active' ? 'default' : 'destructive'
                      }
                    >
                      {admin.status}
                    </Badge>
                  </TableCell>
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
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/admins/edit/1">
                            <UserCog className="mr-2 h-4 w-4" />
                            Edit Admin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/admins/activity-log">
                            <Eye className="mr-2 h-4 w-4" />
                            View Activity
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShieldOff className="mr-2 h-4 w-4" />
                          {admin.status === 'Active'
                            ? 'Disable Admin'
                            : 'Enable Admin'}
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
