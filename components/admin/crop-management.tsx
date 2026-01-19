'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { createCrop, toggleCropLifecycleStage, toggleCropStatus } from '@/app/actions/crops';

interface Crop {
  id: string;
  name: string;
  type: 'crop' | 'livestock';
  lifecycle: ('farming' | 'processing' | 'sale')[];
  status: 'active' | 'inactive' | 'discontinued';
  description?: string;
  created_at: string;
}

interface CropManagementProps {
  initialCrops?: Crop[];
}

export function CropManagement({ initialCrops = [] }: CropManagementProps) {
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [newCrop, setNewCrop] = useState({
    name: '',
    type: 'crop' as 'crop' | 'livestock',
    lifecycle: [] as ('farming' | 'processing' | 'sale')[],
  });

  const handleAddCrop = () => {
    if (!newCrop.name) {
      alert('Please enter crop/livestock name');
      return;
    }

    startTransition(async () => {
      const result = await createCrop(newCrop.name, newCrop.type, undefined, newCrop.lifecycle);
      if (result.error) {
        alert('Error creating crop: ' + result.error);
      } else {
        setOpen(false);
        setNewCrop({ name: '', type: 'crop', lifecycle: [] });
      }
    });
  };

  const handleToggleStatus = (id: string) => {
    const crop = crops.find((c) => c.id === id);
    if (!crop) return;

    const newStatus =
      crop.status === 'active'
        ? ('inactive' as const)
        : crop.status === 'inactive'
          ? ('discontinued' as const)
          : ('active' as const);

    startTransition(async () => {
      await toggleCropStatus(id, newStatus);
      setCrops(
        crops.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    });
  };

  const handleToggleLifecycle = (id: string, stage: 'farming' | 'processing' | 'sale') => {
    startTransition(async () => {
      await toggleCropLifecycleStage(id, stage);
      setCrops(
        crops.map((crop) =>
          crop.id === id
            ? {
                ...crop,
                lifecycle: crop.lifecycle.includes(stage)
                  ? crop.lifecycle.filter((l) => l !== stage)
                  : [...crop.lifecycle, stage],
              }
            : crop
        )
      );
    });
  };

  const toggleLifecycle = handleToggleLifecycle;
  const toggleStatus = handleToggleStatus;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Crops & Livestock Management</CardTitle>
          <CardDescription>Manage crops, livestock, and their lifecycle stages</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Add Crop/Livestock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Crop or Livestock</DialogTitle>
              <DialogDescription>Register a new crop or livestock type</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="e.g., Lemon Grass"
                  value={newCrop.name}
                  onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={newCrop.type} onValueChange={(type: any) => setNewCrop({ ...newCrop, type })} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crop">Crop</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddCrop} className="w-full bg-emerald-600" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Farming</TableHead>
                <TableHead>Processing</TableHead>
                <TableHead>Sale</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crops.map((crop) => (
                <TableRow key={crop.id}>
                  <TableCell className="font-medium">{crop.name}</TableCell>
                  <TableCell className="capitalize">{crop.type}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleLifecycle(crop.id, 'farming')}
                      className="cursor-pointer"
                      disabled={isPending}
                    >
                      {crop.lifecycle.includes('farming') ? (
                        <ToggleRight className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleLifecycle(crop.id, 'processing')}
                      className="cursor-pointer"
                      disabled={isPending}
                    >
                      {crop.lifecycle.includes('processing') ? (
                        <ToggleRight className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleLifecycle(crop.id, 'sale')}
                      className="cursor-pointer"
                      disabled={isPending}
                    >
                      {crop.lifecycle.includes('sale') ? (
                        <ToggleRight className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(crop.id)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        crop.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : crop.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                      disabled={isPending}
                    >
                      {crop.status}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
