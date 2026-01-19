'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CropLifecycleManager } from '@/components/farm/crop-lifecycle-manager';
import { Plus } from 'lucide-react';

export default function FarmsPage() {
  const [selectedFarm, setSelectedFarm] = useState('nakaseke-main');

  const farms = [
    { id: 'nakaseke-main', name: 'Nakaseke Main Farm', location: 'Nakaseke' },
    { id: 'nakaseke-2', name: 'Nakaseke Farm 2', location: 'Nakaseke' },
    { id: 'bukeelere', name: 'Bukeelere Farm', location: 'Bukeelere' },
  ];

  const cropsOnFarm = [
    {
      id: '1',
      name: 'Lemon Grass',
      type: 'crop' as const,
      stages: ['farming', 'processing', 'sale'] as const,
      status: 'active' as const,
    },
    {
      id: '2',
      name: 'Hass Avocado',
      type: 'crop' as const,
      stages: ['farming', 'sale'] as const,
      status: 'active' as const,
    },
    {
      id: '3',
      name: 'Chicken (Layers)',
      type: 'livestock' as const,
      stages: ['farming', 'sale'] as const,
      status: 'active' as const,
    },
    {
      id: '4',
      name: 'Catfish',
      type: 'livestock' as const,
      stages: ['farming', 'processing', 'sale'] as const,
      status: 'active' as const,
    },
    {
      id: '5',
      name: 'Coffee',
      type: 'crop' as const,
      stages: ['farming', 'processing', 'sale'] as const,
      status: 'active' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Farm Operations</h1>
        <p className="text-gray-600 mt-1">Track crops, livestock, and farm activities across all stages</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {farms.map((farm) => (
          <Button
            key={farm.id}
            variant={selectedFarm === farm.id ? 'default' : 'outline'}
            onClick={() => setSelectedFarm(farm.id)}
            className={selectedFarm === farm.id ? 'bg-emerald-600' : ''}
          >
            {farm.name}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Crops & Livestock</h2>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Add to Farm
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {cropsOnFarm.map((crop) => (
            <CropLifecycleManager
              key={crop.id}
              cropName={crop.name}
              cropType={crop.type}
              activeStages={crop.stages}
              status={crop.status}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Farm Activities</CardTitle>
          <CardDescription>Latest operations and updates from all stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Lemon Grass - Planting</p>
                <p className="text-xs text-gray-600">Farming Stage · Recorded by John Muteba</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Hass Avocado - Harvesting</p>
                <p className="text-xs text-gray-600">Farming Stage · Recorded by Sarah Adeyemi</p>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">In Progress</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
