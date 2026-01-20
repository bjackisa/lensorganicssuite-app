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

export function AddEquipmentDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    equipment_type: '',
    farm_id: '',
    serial_number: '',
    purchase_date: '',
    purchase_cost: '',
    condition: 'good',
    notes: '',
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
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          purchase_cost: formData.purchase_cost ? parseFloat(formData.purchase_cost) : null,
          status: 'available',
        }),
      });
      if (response.ok) {
        setFormData({ name: '', equipment_type: '', farm_id: '', serial_number: '', purchase_date: '', purchase_cost: '', condition: 'good', notes: '' });
        setOpen(false);
        router.refresh();
      } else {
        alert('Failed to add equipment.');
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
        {trigger || <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4" />Add Equipment</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Equipment</DialogTitle>
          <DialogDescription>Register new farm equipment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Equipment Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Tractor" required />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={formData.equipment_type} onValueChange={(v) => setFormData({ ...formData, equipment_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tractor">Tractor</SelectItem>
                  <SelectItem value="irrigation">Irrigation System</SelectItem>
                  <SelectItem value="harvester">Harvester</SelectItem>
                  <SelectItem value="sprayer">Sprayer</SelectItem>
                  <SelectItem value="generator">Generator</SelectItem>
                  <SelectItem value="pump">Water Pump</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="tools">Hand Tools</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Farm</Label>
              <Select value={formData.farm_id} onValueChange={(v) => setFormData({ ...formData, farm_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select farm" /></SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (<SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Serial Number</Label>
              <Input value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} placeholder="e.g., SN-12345" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Input type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Purchase Cost</Label>
              <Input type="number" step="0.01" value={formData.purchase_cost} onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })} placeholder="e.g., 5000000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Condition</Label>
            <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes..." rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : 'Add Equipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LogMaintenanceDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    equipment_id: '',
    maintenance_type: '',
    maintenance_date: new Date().toISOString().split('T')[0],
    cost: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetch('/api/equipment').then(res => res.json()).then(data => setEquipment(data || []));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/equipment/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: formData.equipment_id,
          maintenance_type: formData.maintenance_type,
          maintenance_date: formData.maintenance_date,
          cost: formData.cost ? parseFloat(formData.cost) : null,
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
        {trigger || <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Log Maintenance</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Maintenance</DialogTitle>
          <DialogDescription>Record equipment maintenance.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Equipment *</Label>
            <Select value={formData.equipment_id} onValueChange={(v) => setFormData({ ...formData, equipment_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
              <SelectContent>
                {equipment.map((e) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={formData.maintenance_type} onValueChange={(v) => setFormData({ ...formData, maintenance_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine Service</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="replacement">Part Replacement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={formData.maintenance_date} onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cost</Label>
            <Input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} placeholder="e.g., 150000" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
