'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface AddLivestockDialogProps {
  trigger?: React.ReactNode;
  buttonText?: string;
}

export function AddLivestockDialog({ trigger, buttonText = 'New Livestock Batch' }: AddLivestockDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    farm_id: '',
    batch_code: '',
    livestock_type: '',
    breed: '',
    initial_count: '',
    acquisition_date: '',
    source: '',
  });

  useEffect(() => {
    if (open) {
      fetch('/api/farms').then(res => res.json()).then(data => setFarms(data || []));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/livestock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          batch_code: formData.batch_code || `LB-${Date.now().toString().slice(-6)}`,
          initial_count: parseInt(formData.initial_count) || 0,
          current_count: parseInt(formData.initial_count) || 0,
          status: 'active',
        }),
      });

      if (response.ok) {
        setFormData({ farm_id: '', batch_code: '', livestock_type: '', breed: '', initial_count: '', acquisition_date: '', source: '' });
        setOpen(false);
        router.refresh();
      } else {
        alert('Failed to create livestock batch. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4" />
            {buttonText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Livestock Batch</DialogTitle>
          <DialogDescription>Record a new livestock batch.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Farm *</Label>
              <Select value={formData.farm_id} onValueChange={(v) => setFormData({ ...formData, farm_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select farm" /></SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (<SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Livestock Type *</Label>
              <Select value={formData.livestock_type} onValueChange={(v) => setFormData({ ...formData, livestock_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="layers">Layers (Chickens)</SelectItem>
                  <SelectItem value="broilers">Broilers</SelectItem>
                  <SelectItem value="ducks">Ducks</SelectItem>
                  <SelectItem value="turkeys">Turkeys</SelectItem>
                  <SelectItem value="goats">Goats</SelectItem>
                  <SelectItem value="pigs">Pigs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Batch Code</Label>
              <Input value={formData.batch_code} onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })} placeholder="Auto-generated" />
            </div>
            <div className="space-y-2">
              <Label>Breed</Label>
              <Input value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} placeholder="e.g., Rhode Island Red" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Initial Count *</Label>
              <Input type="number" value={formData.initial_count} onChange={(e) => setFormData({ ...formData, initial_count: e.target.value })} placeholder="e.g., 500" required />
            </div>
            <div className="space-y-2">
              <Label>Acquisition Date</Label>
              <Input type="date" value={formData.acquisition_date} onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Input value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} placeholder="e.g., Hatchery name" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Batch'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LogEggProductionDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    batch_id: '',
    collection_date: new Date().toISOString().split('T')[0],
    total_eggs: '',
    broken_eggs: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetch('/api/livestock').then(res => res.json()).then(data => setBatches(data?.filter((b: any) => b.livestock_type === 'layers') || []));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/egg-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          livestock_batch_id: formData.batch_id,
          collection_date: formData.collection_date,
          total_eggs: parseInt(formData.total_eggs) || 0,
          broken_eggs: parseInt(formData.broken_eggs) || 0,
          notes: formData.notes,
        }),
      });
      if (response.ok) {
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Log Production</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Egg Production</DialogTitle>
          <DialogDescription>Record daily egg collection.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Batch *</Label>
            <Select value={formData.batch_id} onValueChange={(v) => setFormData({ ...formData, batch_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
              <SelectContent>
                {batches.map((b) => (<SelectItem key={b.id} value={b.id}>{b.batch_code}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={formData.collection_date} onChange={(e) => setFormData({ ...formData, collection_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Total Eggs *</Label>
              <Input type="number" value={formData.total_eggs} onChange={(e) => setFormData({ ...formData, total_eggs: e.target.value })} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
