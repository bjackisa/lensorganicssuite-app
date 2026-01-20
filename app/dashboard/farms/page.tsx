import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Leaf, Egg, Fish, Calendar } from 'lucide-react';
import { AddFarmDialog } from '@/components/farms/add-farm-dialog';

async function getFarms() {
  const supabase = await getSupabaseServer();
  
  const { data: farms, error } = await supabase
    .from('farms')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching farms:', error);
    return [];
  }
  
  return farms || [];
}

async function getFarmStats() {
  const supabase = await getSupabaseServer();
  
  const [
    { count: totalFarms },
    { count: activeFarms },
    { data: recentActivities },
  ] = await Promise.all([
    supabase.from('farms').select('*', { count: 'exact', head: true }),
    supabase.from('farms').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('farm_activities').select('*, farms(name)').order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    total: totalFarms || 0,
    active: activeFarms || 0,
    recentActivities: recentActivities || [],
  };
}

export default async function FarmsPage() {
  const farms = await getFarms();
  const stats = await getFarmStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'discontinued': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farms</h1>
          <p className="text-gray-600 mt-1">Manage all your farm locations and operations</p>
        </div>
        <AddFarmDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Farms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Farms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.recentActivities.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Farms Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Farms</h2>
        {farms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farms.map((farm: any) => (
              <Link key={farm.id} href={`/dashboard/farms/${farm.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{farm.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {farm.location || 'No location set'}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(farm.status)}>
                        {farm.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Farm Code</span>
                        <span className="font-medium">{farm.code}</span>
                      </div>
                      {farm.total_acreage && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Acreage</span>
                          <span className="font-medium">{farm.total_acreage} acres</span>
                        </div>
                      )}
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Leaf className="h-3 w-3" /> Crops
                          </span>
                          <span className="flex items-center gap-1">
                            <Egg className="h-3 w-3" /> Livestock
                          </span>
                          <span className="flex items-center gap-1">
                            <Fish className="h-3 w-3" /> Fish
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Leaf className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No farms yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first farm</p>
              <AddFarmDialog />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Farm Activities</CardTitle>
            <CardDescription>Latest operations across all farms</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentActivities.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{activity.title || activity.activity_type}</p>
                    <p className="text-xs text-gray-600">{activity.farms?.name || 'Unknown Farm'}</p>
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
              <p className="text-xs mt-1">Farm activities will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
