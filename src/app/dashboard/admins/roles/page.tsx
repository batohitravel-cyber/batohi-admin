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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const roles = [
  {
    name: 'Super Admin',
    description: 'Full access to all modules and settings.',
    permissions: 25,
  },
  {
    name: 'Content Admin',
    description: 'Can manage places, audio, festivals, and restaurants.',
    permissions: 12,
  },
  {
    name: 'Support Admin',
    description: 'Manages user reports, reviews, and safety alerts.',
    permissions: 8,
  },
];

const allPermissions = [
  'places:read',
  'places:write',
  'places:edit',
  'places:delete',
  'audio:read',
  'audio:write',
  'users:read',
  'users:moderate',
  'reviews:approve',
  'safety:read',
  'safety:manage',
  'admins:read',
  'admins:write',
  'system:health',
];

export default function AdminRolesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground">
            Manage admin roles and their specific permissions.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" /> Create New Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role and select its permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role-name" className="text-right">
                  Role Name
                </Label>
                <Input id="role-name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Permissions</Label>
                <div className="col-span-3 grid grid-cols-2 gap-4 rounded-md border p-4">
                  {allPermissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center gap-2"
                    >
                      <Checkbox id={`perm-${permission}`} />
                      <Label
                        htmlFor={`perm-${permission}`}
                        className="font-normal"
                      >
                        {permission}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Roles</CardTitle>
          <CardDescription>
            A list of all roles configured in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.name}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.permissions} enabled</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
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
