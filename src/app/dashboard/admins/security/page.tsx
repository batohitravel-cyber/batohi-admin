'use client';

import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';

export default function AdminSecurityPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Controls</h1>
        <p className="text-muted-foreground">
          Manage system-wide security settings for administrators.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
          <CardDescription>
            Enforce 2FA for all administrator accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select defaultValue="mandatory">
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select 2FA policy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mandatory">Mandatory for All</SelectItem>
              <SelectItem value="optional">Optional</SelectItem>
              <SelectItem value="off">Off</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>
            Control how long admin sessions remain active.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">
              Session Timeout (in minutes)
            </Label>
            <Input
              id="session-timeout"
              type="number"
              defaultValue="60"
              placeholder="e.g., 60"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>
            Restrict access based on IP address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="allowed-ips">Allowed IP Ranges</Label>
                <Input id="allowed-ips" placeholder="e.g., 192.168.1.0/24, 203.0.113.0/24" />
                <p className="text-xs text-muted-foreground">Use comma-separated CIDR notation. Leave blank to allow all.</p>
            </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
          <CardDescription>
            Configure notifications for security-related events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="failed-logins" className="text-base">Failed Login Attempts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive an email after 5 failed login attempts from a single IP.
                  </p>
                </div>
                <Switch id="failed-logins" defaultChecked/>
              </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Security Settings</Button>
      </div>
    </div>
  );
}
