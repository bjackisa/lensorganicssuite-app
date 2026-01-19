'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Leaf,
  Boxes,
  Users,
  DollarSign,
  Settings,
  Zap,
} from 'lucide-react';

const navigation = {
  field_manager: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Farm Operations', href: '/dashboard/farms', icon: Leaf },
    { name: 'Equipment', href: '/dashboard/equipment', icon: Boxes },
  ],
  managing_director: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Farms', href: '/dashboard/farms', icon: Leaf },
    { name: 'Employees', href: '/dashboard/employees', icon: Users },
    { name: 'Financial', href: '/dashboard/financial', icon: DollarSign },
    { name: 'Equipment', href: '/dashboard/equipment', icon: Boxes },
  ],
  it_admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Farms', href: '/dashboard/farms', icon: Leaf },
    { name: 'Employees', href: '/dashboard/employees', icon: Users },
    { name: 'Financial', href: '/dashboard/financial', icon: DollarSign },
    { name: 'Equipment', href: '/dashboard/equipment', icon: Boxes },
    { name: 'System Admin', href: '/dashboard/admin', icon: Settings },
  ],
};

export function SidebarNav({ userRole }: any) {
  const pathname = usePathname();
  const role = userRole?.role || 'field_manager';
  const navItems = navigation[role as keyof typeof navigation] || navigation.field_manager;

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-gray-50 h-[calc(100vh-64px)]">
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'text-gray-700 hover:bg-gray-200'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
