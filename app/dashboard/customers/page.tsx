import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, ShoppingCart, Users, Phone, Mail, 
  MapPin, TrendingUp, Calendar 
} from 'lucide-react';

async function getCustomers() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  return data || [];
}

async function getRecentOrders() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('customer_orders')
    .select('*, customers(name)')
    .order('order_date', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data || [];
}

export default async function CustomersPage() {
  const customers = await getCustomers();
  const orders = await getRecentOrders();

  const activeCustomers = customers.filter((c: any) => c.status === 'active').length;
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage customers, orders, and sales relationships</p>
        </div>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-fit">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {(totalRevenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-gray-500">UGX</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customers</CardTitle>
            <CardDescription>All registered customers</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Customer
          </Button>
        </CardHeader>
        <CardContent>
          {customers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map((customer: any) => (
                <div key={customer.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-gray-600">{customer.customer_code}</p>
                      </div>
                    </div>
                    <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {customer.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">{customer.phone}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs truncate">{customer.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No customers yet</p>
              <p className="text-xs mt-1">Add your first customer to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> New Order
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-600">
                      {order.customers?.name} • {new Date(order.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">
                      {(order.total_amount || 0).toLocaleString()} UGX
                    </p>
                    <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No orders yet</p>
              <p className="text-xs mt-1">Orders will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
