import { getSupabaseServer } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Egg, Calendar } from 'lucide-react';
import { AddLivestockDialog, LogEggProductionDialog } from '@/components/livestock/add-livestock-dialog';

async function getLivestockBatches() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('livestock_batches')
    .select('*, farms(name)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching livestock:', error);
    return [];
  }
  return data || [];
}

async function getEggProduction() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('egg_production')
    .select('*, livestock_batches(batch_code)')
    .order('collection_date', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error fetching egg production:', error);
    return [];
  }
  return data || [];
}

export default async function LivestockPage() {
  const batches = await getLivestockBatches();
  const eggRecords = await getEggProduction();

  const totalBirds = batches.reduce((sum: number, b: any) => sum + (b.current_count || 0), 0);
  const totalEggs = eggRecords.reduce((sum: number, e: any) => sum + (e.total_eggs || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Livestock Management</h1>
          <p className="text-gray-600 mt-1">Manage poultry batches, health records, and egg production</p>
        </div>
        <AddLivestockDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{batches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Birds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalBirds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Eggs This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalEggs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Health Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Livestock Batches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Livestock Batches</CardTitle>
            <CardDescription>All poultry and livestock batches</CardDescription>
          </div>
          <AddLivestockDialog buttonText="Add Batch" />
        </CardHeader>
        <CardContent>
          {batches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((batch: any) => (
                <div key={batch.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-amber-100">
                        <Egg className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">{batch.batch_code}</p>
                        <p className="text-xs text-gray-600">{batch.livestock_type}</p>
                      </div>
                    </div>
                    <Badge className={batch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {batch.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Count</span>
                      <span className="font-medium">{batch.current_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Farm</span>
                      <span className="font-medium">{batch.farms?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Egg className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No livestock batches yet</p>
              <p className="text-xs mt-1">Add your first batch to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Egg Production */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Egg Production</CardTitle>
            <CardDescription>Daily egg collection records</CardDescription>
          </div>
          <LogEggProductionDialog />
        </CardHeader>
        <CardContent>
          {eggRecords.length > 0 ? (
            <div className="space-y-3">
              {eggRecords.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{record.livestock_batches?.batch_code}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(record.collection_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-amber-600">{record.total_eggs}</p>
                    <p className="text-xs text-gray-500">eggs collected</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No egg production records</p>
              <p className="text-xs mt-1">Start logging daily egg collection</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
