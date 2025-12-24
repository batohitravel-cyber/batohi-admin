'use client';

import { Bell, ChevronDown, Flag, Search } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import placeholderImages from '@/lib/placeholder-images.json';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import { useRouter } from 'next/navigation';

export default function Header() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const userAvatar = placeholderImages.placeholderImages.find(
    (p) => p.id === 'adminAvatar'
  );

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
    router.replace('/login');
  };

  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [adminName, setAdminName] = React.useState('Admin User');
  const [adminRole, setAdminRole] = React.useState('Administrator');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Fetch admin details
    const fetchAdmin = async () => {
      const email = localStorage.getItem('adminEmail');
      if (email) {
        // Dynamically import to avoid server/client issues if not handled by framework
        const { getAdminByEmail } = await import('@/lib/server-actions');
        const admin = await getAdminByEmail(email);
        if (admin) {
          setAdminName(admin.full_name || 'Admin User');
          setAdminRole(admin.role || 'Administrator');
        }
      }
    };
    fetchAdmin();

    return () => clearInterval(timer);
  }, []);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  }).format(currentTime);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="relative flex-1 flex items-center gap-4">
        <div className="relative flex-1 max-w-md hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-secondary pl-8"
          />
        </div>
        <div className="text-sm font-medium text-muted-foreground ml-auto md:ml-4 whitespace-nowrap">
          {formattedTime}
        </div>
      </div>
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-primary"></span>
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Image src={i18n.language === 'hi' ? '/in-flag.svg' : '/uk-flag.svg'} alt="Language" width={20} height={20} />
              <span className='hidden md:block'>{i18n.language === 'hi' ? 'हिंदी' : 'English'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => changeLanguage('en')}>
              <div className="flex items-center gap-2">
                <Image src="/uk-flag.svg" alt="English" width={20} height={20} />
                <span>English</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('hi')}>
              <div className="flex items-center gap-2">
                <Image src="/in-flag.svg" alt="Hindi" width={20} height={20} />
                <span>हिंदी</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto p-0">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={userAvatar?.imageUrl}
                  alt={adminName}
                  data-ai-hint={userAvatar?.imageHint}
                />
                <AvatarFallback>{adminName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="font-medium text-sm">{adminName}</span>
                <span className="text-xs text-muted-foreground">{adminRole}</span>
              </div>
              <ChevronDown className="h-4 w-4 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive font-medium cursor-pointer">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
