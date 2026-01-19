'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface CropLifecycleManagerProps {
  cropName: string;
  cropType: 'crop' | 'livestock';
  activeStages: ('farming' | 'processing' | 'sale')[];
  status: 'active' | 'inactive' | 'discontinued';
}

export function CropLifecycleManager({
  cropName,
  cropType,
  activeStages,
  status,
}: CropLifecycleManagerProps) {
  const [selectedStage, setSelectedStage] = useState<'farming' | 'processing' | 'sale' | null>(
    activeStages[0] || null
  );

  const stages = [
    {
      id: 'farming',
      label: 'Farming',
      description: 'Planting, growth, and maintenance',
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 'processing',
      label: 'Processing',
      description: 'Value addition and transformation',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'sale',
      label: 'Sale',
      description: 'Distribution and sales',
      color: 'bg-amber-100 text-amber-800',
    },
  ] as const;

  const stageActivities = {
    farming: [
      { id: '1', name: 'Seed preparation', date: '2024-01-15', status: 'completed' },
      { id: '2', name: 'Land preparation', date: '2024-01-20', status: 'completed' },
      { id: '3', name: 'Planting', date: '2024-01-25', status: 'in_progress' },
      { id: '4', name: 'Weeding', date: '2024-02-05', status: 'pending' },
    ],
    processing: [
      { id: '1', name: 'Harvesting', date: '2024-04-01', status: 'pending' },
      { id: '2', name: 'Initial processing', date: '2024-04-05', status: 'pending' },
    ],
    sale: [
      { id: '1', name: 'Client orders received', date: '2024-04-10', status: 'pending' },
      { id: '2', name: 'Quality check', date: '2024-04-15', status: 'pending' },
    ],
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'pending':
        return <Circle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{cropName}</CardTitle>
            <CardDescription>
              {cropType === 'crop' ? 'Crop' : 'Livestock'} · {activeStages.join(' → ')}
            </CardDescription>
          </div>
          <Badge
            className={
              status === 'active'
                ? 'bg-green-100 text-green-800'
                : status === 'inactive'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
            }
          >
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">Lifecycle Stages</h3>
          <div className="flex gap-2 flex-wrap">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => {
                  if (activeStages.includes(stage.id)) {
                    setSelectedStage(stage.id);
                  }
                }}
                disabled={!activeStages.includes(stage.id)}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeStages.includes(stage.id)
                    ? selectedStage === stage.id
                      ? `${stage.color} ring-2 ring-offset-2 ring-current cursor-pointer`
                      : `${stage.color} cursor-pointer`
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>

        {selectedStage && activeStages.includes(selectedStage) && (
          <div className="border-t pt-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">
                {stages.find((s) => s.id === selectedStage)?.label} Activities
              </h3>
              <p className="text-xs text-gray-600">
                {stages.find((s) => s.id === selectedStage)?.description}
              </p>
            </div>

            <div className="space-y-3">
              {stageActivities[selectedStage].map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0">{getStatusIcon(activity.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                    <p className="text-xs text-gray-600">{activity.date}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      activity.status === 'completed'
                        ? 'bg-green-50 text-green-700 border-green-300'
                        : activity.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-gray-50 text-gray-700 border-gray-300'
                    }
                  >
                    {activity.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
              Log Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
