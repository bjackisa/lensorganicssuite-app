'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Loader2 } from 'lucide-react';
import { createFarm } from '@/app/actions/farms';

interface Farm {
  id: string;
  name: string;
  location: string;
  acres: number;
  status: 'active' | 'inactive' | 'discontinued';
  description?: string;
  created_at: string;
}

interface FarmManagementProps {
  initialFarms?: Farm[];
}

export function FarmManagement({ initialFarms = [] }: FarmManagementProps) {
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    acres: '',
  });

  const handleAddFarm = () => {
    if (!newFarm.name || !newFarm.location || !newFarm.acres) {
      alert('Please fill all fields');
      return;
    }

    startTransition(async () => {
      const result = await createFarm(newFarm.name, newFarm.location, Number(newFarm.acres));
      if (result.error) {
        alert('Error creating farm: ' + result.error);
      } else {
        setOpen(false);
        setNewFarm({ name: '', location: '', acres: '' });
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Farm Management</CardTitle>
          <CardDescription>Manage farm locations and details</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Add Farm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Farm</DialogTitle>
              <DialogDescription>Register a new farm location</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Farm Name</label>
                <Input
                  placeholder="e.g., Nakaseke Main Farm"
                  value={newFarm.name}
                  onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="e.g., Nakaseke"
                  value={newFarm.location}
                  onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Size (acres)</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={newFarm.acres}
                  onChange={(e) => setNewFarm({ ...newFarm, acres: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <Button onClick={handleAddFarm} className="w-full bg-emerald-600" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Creating...' : 'Create Farm'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farm Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Size (acres)</TableHead>
              <TableHead>Crops</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {farms.map((farm) => (
              <TableRow key={farm.id}>
                <TableCell className="font-medium">{farm.name}</TableCell>
                <TableCell>{farm.location}</TableCell>
                <TableCell>{farm.acres}</TableCell>
                <TableCell>{farm.crops}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {farm.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
