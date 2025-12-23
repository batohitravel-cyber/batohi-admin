'use client';

import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar';

function Layout({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    
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
