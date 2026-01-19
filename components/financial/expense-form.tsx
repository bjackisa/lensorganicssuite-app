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

const expenseCategories = [
  { value: 'farm_inputs', label: 'Farm Inputs' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'transport', label: 'Transport' },
  { value: 'processing', label: 'Processing' },
  { value: 'livestock_feed', label: 'Livestock Feed' },
  { value: 'veterinary', label: 'Veterinary' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'repairs', label: 'Repairs & Maintenance' },
  { value: 'other', label: 'Other' },
];

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farms: Array<{ id: string; name: string }>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
}

interface ExpenseFormData {
  farm_id: string;
  expense_date: string;
  category: string;
  subcategory?: string;
  vendor_name?: string;
  description: string;
  amount: number;
  tax_amount?: number;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
}

export function ExpenseForm({
  open,
  onOpenChange,
  farms,
  onSubmit,
}: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [expenseDate, setExpenseDate] = useState<Date>(new Date());

  const { register, handleSubmit, reset, setValue, watch } = useForm<ExpenseFormData>({
    defaultValues: {
      payment_method: 'mobile_money',
    },
  });

  const amount = watch('amount') || 0;
  const taxAmount = watch('tax_amount') || 0;
  const totalAmount = Number(amount) + Number(taxAmount);

  const handleFormSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        expense_date: expenseDate.toISOString().split('T')[0],
      });
      reset();
      setExpenseDate(new Date());
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to log expense:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for tracking and reporting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farm_id">Farm *</Label>
              <Select onValueChange={(value) => setValue('farm_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select farm" />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !expenseDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expenseDate ? format(expenseDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expenseDate}
                    onSelect={(date) => date && setExpenseDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                placeholder="e.g., Fertilizer"
                {...register('subcategory')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor_name">Vendor/Supplier</Label>
            <Input
              id="vendor_name"
              placeholder="Vendor name"
              {...register('vendor_name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the expense..."
              rows={2}
              {...register('description', { required: true })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (UGX) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                {...register('amount', { required: true, valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_amount">Tax (UGX)</Label>
              <Input
                id="tax_amount"
                type="number"
                placeholder="0"
                {...register('tax_amount', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label>Total</Label>
              <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center font-medium">
                {totalAmount.toLocaleString()} UGX
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select 
                defaultValue="mobile_money"
                onValueChange={(value) => setValue('payment_method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                placeholder="Receipt/Transaction #"
                {...register('reference_number')}
              />
            </div>
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
              Log Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
