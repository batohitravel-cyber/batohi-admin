'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createAdmin } from '@/lib/server-actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const availablePermissions = [
  { id: 'places-read', label: 'Read Places' },
  { id: 'places-write', label: 'Write Places' },
  { id: 'places-edit', label: 'Edit Places' },
  { id: 'places-delete', label: 'Delete Places' },
  { id: 'audio-read', label: 'Read Audio' },
  { id: 'audio-write', label: 'Write Audio' },
  { id: 'users-moderate', label: 'Moderate Users' },
  { id: 'reviews-approve', label: 'Approve Reviews' },
  { id: 'manage-safety', label: 'Manage Safety' },
];

export default function AddAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '', // Temporary
    role: 'Content Admin',
    status: 'Invited'
  });
  const [permissions, setPermissions] = useState<string[]>([]);
  const [sendInvite, setSendInvite] = useState(true);

  const handlePermissionChange = (id: string, checked: boolean) => {
    setPermissions(prev =>
      checked ? [...prev, id] : prev.filter(p => p !== id)
    );
  };



  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        permissions: permissions,
        status: sendInvite ? 'Invited' : 'Active',
        sendInvite: sendInvite
      };

      const result = await createAdmin(payload);

      if (!result.success) {
        throw new Error(result.message);
      }

      alert("Admin added successfully!");
      router.push('/dashboard/admins');
    } catch (error: any) {
      console.error('Error adding admin:', error);
      alert('Failed to add admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Admin</h1>
          <p className="text-muted-foreground">
            Invite a new administrator and set their role and permissions.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/admins">Cancel</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Admin Information</CardTitle>
              <CardDescription>
                Fill in the details for the new admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name *</Label>
                <Input
                  id="full-name"
                  placeholder="e.g., Jane Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., jane.doe@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="temp-password">Set Temporary Password *</Label>
                <div className="relative">
                  <Input
                    id="temp-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Custom Permissions</CardTitle>
              <CardDescription>
                Assign specific permissions. These are usually tied to 'Custom Role' but can be overrides.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availablePermissions.map((permission) => (
                <div key={permission.id} className="flex items-center gap-2">
                  <Checkbox
                    id={permission.id}
                    checked={permissions.includes(permission.id)}
                    onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                  />
                  <Label htmlFor={permission.id} className="font-normal cursor-pointer">
                    {permission.label}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-8 h-fit sticky top-4">
          <Card>
            <CardHeader>
              <CardTitle>Assign Role</CardTitle>
              <CardDescription>
                Select a role to determine access level.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="Content Admin">Content Admin</SelectItem>
                  <SelectItem value="Support">Support Admin</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Invitation</CardTitle>
              <CardDescription>
                Send an email to the new admin with their login details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="send-invite">Send Invitation Email</Label>
                  <p className="text-xs text-muted-foreground">
                    An email will be sent with a temporary password.
                  </p>
                </div>
                <Switch
                  id="send-invite"
                  checked={sendInvite}
                  onCheckedChange={setSendInvite}
                />
              </div>
            </CardContent>
          </Card>
          <Button size="lg" className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Admin
          </Button>
        </div>
      </div>
    </div>
  );
}
