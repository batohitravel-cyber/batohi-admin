'use client';

import { Bell, ChevronDown, Flag, Search } from 'lucide-react';
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

export default function Header() {
  const { i18n } = useTranslation();
  const userAvatar = placeholderImages.placeholderImages.find(
    (p) => p.id === 'adminAvatar'
  );

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-secondary pl-8 md:w-[280px] lg:w-[320px]"
        />
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
                  alt="Moni Roy"
                  data-ai-hint={userAvatar?.imageHint}
                />
                <AvatarFallback>MR</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="font-medium text-sm">Moni Roy</span>
                <span className="text-xs text-muted-foreground">Admin</span>
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
            <DropdownMenuItem asChild>
              <Link href="/login">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
