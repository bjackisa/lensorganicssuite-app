import { checkAuth, getUserRole } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/admin/user-management';
import { FarmManagement } from '@/components/admin/farm-management';
import { CropManagement } from '@/components/admin/crop-management';

export const metadata = {
  title: 'System Admin - Lens Organics Suite',
};

export default async function AdminPage() {
  const user = await checkAuth();
  const userRole = await getUserRole(user.id);

  if (userRole?.role !== 'it_admin') {
    return (
      <div>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-600 mt-1">Manage users, farms, crops, and system settings.</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="farms">Farms</TabsTrigger>
          <TabsTrigger value="crops">Crops & Livestock</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="farms" className="space-y-4">
          <FarmManagement />
        </TabsContent>

        <TabsContent value="crops" className="space-y-4">
          <CropManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
