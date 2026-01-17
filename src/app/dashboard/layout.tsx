'use client';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar';

function Layout({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
      if (!isLoggedIn) {
        router.replace('/login?error=Please login first to access the dashboard');
      } else {
        setAuthorized(true);
      }
    };
    checkAuth();
  }, [router]);

  if (!authorized) {
    return null; // Don't render dashboard content while checking/redirecting
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: isCollapsed ? 'calc(var(--sidebar-width-icon))' : 'calc(var(--sidebar-width))' }}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Layout>{children}</Layout>
    </SidebarProvider>
  );
}
