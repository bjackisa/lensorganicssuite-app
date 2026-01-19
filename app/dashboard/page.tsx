import Link from 'next/link';
import { getCurrentUser, getUserRole, getSupabaseServer } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, Users, Boxes, DollarSign, Factory, Egg, Fish, 
  TrendingUp, AlertTriangle, Calendar, ArrowRight,
  ShoppingCart, Truck, BarChart3
} from 'lucide-react';

async function getDashboardStats() {
  const supabase = await getSupabaseServer();
  
  const [
    { count: farmsCount },
    { count: employeesCount },
    { count: equipmentCount },
    { data: recentActivities },
  ] = await Promise.all([
    supabase.from('farms').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('equipment').select('*', { count: 'exact', head: true }),
    supabase.from('farm_activities').select('*, farms(name)').order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    farms: farmsCount || 0,
    employees: employeesCount || 0,
    equipment: equipmentCount || 0,
    recentActivities: recentActivities || [],
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userRole = await getUserRole(user?.id || '');
  const stats = await getDashboardStats();

  const quickActions = [
    { name: 'View Farms', href: '/dashboard/farms', icon: Leaf, color: 'bg-emerald-500' },
    { name: 'Manage Crops', href: '/dashboard/crops', icon: Leaf, color: 'bg-green-500' },
    { name: 'Livestock', href: '/dashboard/livestock', icon: Egg, color: 'bg-amber-500' },
    { name: 'Aquaculture', href: '/dashboard/aquaculture', icon: Fish, color: 'bg-blue-500' },
    { name: 'Processing', href: '/dashboard/processing', icon: Factory, color: 'bg-purple-500' },
    { name: 'Employees', href: '/dashboard/employees', icon: Users, color: 'bg-indigo-500' },
    { name: 'Equipment', href: '/dashboard/equipment', icon: Boxes, color: 'bg-orange-500' },
    { name: 'Financial', href: '/dashboard/financial', icon: DollarSign, color: 'bg-teal-500' },
  ];

  const statCards = [
    {
      title: 'Active Farms',
      value: stats.farms.toString(),
      description: 'Total operational farms',
      icon: Leaf,
      color: 'bg-emerald-100 text-emerald-700',
      href: '/dashboard/farms',
    },
    {
      title: 'Employees',
      value: stats.employees.toString(),
      description: 'Active team members',
      icon: Users,
      color: 'bg-blue-100 text-blue-700',
      href: '/dashboard/employees',
    },
    {
      title: 'Equipment',
      value: stats.equipment.toString(),
      description: 'Registered equipment',
      icon: Boxes,
      color: 'bg-amber-100 text-amber-700',
      href: '/dashboard/equipment',
    },
    {
      title: 'This Month',
      value: '0 UGX',
      description: 'Net revenue',
      icon: DollarSign,
      color: 'bg-green-100 text-green-700',
      href: '/dashboard/financial',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">
            Manage your farm operations, equipment, employees, and finances.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard/farms">
              <Leaf className="h-4 w-4 mr-2" />
              View Farms
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
            </Link>
          );
        })}
      </div>

      {/* Quick Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access all modules of Lens Organics Suite</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className={`p-3 rounded-full ${action.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{action.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest farm operations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/farms">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{activity.title || activity.activity_type}</p>
                      <p className="text-xs text-gray-600">{activity.farms?.name || 'Farm Activity'}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.status || 'pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No recent activities</p>
                <p className="text-xs mt-1">Activities will appear here as you log them</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Reminders</CardTitle>
            <CardDescription>Important notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-amber-800">Equipment Maintenance Due</p>
                  <p className="text-xs text-amber-600">Check equipment maintenance schedules</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-blue-800">Monthly Report Available</p>
                  <p className="text-xs text-blue-600">View your farm performance report</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Leaf className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-green-800">Harvest Season</p>
                  <p className="text-xs text-green-600">Plan your upcoming harvests</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Panel for IT Admin */}
      {userRole?.role === 'it_admin' && (
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardHeader>
            <CardTitle className="text-indigo-900">System Administration</CardTitle>
            <CardDescription>Manage users, farms, and system settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-indigo-300">
                <Link href="/dashboard/admin">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-indigo-300">
                <Link href="/dashboard/admin">
                  <Leaf className="h-4 w-4 mr-2" />
                  Manage Farms
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-indigo-300">
                <Link href="/dashboard/admin">
                  <Boxes className="h-4 w-4 mr-2" />
                  Crop Types
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
