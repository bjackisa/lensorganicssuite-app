'use client';

import { useState } from 'react';
import { Sprout, Factory, ShoppingCart, Check, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductionLifecycleProps {
  productionItem: {
    id: string;
    farm_stage_active: boolean;
    processing_stage_active: boolean;
    sale_stage_active: boolean;
    crop_type?: {
      name: string;
      type: string;
    };
  };
  onStageToggle?: (stage: 'farm' | 'processing' | 'sale', active: boolean) => Promise<void>;
  readonly?: boolean;
}

const stages = [
  {
    key: 'farm' as const,
    label: 'Farm Stage',
    description: 'Planting, growing, and harvesting',
    icon: Sprout,
    color: 'green',
  },
  {
    key: 'processing' as const,
    label: 'Processing Stage',
    description: 'Processing and value addition',
    icon: Factory,
    color: 'blue',
  },
  {
    key: 'sale' as const,
    label: 'Sale Stage',
    description: 'Marketing and sales',
    icon: ShoppingCart,
    color: 'purple',
  },
];

export function ProductionLifecycle({
  productionItem,
  onStageToggle,
  readonly = false,
}: ProductionLifecycleProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const getStageActive = (stage: 'farm' | 'processing' | 'sale') => {
    switch (stage) {
      case 'farm':
        return productionItem.farm_stage_active;
      case 'processing':
        return productionItem.processing_stage_active;
      case 'sale':
        return productionItem.sale_stage_active;
    }
  };

  const handleToggle = async (stage: 'farm' | 'processing' | 'sale') => {
    if (readonly || !onStageToggle) return;
    
    setLoading(stage);
    try {
      await onStageToggle(stage, !getStageActive(stage));
    } finally {
      setLoading(null);
    }
  };

  const colorClasses = {
    green: {
      active: 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700',
      icon: 'text-green-600 dark:text-green-400',
      iconInactive: 'text-gray-400',
    },
    blue: {
      active: 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      inactive: 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700',
      icon: 'text-blue-600 dark:text-blue-400',
      iconInactive: 'text-gray-400',
    },
    purple: {
      active: 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      inactive: 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700',
      icon: 'text-purple-600 dark:text-purple-400',
      iconInactive: 'text-gray-400',
    },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Production Lifecycle</CardTitle>
          {productionItem.crop_type && (
            <Badge variant="outline">{productionItem.crop_type.name}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          {stages.map((stage, index) => {
            const isActive = getStageActive(stage.key);
            const colors = colorClasses[stage.color as keyof typeof colorClasses];
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="flex items-center flex-1">
                <button
                  onClick={() => handleToggle(stage.key)}
                  disabled={readonly || loading === stage.key}
                  className={cn(
                    'flex-1 p-3 rounded-lg border-2 transition-all',
                    isActive ? colors.active : colors.inactive,
                    !readonly && 'hover:shadow-md cursor-pointer',
                    readonly && 'cursor-default'
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <Icon className={cn('h-6 w-6', isActive ? colors.icon : colors.iconInactive)} />
                      {isActive && (
                        <Check className="absolute -top-1 -right-1 h-3 w-3 text-white bg-green-500 rounded-full p-0.5" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{stage.label}</span>
                  </div>
                </button>
                
                {index < stages.length - 1 && (
                  <div className="w-8 flex items-center justify-center">
                    <div className={cn(
                      'h-0.5 w-full',
                      isActive && getStageActive(stages[index + 1].key)
                        ? 'bg-gray-400'
                        : 'bg-gray-200 dark:bg-gray-700'
                    )} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          {stages.map((stage) => (
            <p key={stage.key} className="text-center">
              {stage.description}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for lists
export function ProductionLifecycleCompact({
  farmActive,
  processingActive,
  saleActive,
}: {
  farmActive: boolean;
  processingActive: boolean;
  saleActive: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className={cn(
        'w-2 h-2 rounded-full',
        farmActive ? 'bg-green-500' : 'bg-gray-300'
      )} title="Farm Stage" />
      <div className={cn(
        'w-2 h-2 rounded-full',
        processingActive ? 'bg-blue-500' : 'bg-gray-300'
      )} title="Processing Stage" />
      <div className={cn(
        'w-2 h-2 rounded-full',
        saleActive ? 'bg-purple-500' : 'bg-gray-300'
      )} title="Sale Stage" />
    </div>
  );
}
