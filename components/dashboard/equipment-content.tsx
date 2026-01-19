'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Wrench, AlertTriangle } from 'lucide-react';

const dummyEquipment = [
  {
    id: '1',
    name: 'Tractor - John Deere 5310',
    farm: 'Nakaseke Main',
    category: 'Machinery',
    purchaseDate: '2022-03-15',
    purchasePrice: 45000000,
    serialNumber: 'JD-5310-001',
    status: 'active',
    lastMaintenance: '2024-01-10',
  },
  {
    id: '2',
    name: 'Water Pump',
    farm: 'Nakaseke Main',
    category: 'Irrigation',
    purchaseDate: '2023-06-20',
    purchasePrice: 8500000,
    serialNumber: 'WP-001',
    status: 'active',
    lastMaintenance: '2024-02-05',
  },
  {
    id: '3',
    name: 'Maize Sheller',
    farm: 'Bukeelere Farm',
    category: 'Processing',
    purchaseDate: '2021-11-10',
    purchasePrice: 3200000,
    serialNumber: 'MS-001',
    status: 'maintenance',
    lastMaintenance: '2024-01-20',
  },
];

export function EquipmentContent() {
  const [equipment, setEquipment] = useState(dummyEquipment);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    farm: '',
    category: '',
    purchaseDate: '',
    purchasePrice: '',
  });

  const handleAddEquipment = () => {
    console.log('[v0] Adding equipment:', newEquipment);
    setOpenDialog(false);
    setNewEquipment({ name: '', farm: '', category: '', purchaseDate: '', purchasePrice: '' });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800';
      case 'retired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all farm equipment and machinery</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Equipment</DialogTitle>
              <DialogDescription>Register new farm equipment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Equipment Name</label>
                <Input
                  placeholder="e.g., Tractor John Deere"
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g., Machinery, Irrigation, Processing"
                  value={newEquipment.category}
                  onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Purchase Price (UGX)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newEquipment.purchasePrice}
                  onChange={(e) => setNewEquipment({ ...newEquipment, purchasePrice: e.target.value })}
                />
              </div>
              <Button onClick={handleAddEquipment} className="w-full bg-emerald-600">
                Add Equipment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {equipment.filter((e) => e.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex gap-2">
              <AlertTriangle className="h-4 w-4" /> Maintenance Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {equipment.filter((e) => e.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Inventory</CardTitle>
          <CardDescription>All equipment across farms</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Farm</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell className="font-medium">{eq.name}</TableCell>
                  <TableCell>{eq.farm}</TableCell>
                  <TableCell>{eq.category}</TableCell>
                  <TableCell>{eq.purchaseDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(eq.status)}>{eq.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Wrench className="h-3 w-3" />
                      Maintain
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
