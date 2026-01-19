'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const activityTypes = [
  { value: 'planting', label: 'Planting' },
  { value: 'watering', label: 'Watering/Irrigation' },
  { value: 'fertilizing', label: 'Fertilizing' },
  { value: 'weeding', label: 'Weeding' },
  { value: 'pruning', label: 'Pruning' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'disease_treatment', label: 'Disease Treatment' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'soil_preparation', label: 'Soil Preparation' },
  { value: 'irrigation_maintenance', label: 'Irrigation Maintenance' },
  { value: 'general_maintenance', label: 'General Maintenance' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
];

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
  zones?: Array<{ id: string; name: string }>;
  batches?: Array<{ id: string; batch_code: string }>;
  employees?: Array<{ id: string; full_name: string }>;
  onSubmit: (data: ActivityFormData) => Promise<void>;
}

interface ActivityFormData {
  activity_type: string;
  title: string;
  description?: string;
  scheduled_date?: string;
  priority: string;
  zone_id?: string;
  batch_id?: string;
  assigned_to?: string;
  cost?: number;
  notes?: string;
}

export function ActivityForm({
  open,
  onOpenChange,
  farmId,
  zones = [],
  batches = [],
  employees = [],
  onSubmit,
}: ActivityFormProps) {
  const [loading, setLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();

  const { register, handleSubmit, reset, setValue, watch } = useForm<ActivityFormData>({
    defaultValues: {
      priority: 'medium',
    },
  });

  const handleFormSubmit = async (data: ActivityFormData) => {
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        scheduled_date: scheduledDate?.toISOString().split('T')[0],
      });
      reset();
      setScheduledDate(undefined);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Farm Activity</DialogTitle>
          <DialogDescription>
            Create a new farm activity or task to be completed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity_type">Activity Type *</Label>
              <Select onValueChange={(value) => setValue('activity_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                defaultValue="medium"
                onValueChange={(value) => setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className={priority.color}>{priority.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Activity title"
              {...register('title', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the activity..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !scheduledDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {zones.length > 0 && (
              <div className="space-y-2">
                <Label>Zone</Label>
                <Select onValueChange={(value) => setValue('zone_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {batches.length > 0 && (
              <div className="space-y-2">
                <Label>Batch</Label>
                <Select onValueChange={(value) => setValue('batch_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.batch_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {employees.length > 0 && (
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select onValueChange={(value) => setValue('assigned_to', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Estimated Cost (UGX)</Label>
            <Input
              id="cost"
              type="number"
              placeholder="0"
              {...register('cost', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              rows={2}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
