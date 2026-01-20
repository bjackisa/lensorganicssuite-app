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

export function AddPondDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    farm_id: '',
    pond_code: '',
    pond_type: '',
    size_sqm: '',
    depth_m: '',
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
      const response = await fetch('/api/fish-ponds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pond_code: formData.pond_code || `POND-${Date.now().toString().slice(-6)}`,
          size_sqm: parseFloat(formData.size_sqm) || null,
          depth_m: parseFloat(formData.depth_m) || null,
          status: 'active',
          current_stock: 0,
        }),
      });
      if (response.ok) {
        setFormData({ farm_id: '', pond_code: '', pond_type: '', size_sqm: '', depth_m: '' });
        setOpen(false);
        router.refresh();
      } else {
        alert('Failed to create pond.');
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
        {trigger || <Button className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4" />Add New Pond</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Fish Pond</DialogTitle>
          <DialogDescription>Register a new fish pond.</DialogDescription>
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
              <Label>Pond Type</Label>
              <Select value={formData.pond_type} onValueChange={(v) => setFormData({ ...formData, pond_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="earthen">Earthen</SelectItem>
                  <SelectItem value="concrete">Concrete</SelectItem>
                  <SelectItem value="liner">Liner</SelectItem>
                  <SelectItem value="tank">Tank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Pond Code</Label>
            <Input value={formData.pond_code} onChange={(e) => setFormData({ ...formData, pond_code: e.target.value })} placeholder="Auto-generated" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Size (m²)</Label>
              <Input type="number" step="0.1" value={formData.size_sqm} onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Depth (m)</Label>
              <Input type="number" step="0.1" value={formData.depth_m} onChange={(e) => setFormData({ ...formData, depth_m: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Pond'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LogStockingDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ponds, setPonds] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    pond_id: '',
    species: '',
    quantity: '',
    stocking_date: new Date().toISOString().split('T')[0],
    average_weight_g: '',
    source: '',
  });

  useEffect(() => {
    if (open) {
      fetch('/api/fish-ponds').then(res => res.json()).then(data => setPonds(data || []));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/fish-stocking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fish_pond_id: formData.pond_id,
          species: formData.species,
          quantity: parseInt(formData.quantity) || 0,
          stocking_date: formData.stocking_date,
          average_weight_g: parseFloat(formData.average_weight_g) || null,
          source: formData.source,
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
        {trigger || <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Log Stocking</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Fish Stocking</DialogTitle>
          <DialogDescription>Record fish stocking event.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pond *</Label>
              <Select value={formData.pond_id} onValueChange={(v) => setFormData({ ...formData, pond_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select pond" /></SelectTrigger>
                <SelectContent>
                  {ponds.map((p) => (<SelectItem key={p.id} value={p.id}>{p.pond_code}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Species *</Label>
              <Select value={formData.species} onValueChange={(v) => setFormData({ ...formData, species: v })}>
                <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tilapia">Tilapia</SelectItem>
                  <SelectItem value="catfish">Catfish</SelectItem>
                  <SelectItem value="carp">Carp</SelectItem>
                  <SelectItem value="trout">Trout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={formData.stocking_date} onChange={(e) => setFormData({ ...formData, stocking_date: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
