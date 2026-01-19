'use client';

import React from "react"

import { useState } from 'react';
import { useTransition } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createFarmActivity } from '@/app/actions/farm-activities';
import { Loader2 } from 'lucide-react';

interface LogActivityDialogProps {
  cropId: string;
  farmId: string;
  stage: 'farming' | 'processing' | 'sale';
  userId: string;
  trigger?: React.ReactNode;
}

const activityTypesByStage = {
  farming: [
    'Seed preparation',
    'Land preparation',
    'Planting',
    'Watering',
    'Weeding',
    'Fertilizing',
    'Pest control',
    'Disease management',
  ],
  processing: [
    'Harvesting',
    'Initial processing',
    'Quality check',
    'Packaging',
    'Storage',
    'Transport preparation',
  ],
  sale: [
    'Client order received',
    'Quality check',
    'Packaging',
    'Delivery',
    'Payment received',
    'Sales record',
  ],
};

export function LogActivityDialog({
  cropId,
  farmId,
  stage,
  userId,
  trigger,
}: LogActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    activityType: '',
    description: '',
    quantity: '',
    unit: 'kg',
  });

  const handleSubmit = () => {
    if (!formData.activityType || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    startTransition(async () => {
      const result = await createFarmActivity(
        cropId,
        farmId,
        stage,
        formData.activityType,
        formData.description,
        formData.quantity ? Number(formData.quantity) : undefined,
        formData.unit,
        userId
      );

      if (result.error) {
        alert('Error logging activity: ' + result.error);
      } else {
        setOpen(false);
        setFormData({ activityType: '', description: '', quantity: '', unit: 'kg' });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-emerald-600 hover:bg-emerald-700">Log Activity</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log {stage.charAt(0).toUpperCase() + stage.slice(1)} Activity</DialogTitle>
          <DialogDescription>Record an activity for this crop in this stage</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Activity Type *</label>
            <Select
              value={formData.activityType}
              onValueChange={(value) => setFormData({ ...formData, activityType: value })}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                {activityTypesByStage[stage].map((activity) => (
                  <SelectItem key={activity} value={activity}>
                    {activity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              placeholder="Describe the activity in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isPending}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Quantity (optional)</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                disabled={isPending}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Unit (optional)</label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="bags">Bags</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full bg-emerald-600" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Logging...' : 'Log Activity'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
