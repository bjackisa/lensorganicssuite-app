import { getSupabaseServer } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Calendar, Sprout } from 'lucide-react';
import { AddPlantingBatchDialog } from '@/components/crops/add-planting-batch-dialog';

async function getCropTypes() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('crop_types')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching crop types:', error);
    return [];
  }
  return data || [];
}

async function getPlantingBatches() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('planting_batches')
    .select('*, crop_types(name), farms(name)')
    .order('planting_date', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error fetching batches:', error);
    return [];
  }
  return data || [];
}

export default async function CropsPage() {
  const cropTypes = await getCropTypes();
  const batches = await getPlantingBatches();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crop Management</h1>
          <p className="text-gray-600 mt-1">Manage crop types, planting batches, and growth records</p>
        </div>
        <AddPlantingBatchDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Crop Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{cropTypes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{batches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready for Harvest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Harvested (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Crop Types */}
      <Card>
        <CardHeader>
          <CardTitle>Crop Types</CardTitle>
          <CardDescription>All registered crop varieties</CardDescription>
        </CardHeader>
        <CardContent>
          {cropTypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cropTypes.map((crop: any) => (
                <div key={crop.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-emerald-100">
                        <Leaf className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">{crop.name}</p>
                        <p className="text-xs text-gray-600">{crop.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <Badge className={crop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {crop.status}
                    </Badge>
                  </div>
                  {crop.growth_duration_days && (
                    <p className="text-xs text-gray-500 mt-2">
                      Growth period: {crop.growth_duration_days} days
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Sprout className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No crop types registered</p>
              <p className="text-xs mt-1">Add crop types from the admin panel</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Planting Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Planting Batches</CardTitle>
          <CardDescription>Latest planting activities</CardDescription>
        </CardHeader>
        <CardContent>
          {batches.length > 0 ? (
            <div className="space-y-3">
              {batches.map((batch: any) => (
                <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{batch.batch_code}</p>
                    <p className="text-xs text-gray-600">
                      {batch.crop_types?.name} • {batch.farms?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{batch.status}</Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(batch.planting_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No planting batches yet</p>
              <p className="text-xs mt-1">Start by creating a new planting batch</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
