import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, FileText, Download, 
  TrendingUp, DollarSign, Leaf, Users 
} from 'lucide-react';

export default async function ReportsPage() {
  const reportTypes = [
    {
      id: 'farm_summary',
      name: 'Farm Summary Report',
      description: 'Overview of all farm operations and production',
      icon: Leaf,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Revenue, expenses, and profit analysis',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'production',
      name: 'Production Report',
      description: 'Crop yields, livestock, and aquaculture output',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'employee',
      name: 'Employee Report',
      description: 'Attendance, payroll, and performance',
      icon: Users,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Stock levels and movement analysis',
      icon: BarChart3,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'sales',
      name: 'Sales Report',
      description: 'Customer orders and revenue by product',
      icon: FileText,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const recentReports = [
    { name: 'Monthly Farm Summary - December 2025', date: '2025-12-31', type: 'Farm Summary' },
    { name: 'Q4 Financial Report 2025', date: '2025-12-31', type: 'Financial' },
    { name: 'Annual Production Report 2025', date: '2025-12-31', type: 'Production' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate and view business reports</p>
        </div>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-fit">
          <FileText className="h-4 w-4" />
          Generate Custom Report
        </Button>
      </div>

      {/* Report Types */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Select a report type to generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <div
                  key={report.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg ${report.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{report.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reports Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">12</div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">3</div>
            <p className="text-xs text-gray-500">Active schedules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Data Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">1.2K</div>
            <p className="text-xs text-gray-500">Records analyzed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Last Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-600">Today</div>
            <p className="text-xs text-gray-500">Farm Summary</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{report.name}</p>
                    <p className="text-xs text-gray-600">
                      {report.type} • {new Date(report.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
