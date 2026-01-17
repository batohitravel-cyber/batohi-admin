'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
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
import { KeyRound, Moon, Sun, Trash2, Smartphone, Loader2 } from 'lucide-react';
import { generate2FASecret, enable2FA } from '@/lib/server-actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

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
  const { toast } = useToast();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2FA Setup State
  const [setup2FA, setSetup2FA] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function fetchAdmin() {
      const email = typeof window !== 'undefined' ? localStorage.getItem('adminEmail') : null;
      if (!email) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (data) {
        setAdmin(data);
      }
      setLoading(false);
    }
    fetchAdmin();
  }, []);

  const handleStart2FA = async () => {
    if (!admin) return;
    setSetup2FA(true);
    try {
      const res = await generate2FASecret(admin.id, admin.email);
      setQrCode(res.qrCodeUrl);
      setSecret(res.secret);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate 2FA secret",
        variant: "destructive"
      });
      setSetup2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!admin) return;
    setVerifying(true);
    try {
      const res = await enable2FA(admin.id, token);
      if (res.success) {
        setAdmin({ ...admin, is_two_factor_enabled: true });
        setSetup2FA(false);
        toast({
          title: "Success",
          description: "Two-factor authentication enabled successfully.",
        });
      } else {
        toast({
          title: "Invalid Code",
          description: res.message || "Please check the code and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred.",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage portal settings, configurations, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Your personal information.
          </p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Admin Details</CardTitle>
              <CardDescription>Information about the current logged-in administrator.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Loading...</div>
              ) : admin ? (
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Full Name</Label>
                      <div className="font-medium text-lg">{admin.full_name || 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email Address</Label>
                      <div className="font-medium text-lg">{admin.email}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Role</Label>
                      <div><Badge variant="outline" className="text-sm px-3 py-1">{admin.role || 'Super Admin'}</Badge></div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Account ID</Label>
                      <div className="font-mono text-sm text-muted-foreground">{admin.id}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-destructive">Admin details not found.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

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
            Manage your password, 2FA, API keys, and other security settings.
          </p>
        </div>
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Secure your account with Google Authenticator or similar apps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4" /> Loading status...</div>
              ) : admin?.is_two_factor_enabled ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md border border-green-100">
                  <Smartphone className="h-5 w-5" />
                  <span className="font-medium">2FA is currently enabled.</span>
                </div>
              ) : setup2FA ? (
                <div className="space-y-4 border p-4 rounded-lg bg-secondary/20">
                  <h4 className="font-medium">Setup Authenticator</h4>
                  <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app.</p>
                  {qrCode ? (
                    <div className="flex justify-center bg-white p-4 rounded-lg w-fit mx-auto">
                      <Image src={qrCode} alt="2FA QR Code" width={160} height={160} />
                    </div>
                  ) : (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                  )}

                  <div className="space-y-2 max-w-xs mx-auto">
                    <Label htmlFor="verify-token">Enter Verification Code</Label>
                    <Input
                      id="verify-token"
                      placeholder="000 000"
                      className="text-center tracking-widest"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleVerify2FA} disabled={verifying || token.length < 6}>
                      {verifying ? 'Verifying...' : 'Enable 2FA'}
                    </Button>
                    <Button variant="ghost" className="w-full" size="sm" onClick={() => setSetup2FA(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your admin account.</p>
                  <Button onClick={handleStart2FA} disabled={!admin}>Enable 2FA</Button>
                </div>
              )}
            </CardContent>
          </Card>

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
