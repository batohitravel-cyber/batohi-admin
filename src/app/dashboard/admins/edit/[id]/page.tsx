'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const permissions = [
  { id: 'places-read', label: 'Read Places' },
  { id: 'places-write', label: 'Write Places' },
  { id: 'places-edit', label: 'Edit Places' },
  { id: 'places-delete', label: 'Delete Places' },
  { id: 'audio-read', label: 'Read Audio' },
  { id: 'audio-write', label: 'Write Audio' },
  { id: 'users-read', label: 'Read Users' },
  { id: 'users-moderate', label: 'Moderate Users' },
  { id: 'reviews-approve', label: 'Approve Reviews' },
  { id: 'safety-read', label: 'Read Safety Logs' },
  { id: 'safety-manage', label: 'Manage SOS' },
];

export default function EditAdminPage({ params }: { params: { id: string } }) {
  const admin = {
    id: params.id,
    name: 'Content Manager',
    email: 'content.manager@batohi.com',
    phone: '',
    role: 'Content Admin',
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Admin: {admin.name}</h1>
          <p className="text-muted-foreground">
            Update profile, change role, and modify permissions.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/admins/list">Cancel</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Admin Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" defaultValue={admin.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={admin.email} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input id="phone" type="tel" defaultValue={admin.phone} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Custom Permissions</CardTitle>
              <CardDescription>
                Assign specific permissions if "Custom Role" is selected.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center gap-2">
                  <Checkbox id={permission.id} />
                  <Label htmlFor={permission.id} className="font-normal">
                    {permission.label}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Assign Role</CardTitle>
            </CardHeader>
            <CardContent>
              <Select defaultValue={admin.role}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="content-admin">Content Admin</SelectItem>
                  <SelectItem value="support-admin">Support Admin</SelectItem>
                  <SelectItem value="custom">Custom Role</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button variant="outline">Reset Password</Button>
                <Button variant="destructive">Disable Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-end">
        <Button>Update Admin</Button>
      </div>
    </div>
  );
}
