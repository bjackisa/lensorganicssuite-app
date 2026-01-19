import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, MapPin, Leaf, Egg, Fish, Settings } from 'lucide-react';
import { getSupabaseServer } from '@/lib/supabase-server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductionLifecycle } from '@/components/farms/production-lifecycle';

async function getFarmDetails(farmId: string) {
  const supabase = await getSupabaseServer();

  const { data: farm, error } = await supabase
    .from('farms')
    .select('*')
    .eq('id', farmId)
    .single();

  if (error || !farm) return null;

  // Get production items for this farm
  const { data: productions } = await supabase
    .from('production_items')
    .select(`
      *,
      crop_type:crop_types(*)
    `)
    .eq('farm_id', farmId)
    .eq('status', 'active');

  // Get farm zones
  const { data: zones } = await supabase
    .from('farm_zones')
    .select('*')
    .eq('farm_id', farmId)
    .order('name');

  // Get recent activities
  const { data: activities } = await supabase
    .from('farm_activities')
    .select(`
      *,
      assigned_user:users(full_name)
    `)
    .eq('farm_id', farmId)
    .order('scheduled_date', { ascending: true })
    .limit(10);

  // Get employee count
  const { count: employeeCount } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('farm_id', farmId)
    .eq('employment_status', 'active');

  // Get equipment count
  const { count: equipmentCount } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true })
    .eq('farm_id', farmId)
    .eq('status', 'active');

  return {
    farm,
    productions: productions || [],
    zones: zones || [],
    activities: activities || [],
    employeeCount: employeeCount || 0,
    equipmentCount: equipmentCount || 0,
  };
}

export default async function FarmDetailPage({
  params,
}: {
  params: { farmId: string };
}) {
  const data = await getFarmDetails(params.farmId);

  if (!data) {
    notFound();
  }

  const { farm, productions, zones, activities, employeeCount, equipmentCount } = data;

  // Group productions by type
  const crops = productions.filter((p: any) => p.crop_type?.type === 'crop');
  const livestock = productions.filter((p: any) => p.crop_type?.type === 'livestock');
  const fish = productions.filter((p: any) => p.crop_type?.type === 'fish');

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    discontinued: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/farms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{farm.name}</h1>
              <Badge className={statusColors[farm.status]}>{farm.status}</Badge>
            </div>
            {farm.location && (
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {farm.location}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/farms/${farm.id}/settings`}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Production
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{productions.length}</div>
            <p className="text-sm text-muted-foreground">Active Productions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{zones.length}</div>
            <p className="text-sm text-muted-foreground">Farm Zones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{employeeCount}</div>
            <p className="text-sm text-muted-foreground">Employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{equipmentCount}</div>
            <p className="text-sm text-muted-foreground">Equipment</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="productions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="productions">Productions</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="productions" className="space-y-6">
          {/* Crops */}
          {crops.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Leaf className="h-5 w-5 text-green-600" />
                Crops ({crops.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crops.map((production: any) => (
                  <Card key={production.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        {production.crop_type?.name}
                        <Badge variant="outline" className="text-xs">
                          {production.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProductionLifecycle
                        productionItem={production}
                        readonly
                      />
                      <div className="mt-4 flex gap-2">
                        <Link href={`/dashboard/farms/${farm.id}/production/${production.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Livestock */}
          {livestock.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Egg className="h-5 w-5 text-amber-600" />
                Livestock ({livestock.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {livestock.map((production: any) => (
                  <Card key={production.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        {production.crop_type?.name}
                        <Badge variant="outline" className="text-xs">
                          {production.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProductionLifecycle
                        productionItem={production}
                        readonly
                      />
                      <div className="mt-4 flex gap-2">
                        <Link href={`/dashboard/farms/${farm.id}/production/${production.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Fish/Aquaculture */}
          {fish.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Fish className="h-5 w-5 text-cyan-600" />
                Aquaculture ({fish.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fish.map((production: any) => (
                  <Card key={production.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        {production.crop_type?.name}
                        <Badge variant="outline" className="text-xs">
                          {production.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProductionLifecycle
                        productionItem={production}
                        readonly
                      />
                      <div className="mt-4 flex gap-2">
                        <Link href={`/dashboard/farms/${farm.id}/production/${production.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {productions.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No active productions yet.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Production
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Farm Zones</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </div>

          {zones.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone: any) => (
                <Card key={zone.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      {zone.name}
                      <Badge variant="outline">{zone.zone_type}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{zone.code}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {zone.acreage && (
                        <p><span className="text-muted-foreground">Area:</span> {zone.acreage} acres</p>
                      )}
                      {zone.soil_type && (
                        <p><span className="text-muted-foreground">Soil:</span> {zone.soil_type}</p>
                      )}
                      {zone.irrigation_type && (
                        <p><span className="text-muted-foreground">Irrigation:</span> {zone.irrigation_type}</p>
                      )}
                      <Badge className={
                        zone.status === 'active' ? 'bg-green-100 text-green-800' :
                        zone.status === 'fallow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {zone.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No zones defined yet.</p>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add First Zone
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Farm Activities</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Activity
            </Button>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity: any) => (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <Badge variant="outline">{activity.activity_type}</Badge>
                        <span className={
                          activity.priority === 'urgent' ? 'text-red-600' :
                          activity.priority === 'high' ? 'text-orange-600' :
                          activity.priority === 'medium' ? 'text-yellow-600' :
                          'text-gray-600'
                        }>
                          {activity.priority} priority
                        </span>
                        {activity.assigned_user && (
                          <span className="text-muted-foreground">
                            Assigned to: {activity.assigned_user.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                        activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        activity.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {activity.status}
                      </Badge>
                      {activity.scheduled_date && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(activity.scheduled_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No activities scheduled.</p>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule First Activity
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
