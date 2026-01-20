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
  Factory,
  Egg,
  Fish,
  ShoppingCart,
  Truck,
  FileText,
  BarChart3,
} from 'lucide-react';

const allNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Farms', href: '/dashboard/farms', icon: Leaf },
  { name: 'Crops', href: '/dashboard/crops', icon: Leaf },
  { name: 'Livestock', href: '/dashboard/livestock', icon: Egg },
  { name: 'Aquaculture', href: '/dashboard/aquaculture', icon: Fish },
  { name: 'Processing', href: '/dashboard/processing', icon: Factory },
  { name: 'Employees', href: '/dashboard/employees', icon: Users },
  { name: 'Equipment', href: '/dashboard/equipment', icon: Boxes },
  { name: 'Financial', href: '/dashboard/financial', icon: DollarSign },
  { name: 'Customers', href: '/dashboard/customers', icon: ShoppingCart },
  { name: 'Suppliers', href: '/dashboard/suppliers', icon: Truck },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'System Admin', href: '/dashboard/admin', icon: Settings },
];

export function SidebarNav({ userRole }: any) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-gray-50 h-[calc(100vh-64px)] overflow-y-auto">
      <nav className="flex-1 space-y-1 p-4">
        {allNavItems.map((item) => {
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

export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden" 
        onClick={onClose}
      />
      <aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 md:hidden shadow-xl overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-emerald-700">🌿 Lens Organics</span>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              ✕
            </button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
    </>
  );
}
