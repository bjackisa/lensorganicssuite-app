'use client';

import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Bell } from 'lucide-react';
import { SyncStatusIndicator } from '@/components/sync-status';

export function TopNav({ user, userRole }: any) {
  return (
    <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <Link href="/dashboard" className="font-bold text-lg text-emerald-700 dark:text-emerald-500">
          🌿 Lens Organics
        </Link>

        <div className="flex items-center gap-4">
          {/* Sync Status */}
          <SyncStatusIndicator />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
          </Button>

          <div className="hidden md:block text-sm">
            <div className="font-medium text-gray-900">{user?.email}</div>
            <div className="text-xs text-gray-500 capitalize">{userRole?.role}</div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account">Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-red-600 cursor-pointer"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
