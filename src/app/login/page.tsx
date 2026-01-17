'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { verifyAdminLogin, verify2FAToken, generate2FASecret, enable2FA } from '@/lib/server-actions';
import Link from 'next/link';
import { Lock, Smartphone, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA State
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState('');

  // 2FA Setup State
  const [showSetupPrompt, setShowSetupPrompt] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [setupToken, setSetupToken] = useState('');

  useEffect(() => {
    const errorMsg = searchParams.get('error');
    if (errorMsg) {
      // Delay slightly to ensure toast system is ready or simply fire
      setTimeout(() => {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: errorMsg,
        });
      }, 100);
      // Clean up URL? Optional, but nicer.
      // router.replace('/login'); 
      // Avoid redirect loop or unnecessary navigation for now.
    }
  }, [searchParams, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await verifyAdminLogin(email, password);

      if (!result.success) {
        setError(result.message || 'Login failed');
        setLoading(false);
        return;
      }

      if (result.require2FA) {
        setRequires2FA(true);
        setUserId(result.userId);
        setLoading(false);
        return;
      }

      // Success (No 2FA currently enabled)
      // Check if we should prompt for setup
      if (result.admin && !result.admin.is_two_factor_enabled) {
        setUserId(result.admin.id);
        setShowSetupPrompt(true);
        setLoading(false);
        return;
      }

      finishLogin(email);

    } catch (err: any) {
      console.error('Login Process Error:', err);
      setError('An error occurred during login');
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!userId) {
        setError("Missing user context. Please login again.");
        setRequires2FA(false);
        return;
      }

      const result = await verify2FAToken(userId, token);
      if (result.success) {
        finishLogin(email);
      } else {
        setError(result.message || 'Invalid 2FA token');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred verifying token');
      setLoading(false);
    }
  };

  const start2FASetup = async () => {
    if (!userId || !email) return;
    setLoading(true);
    try {
      const { qrCodeUrl } = await generate2FASecret(userId, email);
      setQrCodeUrl(qrCodeUrl);
      setIsSettingUp2FA(true);
      setShowSetupPrompt(false);
    } catch (e) {
      setError("Failed to generate 2FA secret");
    } finally {
      setLoading(false);
    }
  };

  const complete2FASetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);

    const result = await enable2FA(userId, setupToken);
    if (result.success) {
      finishLogin(email);
    } else {
      setError(result.message || "Invalid code. Please try again.");
      setLoading(false);
    }
  };

  const finishLogin = (userEmail: string) => {
    // In a real app we would set a session here via server action cookies
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('adminEmail', userEmail);
    }
    router.push('/dashboard');
  };

  const skip2FASetup = () => {
    finishLogin(email);
  };

  // View: Enter 2FA Code (Existing User)
  if (requires2FA) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the code from your authenticator app
            </CardDescription>
          </CardHeader>
          <form onSubmit={handle2FASubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="token" className="sr-only">Token</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="000 000"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setRequires2FA(false); setToken(''); }} type="button">
                Back to Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // View: Prompt to Setup 2FA
  if (showSetupPrompt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold">Enable Two-Factor Authentication</CardTitle>
            <CardDescription>
              Secure your account by setting up 2FA. You can do this later from the settings.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" onClick={start2FASetup} disabled={loading}>
              {loading ? 'Preparing...' : 'Set up 2FA'}
            </Button>
            <Button variant="outline" className="w-full" onClick={skip2FASetup}>
              Skip for now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // View: Configuring 2FA (QR Code)
  if (isSettingUp2FA && qrCodeUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              <QrCode className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>
              Use Google Authenticator or any 2FA app to scan the code below.
            </CardDescription>
          </CardHeader>
          <form onSubmit={complete2FASetup}>
            <CardContent className="flex flex-col items-center space-y-6 pt-4">
              <div className="bg-white p-2 border rounded-lg shadow-sm">
                <Image src={qrCodeUrl} alt="2FA QR Code" width={180} height={180} />
              </div>

              {error && (
                <div className="p-3 w-full text-sm text-center text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="w-full space-y-2">
                <Label htmlFor="setupToken" className="text-center block">Enter Verification Code</Label>
                <Input
                  id="setupToken"
                  type="text"
                  placeholder="000 000"
                  className="text-center text-lg tracking-widest max-w-[200px] mx-auto"
                  maxLength={6}
                  required
                  value={setupToken}
                  onChange={(e) => setSetupToken(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  // Keep existing login page as default return
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Batohi Admin Pro</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin panel.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@batohi.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={loading}>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Logging in...' : 'Login'}</span>
              </div>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-muted/40">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
