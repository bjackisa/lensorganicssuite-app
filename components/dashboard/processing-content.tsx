'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Zap } from 'lucide-react';

const dummyPlants = [
  {
    id: '1',
    name: 'Lemongrass Oil Extractor',
    type: 'lemongrass_extraction',
    farm: 'Nakaseke Main',
    capacity: 500,
    capacityUnit: 'liters/day',
    location: 'Plant A - Building 1',
    utilization: 75,
    status: 'active',
    lastRun: '2024-01-25',
  },
  {
    id: '2',
    name: 'Coffee Processing Unit',
    type: 'coffee_processing',
    farm: 'Bukeelere Farm',
    capacity: 1000,
    capacityUnit: 'kg/day',
    location: 'Central Processing',
    utilization: 45,
    status: 'active',
    lastRun: '2024-01-24',
  },
  {
    id: '3',
    name: 'Catfish Processing Plant',
    type: 'catfish_processing',
    farm: 'Nakaseke Farm 2',
    capacity: 250,
    capacityUnit: 'kg/day',
    location: 'Processing Zone',
    utilization: 60,
    status: 'active',
    lastRun: '2024-01-23',
  },
];

const dummyRuns = [
  {
    id: '1',
    plant: 'Lemongrass Oil Extractor',
    crop: 'Lemon Grass',
    inputQty: 100,
    outputQty: 25,
    date: '2024-01-25',
    status: 'completed',
    efficiency: '25%',
  },
  {
    id: '2',
    plant: 'Coffee Processing Unit',
    crop: 'Coffee',
    inputQty: 500,
    outputQty: 450,
    date: '2024-01-24',
    status: 'completed',
    efficiency: '90%',
  },
  {
    id: '3',
    plant: 'Catfish Processing Plant',
    crop: 'Catfish',
    inputQty: 150,
    outputQty: 130,
    date: '2024-01-23',
    status: 'completed',
    efficiency: '86.7%',
  },
];

const ProcessingPageClient = () => {
  return (
    <div>
      {/* Processing page content goes here */}
    </div>
  );
};

export function ProcessingContent() {
  return <ProcessingPageClient />;
}
