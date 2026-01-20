'use client';

import { useState } from 'react';
import { SidebarNav, MobileSidebar } from '@/components/dashboard/sidebar-nav';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardShell({ 
  children, 
  userRole 
}: { 
  children: React.ReactNode; 
  userRole: any;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex">
      <SidebarNav userRole={userRole} />
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      {/* Mobile menu button - fixed at bottom */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-4 left-4 z-30 md:hidden bg-emerald-600 hover:bg-emerald-700 shadow-lg rounded-full h-12 w-12"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
