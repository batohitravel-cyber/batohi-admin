'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  MapPin,
  Headphones,
  UtensilsCrossed,
  PartyPopper,
  BrainCircuit,
  Siren,
  Users as UsersIcon,
  Route,
  Star,
  Bell,
  LogOut,
  ShieldCheck,
  BarChart,
  Settings,
  ChevronRight,
  HeartPulse,
  Building2,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  {
    label: 'CONTENT',
    isHeader: true,
  },
  {
    icon: MapPin,
    label: 'Places',
    href: '/dashboard/places',
    subItems: [
      { href: '/dashboard/places', label: 'All Places' },
      { href: '/dashboard/places/add', label: 'Add New Place' },
      { href: '/dashboard/places/categories', label: 'Categories' },
      { href: '/dashboard/places/media', label: 'Media Manager' },
      { href: '/dashboard/places/alerts', label: 'Place Alerts' },
    ],
  },
  {
    icon: Building2,
    label: 'Hotels',
    href: '/dashboard/hotels',
    subItems: [
      { href: '/dashboard/hotels', label: 'All Hotels' },
      { href: '/dashboard/hotels/add', label: 'Add Hotel' },
      { href: '/dashboard/hotels/categories', label: 'Categories' },
    ],
  },
  {
    icon: Headphones,
    label: 'Audio Stories',
    href: '/dashboard/audio',
    subItems: [
      { href: '/dashboard/audio', label: 'All Stories' },
      { href: '/dashboard/audio/upload', label: 'Upload Story' },
    ],
  },
  {
    icon: UtensilsCrossed,
    label: 'Restaurants',
    href: '/dashboard/restaurants',
    subItems: [
      { href: '/dashboard/restaurants', label: 'All Restaurants' },
      { href: '/dashboard/restaurants/add', label: 'Add Restaurant' },
      { href: '/dashboard/restaurants/festival-foods', label: 'Festival Foods' },
    ],
  },
  {
    icon: PartyPopper,
    label: 'Festivals',
    href: '/dashboard/festivals',
    subItems: [
      { href: '/dashboard/festivals', label: 'All Festivals' },
      { href: '/dashboard/festivals/add', label: 'Add Festival' },
    ],
  },
  {
    icon: Star,
    label: 'Reviews',
    href: '/dashboard/reviews',
    subItems: [
      { href: '/dashboard/reviews', label: 'Review Moderation' },
      { href: '/dashboard/reviews/spam', label: 'Spam Filter' },
    ],
  },
  {
    label: 'PLATFORM',
    isHeader: true,
  },
  {
    icon: UsersIcon,
    label: 'Users',
    href: '/dashboard/users',
    subItems: [
      { href: '/dashboard/users', label: 'User List' },
      { href: '/dashboard/users/reports', label: 'User Reports' },
    ],
  },
  {
    icon: ShieldCheck,
    label: 'Admins',
    href: '/dashboard/admins',
    subItems: [
      { href: '/dashboard/admins', label: 'Admin Management' },
      { href: '/dashboard/admins/roles', label: 'Roles & Permissions' },
      { href: '/dashboard/admins/security', label: 'Security Settings' },
    ],
  },
  {
    icon: BrainCircuit,
    label: 'Ask Batohi AI',
    href: '/dashboard/ai',

  },
  {
    icon: Bell,
    label: 'Notifications',
    href: '/dashboard/notifications',
    subItems: [
      { href: '/dashboard/notifications', label: 'All Notifications' },
    ],
  },

  {
    icon: Siren,
    label: 'Safety',
    href: '/dashboard/safety',
  },
  {
    icon: HeartPulse,
    label: 'System',
    href: '/dashboard/system',
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  const activeMenu = menuItems.find(
    (item) => item.href && pathname.startsWith(item.href) && item.subItems
  );

  return (
    <Sidebar className="border-r border-sidebar-border glass fixed left-0 top-0 h-screen z-40" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary flex items-center justify-center">
            <svg
              className="h-6 w-6 text-primary-foreground"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 27.25C13.0417 27.25 12.125 26.9208 11.25 26.2625L3.4125 20.1C2.5375 19.4417 2.00417 18.5375 1.8125 17.3875C1.62083 16.2375 1.8125 15.1542 2.3875 14.1375L7.4375 5.1625C8.0125 4.14583 8.86667 3.41667 10 2.975C11.1333 2.53333 12.3542 2.38333 13.6625 2.525C14.9708 2.66667 16.15 3.09583 17.2 3.8125L25.0375 9.975C25.9125 10.6333 26.4458 11.5375 26.6375 12.6875C26.8292 13.8375 26.6375 14.9208 26.0625 15.9375L21.0125 24.9125C20.4375 25.9292 19.5833 26.6583 18.45 27.1C17.3167 27.5417 16.1125 27.6917 14.8375 27.55L14.25 27.4875C14.1583 27.3542 14.0875 27.3 14.0375 27.3C13.9875 27.3 13.9583 27.2917 13.95 27.275C14.4167 27.25 14 27.25 14 27.25Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold tracking-tight whitespace-nowrap">
            Batohi
          </h2>
        </div>
      </SidebarHeader>
      <ScrollArea className="flex-1">
        <SidebarContent className="p-4">
          <Accordion
            type="single"
            collapsible
            defaultValue={activeMenu?.href}
            className="w-full"
          >
            <SidebarMenu>
              {menuItems.map((item, index) =>
                item.isHeader ? (
                  <h3
                    key={index}
                    className="px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase mt-6 mb-2"
                  >
                    {item.label}
                  </h3>
                ) : (
                  <SidebarMenuItem key={item.href || item.label}>
                    {item.subItems ? (
                      <AccordionItem value={item.href!} className="border-b-0">
                        <AccordionTrigger asChild>
                          <SidebarMenuButton
                            isActive={pathname.startsWith(item.href!)}
                            tooltip={{ children: item.label, side: 'right' }}
                            className="relative justify-between w-full"
                          >
                            <div className="flex items-center gap-3">
                              {item.icon && <item.icon />}
                              <span className="whitespace-nowrap">
                                {item.label}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 transform transition-transform duration-200" />
                          </SidebarMenuButton>
                        </AccordionTrigger>
                        <AccordionContent className="py-1 pl-8 pr-4 space-y-1">
                          {item.subItems.map((subItem: any) => (
                            <Link key={subItem.href} href={subItem.href}>
                              <SidebarMenuButton
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  'w-full justify-start',
                                  pathname === subItem.href &&
                                  'bg-sidebar-accent text-sidebar-accent-foreground'
                                )}
                              >
                                {subItem.label}
                              </SidebarMenuButton>
                            </Link>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <Link href={item.href || '#'}>
                        <SidebarMenuButton
                          isActive={pathname === item.href}
                          tooltip={{ children: item.label, side: 'right' }}
                          className="relative"
                        >
                          <div className="flex items-center gap-3">
                            {item.icon && <item.icon />}
                            <span className="whitespace-nowrap">{item.label}</span>
                          </div>
                        </SidebarMenuButton>
                      </Link>
                    )}
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </Accordion>
        </SidebarContent>
      </ScrollArea>
      <SidebarSeparator />
      <SidebarFooter className="p-4 flex flex-col gap-4">
        <Link href="/dashboard/settings">
          <SidebarMenuButton
            isActive={pathname.startsWith('/dashboard/settings')}
            className="w-full"
          >
            <div className="flex items-center gap-3">
              <Settings />
              <span className="whitespace-nowrap">Settings</span>
            </div>
          </SidebarMenuButton>
        </Link>
        <Link href="/login">
          <SidebarMenuButton className="w-full">
            <div className="flex items-center gap-3">
              <LogOut />
              <span className="whitespace-nowrap">Logout</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
