import React from "react"
import { checkAuth, getUserRole } from '@/lib/supabase-server';
import { TopNav } from '@/components/dashboard/top-nav';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

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
      <DashboardShell userRole={userRole}>
        {children}
      </DashboardShell>
    </div>
  );
}
