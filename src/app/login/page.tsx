'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Authenticate against the custom 'admin' table
      // Note: This matches plaintext passwords. For production, use Supabase Auth or hash passwords.
      const { data: adminData, error: adminCheckError } = await supabase
        .from('admin')
        .select('*')
        .eq('email', email)
        .eq('password', password) // content check
        .single();

      if (adminCheckError) {
        console.error('Admin Table Check Error:', adminCheckError);
      }

      if (adminCheckError || !adminData) {
        throw new Error('Invalid login credentials. Please check your email and password.');
      }

      // Success - In a real app we would set a session here, but for now we just redirect
      // You might want to store a flag in localStorage to persist the "login" state in the UI
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminEmail', email);
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login Process Error:', err);
      // Detailed error for the user to help debugging
      if (err.code === 'PGRST116') { // JSON object requested, multiple (or no) rows returned
        setError('Invalid login credentials.');
      } else {
        setError(err.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

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
                  href="#"
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
            <div className="flex items-center space-x-2">
              <Checkbox id="two-fa" />
              <Label htmlFor="two-fa" className="text-sm font-normal">
                Use two-factor authentication
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
