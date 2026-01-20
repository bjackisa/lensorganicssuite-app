'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddPlantingBatchDialogProps {
  trigger?: React.ReactNode;
}

export function AddPlantingBatchDialog({ trigger }: AddPlantingBatchDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);
  const [cropTypes, setCropTypes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    farm_id: '',
    crop_type_id: '',
    batch_code: '',
    planting_date: '',
    expected_harvest_date: '',
    quantity_planted: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetch('/api/farms').then(res => res.json()).then(data => setFarms(data || []));
      fetch('/api/crop-types').then(res => res.json()).then(data => setCropTypes(data || []));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/planting-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          batch_code: formData.batch_code || `PB-${Date.now().toString().slice(-6)}`,
          quantity_planted: formData.quantity_planted ? parseFloat(formData.quantity_planted) : null,
          status: 'planted',
        }),
      });

      if (response.ok) {
        setFormData({ farm_id: '', crop_type_id: '', batch_code: '', planting_date: '', expected_harvest_date: '', quantity_planted: '', notes: '' });
        setOpen(false);
        router.refresh();
      } else {
        alert('Failed to create planting batch. Please try again.');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            New Planting Batch
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Planting Batch</DialogTitle>
          <DialogDescription>
            Record a new crop planting batch.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farm">Farm *</Label>
              <Select value={formData.farm_id} onValueChange={(v) => setFormData({ ...formData, farm_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select farm" />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="crop">Crop Type *</Label>
              <Select value={formData.crop_type_id} onValueChange={(v) => setFormData({ ...formData, crop_type_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id}>{crop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="batch_code">Batch Code</Label>
            <Input
              id="batch_code"
              value={formData.batch_code}
              onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
              placeholder="Auto-generated if empty"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="planting_date">Planting Date *</Label>
              <Input
                id="planting_date"
                type="date"
                value={formData.planting_date}
                onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_harvest">Expected Harvest</Label>
              <Input
                id="expected_harvest"
                type="date"
                value={formData.expected_harvest_date}
                onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Planted</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity_planted}
              onChange={(e) => setFormData({ ...formData, quantity_planted: e.target.value })}
              placeholder="e.g., 1000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Batch'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
