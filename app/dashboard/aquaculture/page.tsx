import { getSupabaseServer } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fish, Calendar } from 'lucide-react';
import { AddPondDialog, LogStockingDialog } from '@/components/aquaculture/add-pond-dialog';

async function getFishPonds() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('fish_ponds')
    .select('*, farms(name)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching ponds:', error);
    return [];
  }
  return data || [];
}

async function getRecentStocking() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('fish_stocking')
    .select('*, fish_ponds(pond_code)')
    .order('stocking_date', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error fetching stocking:', error);
    return [];
  }
  return data || [];
}

export default async function AquaculturePage() {
  const ponds = await getFishPonds();
  const stockingRecords = await getRecentStocking();

  const totalFish = ponds.reduce((sum: number, p: any) => sum + (p.current_stock || 0), 0);
  const activePonds = ponds.filter((p: any) => p.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aquaculture Management</h1>
          <p className="text-gray-600 mt-1">Manage fish ponds, stocking, water quality, and harvests</p>
        </div>
        <AddPondDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Ponds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{ponds.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Ponds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activePonds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Fish Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">{totalFish}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Water Quality Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Fish Ponds */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fish Ponds</CardTitle>
            <CardDescription>All registered fish ponds</CardDescription>
          </div>
          <AddPondDialog />
        </CardHeader>
        <CardContent>
          {ponds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ponds.map((pond: any) => (
                <div key={pond.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Fish className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{pond.pond_code}</p>
                        <p className="text-xs text-gray-600">{pond.pond_type || 'Standard'}</p>
                      </div>
                    </div>
                    <Badge className={pond.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {pond.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Stock</span>
                      <span className="font-medium">{pond.current_stock || 0} fish</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size</span>
                      <span className="font-medium">{pond.size_sqm || 0} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Farm</span>
                      <span className="font-medium">{pond.farms?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Fish className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No fish ponds registered</p>
              <p className="text-xs mt-1">Add your first pond to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Stocking */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Stocking</CardTitle>
            <CardDescription>Latest fish stocking records</CardDescription>
          </div>
          <LogStockingDialog />
        </CardHeader>
        <CardContent>
          {stockingRecords.length > 0 ? (
            <div className="space-y-3">
              {stockingRecords.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{record.fish_ponds?.pond_code}</p>
                    <p className="text-xs text-gray-600">
                      {record.species} • {new Date(record.stocking_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-blue-600">{record.quantity}</p>
                    <p className="text-xs text-gray-500">fish stocked</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No stocking records</p>
              <p className="text-xs mt-1">Log fish stocking to track inventory</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
