'use client';

import { Bell, ChevronDown, Flag, Search } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [adminName, setAdminName] = React.useState('Batohi Admin');
  const [adminRole, setAdminRole] = React.useState('Super Admin');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Fetch admin details
    const fetchAdmin = async () => {
      const email = localStorage.getItem('adminEmail');
      if (email) {
        const { getAdminByEmail } = await import('@/lib/server-actions');
        const admin = await getAdminByEmail(email);
        if (admin) {
          setAdminName(admin.full_name || 'Batohi Admin');
          setAdminRole(admin.role || 'Super Admin');
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
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background px-4 sm:px-6 shadow-sm">
      {/* Left Section: Logo + App Name */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <span className="font-bold text-lg text-gray-800">Batohi</span>
      </div>

      {/* Center Section: Search Bar */}
      <div className="relative flex-1 max-w-md mx-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-secondary pl-10 pr-4 py-2"
        />
      </div>

      {/* Right Section: Clock, Notifications, Language, User Menu */}
      <div className="flex items-center gap-4">
        {/* Real-Time Clock */}
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {formattedTime}
        </span>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-primary"></span>
          <span className="sr-only">Toggle notifications</span>
        </Button>

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1">
              <Image
                src={i18n.language === 'hi' ? '/in-flag.svg' : '/uk-flag.svg'}
                alt="Language"
                width={20}
                height={20}
              />
              <span className="hidden md:inline">{i18n.language === 'hi' ? 'English' : 'हिंदी'}</span>
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

        {/* Admin Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={userAvatar?.imageUrl}
                  alt={adminName}
                  data-ai-hint={userAvatar?.imageHint}
                />
                <AvatarFallback>{adminName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-left">
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
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive font-medium cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}