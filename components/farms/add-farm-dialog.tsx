'use client';

import { useState } from 'react';
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
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddFarmDialogProps {
  trigger?: React.ReactNode;
}

export function AddFarmDialog({ trigger }: AddFarmDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    total_acreage: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code || formData.name.substring(0, 3).toUpperCase() + '-' + Date.now().toString().slice(-4),
          location: formData.location,
          total_acreage: formData.total_acreage ? parseFloat(formData.total_acreage) : null,
          description: formData.description,
          status: 'active',
        }),
      });

      if (response.ok) {
        setFormData({ name: '', code: '', location: '', total_acreage: '', description: '' });
        setOpen(false);
        router.refresh();
      } else {
        alert('Failed to create farm. Please try again.');
      }
    } catch (error) {
      console.error('Error creating farm:', error);
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
            Add New Farm
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Farm</DialogTitle>
          <DialogDescription>
            Enter the details for the new farm location.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Farm Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Nakaseke Main Farm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Farm Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Nakaseke District, Central Uganda"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acreage">Total Acreage</Label>
            <Input
              id="acreage"
              type="number"
              step="0.01"
              value={formData.total_acreage}
              onChange={(e) => setFormData({ ...formData, total_acreage: e.target.value })}
              placeholder="e.g., 50.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the farm..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Farm'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
