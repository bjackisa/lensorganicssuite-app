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
import { Menu } from 'lucide-react';

export function TopNav({ user, userRole }: any) {
  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <Link href="/dashboard" className="font-bold text-lg text-emerald-700">
          🌿 Lens Organics
        </Link>

        <div className="flex items-center gap-4">
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
