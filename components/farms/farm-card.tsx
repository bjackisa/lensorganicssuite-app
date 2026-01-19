'use client';

import { MapPin, Users, Tractor, Leaf, Fish, Egg } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface FarmCardProps {
  farm: {
    id: string;
    name: string;
    code: string;
    location?: string;
    status: string;
    total_acreage?: number;
    description?: string;
  };
  stats?: {
    activeProductions?: number;
    employeeCount?: number;
    equipmentCount?: number;
    pendingActivities?: number;
  };
}

export function FarmCard({ farm, stats }: FarmCardProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    discontinued: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Link href={`/dashboard/farms/${farm.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{farm.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{farm.code}</p>
            </div>
            <Badge className={statusColors[farm.status] || statusColors.inactive}>
              {farm.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {farm.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span>{farm.location}</span>
            </div>
          )}

          {farm.total_acreage && (
            <p className="text-sm text-muted-foreground mb-3">
              {farm.total_acreage} acres
            </p>
          )}

          {stats && (
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{stats.activeProductions || 0}</p>
                  <p className="text-xs text-muted-foreground">Productions</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{stats.employeeCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Employees</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Tractor className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{stats.equipmentCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Equipment</p>
                </div>
              </div>

              {stats.pendingActivities !== undefined && stats.pendingActivities > 0 && (
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <span className="text-yellow-600 dark:text-yellow-400 text-sm font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{stats.pendingActivities}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Production type icons
export function ProductionTypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'crop':
      return <Leaf className={className} />;
    case 'livestock':
      return <Egg className={className} />;
    case 'fish':
      return <Fish className={className} />;
    default:
      return <Leaf className={className} />;
  }
}
