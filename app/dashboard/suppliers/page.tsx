import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Truck, Package, Phone, Mail, MapPin } from 'lucide-react';

async function getSuppliers() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
  return data || [];
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();
  const activeSuppliers = suppliers.filter((s: any) => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600 mt-1">Manage suppliers and procurement relationships</p>
        </div>
        <Button className="gap-2 bg-purple-600 hover:bg-purple-700 w-fit">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeSuppliers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Suppliers</CardTitle>
            <CardDescription>All registered suppliers</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Supplier
          </Button>
        </CardHeader>
        <CardContent>
          {suppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((supplier: any) => (
                <div key={supplier.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-100">
                        <Truck className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-xs text-gray-600">{supplier.supplier_code}</p>
                      </div>
                    </div>
                    <Badge className={supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {supplier.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    {supplier.category && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="h-3 w-3" />
                        <span className="text-xs">{supplier.category}</span>
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">{supplier.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No suppliers yet</p>
              <p className="text-xs mt-1">Add your first supplier to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
