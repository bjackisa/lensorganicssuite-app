import React from "react"
import { checkAuth, getUserRole } from '@/lib/supabase-server';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { TopNav } from '@/components/dashboard/top-nav';

export const metadata = {
  title: 'Dashboard - Lens Organics Suite',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await checkAuth();
  const userRole = await getUserRole(user.id);

  return (
    <div className="min-h-screen bg-background">
      <TopNav user={user} userRole={userRole} />
      <div className="flex">
        <SidebarNav userRole={userRole} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
