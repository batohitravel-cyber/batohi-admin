'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from '@/components/ui/separator';
import { KeyRound, Moon, Sun, Trash2 } from 'lucide-react';

const apiKeys = [
  {
    name: 'Default App Key',
    key: 'pk_live_******************_abcd',
    created: '2024-01-01',
  },
  {
    name: 'Analytics Service Key',
    key: 'sk_live_******************_wxyz',
    created: '2024-03-15',
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage portal settings, configurations, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold">General</h2>
          <p className="text-sm text-muted-foreground">
            Basic portal preferences like theme and language.
          </p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6 grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-12 w-12 flex-col gap-1">
                    <Sun className="h-5 w-5" />
                    <span className="text-xs">Light</span>
                  </Button>
                   <Button variant="secondary" size="icon" className="h-12 w-12 flex-col gap-1">
                    <Moon className="h-5 w-5" />
                    <span className="text-xs">Dark</span>
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="w-full md:w-[280px]">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (United States)</SelectItem>
                    <SelectItem value="hi">Hindi (India)</SelectItem>
                    <SelectItem value="es">Spanish (Spain)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold">Security</h2>
          <p className="text-sm text-muted-foreground">
            Manage your password, API keys, and other security settings.
          </p>
        </div>
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Change Password</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for integrations and external services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.key} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{apiKey.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{apiKey.key}</p>
                      <p className="text-xs text-muted-foreground">Created: {apiKey.created}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline">Generate New Key</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

       <Separator />

       <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold">System</h2>
          <p className="text-sm text-muted-foreground">
            View system logs and advanced configurations.
          </p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                    Review system-level logs for debugging and monitoring purposes.
                </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button>View System Logs</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
