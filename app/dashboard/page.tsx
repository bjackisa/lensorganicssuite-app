import { getCurrentUser, getUserRole } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Users, Boxes, DollarSign } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userRole = await getUserRole(user?.id || '');

  const stats = [
    {
      title: 'Active Farms',
      value: '3',
      description: 'Nakaseke Main, Nakaseke Farm 2, Bukeelere',
      icon: Leaf,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Active Crops',
      value: '6',
      description: 'Lemongrass, Avocado, Chicken, Plantain, Catfish, Coffee',
      icon: Leaf,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Equipment',
      value: '0',
      description: 'Track all farm equipment',
      icon: Boxes,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Financial',
      value: '0 UGX',
      description: 'Total transactions this month',
      icon: DollarSign,
      color: 'bg-green-100 text-green-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-1">
          Manage your farm operations, equipment, employees, and finances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {userRole?.role === 'it_admin' && (
        <Card>
          <CardHeader>
            <CardTitle>System Admin Panel</CardTitle>
            <CardDescription>Manage users, farms, and system settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              As IT Admin, you have access to user and system management. Visit the System Admin
              section to manage roles, permissions, and add new users or farms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
