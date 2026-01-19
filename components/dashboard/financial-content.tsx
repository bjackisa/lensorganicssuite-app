'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

const dummyInvoices = [
  {
    id: '1',
    clientName: 'GreenAg Solutions Ltd',
    crop: 'Lemon Grass Oil',
    quantity: 100,
    unit: 'liters',
    totalPrice: 5000000,
    status: 'paid',
    dueDate: '2024-02-15',
    invoiceDate: '2024-01-15',
  },
  {
    id: '2',
    clientName: 'Organic Farms Uganda',
    crop: 'Hass Avocado',
    quantity: 500,
    unit: 'kg',
    totalPrice: 3500000,
    status: 'pending',
    dueDate: '2024-02-20',
    invoiceDate: '2024-01-20',
  },
  {
    id: '3',
    clientName: 'Local Cooperative',
    crop: 'Coffee Beans',
    quantity: 250,
    unit: 'kg',
    totalPrice: 2750000,
    status: 'overdue',
    dueDate: '2024-01-31',
    invoiceDate: '2024-01-01',
  },
];

const dummyExpenses = [
  { id: '1', category: 'Seeds & Inputs', amount: 1500000, date: '2024-01-10', description: 'Fertilizer purchase' },
  { id: '2', category: 'Labor', amount: 800000, date: '2024-01-15', description: 'Weekly wages' },
  { id: '3', category: 'Equipment', amount: 2500000, date: '2024-01-20', description: 'Pump maintenance' },
  { id: '4', category: 'Transportation', amount: 600000, date: '2024-01-25', description: 'Fuel and transport' },
];

export function FinancialContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [invoices, setInvoices] = useState(dummyInvoices);
  const [expenses, setExpenses] = useState(dummyExpenses);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalPrice, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid').length;
  const pendingInvoices = invoices.filter((inv) => inv.status === 'pending' || inv.status === 'overdue').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
        <p className="text-gray-600 mt-1">Invoicing, receipts, and accounting (Currency: UGX)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalRevenue / 1000000).toFixed(1)}M UGX
            </div>
            <p className="text-xs text-gray-600 mt-1">From {invoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(totalExpenses / 1000000).toFixed(1)}M UGX
            </div>
            <p className="text-xs text-gray-600 mt-1">{expenses.length} expense records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(netProfit / 1000000).toFixed(1)}M UGX
            </div>
            <p className="text-xs text-gray-600 mt-1">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingInvoices}</div>
            <p className="text-xs text-gray-600 mt-1">Pending/Overdue invoices</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Invoiced</span>
                  <span className="font-semibold">{invoices.length} invoices</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid</span>
                  <span className="font-semibold text-green-600">{paidInvoices}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Outstanding</span>
                  <span className="font-semibold text-amber-600">{pendingInvoices}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expense Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Expenses</span>
                  <span className="font-semibold">{(totalExpenses / 1000000).toFixed(1)}M UGX</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Records</span>
                  <span className="font-semibold">{expenses.length} entries</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average</span>
                  <span className="font-semibold">{(totalExpenses / expenses.length / 1000000).toFixed(2)}M UGX</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openInvoiceDialog} onOpenChange={setOpenInvoiceDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>Record a new sale/invoice</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Client Name</label>
                    <Input placeholder="Client name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Crop/Product</label>
                    <Input placeholder="Crop or product name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Price (UGX)</label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <Button className="w-full bg-emerald-600">Create Invoice</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount (UGX)</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.clientName}</TableCell>
                      <TableCell>{invoice.crop}</TableCell>
                      <TableCell>{invoice.totalPrice.toLocaleString()}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openExpenseDialog} onOpenChange={setOpenExpenseDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4" />
                  Log Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Expense</DialogTitle>
                  <DialogDescription>Record a farm expense</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input placeholder="e.g., Seeds, Labor, Equipment" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount (UGX)</label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input placeholder="What was this for?" />
                  </div>
                  <Button className="w-full bg-emerald-600">Log Expense</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount (UGX)</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.category}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.amount.toLocaleString()}</TableCell>
                      <TableCell>{expense.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
