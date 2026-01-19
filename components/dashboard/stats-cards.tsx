'use client';

import { 
  MapPin, 
  Leaf, 
  Users, 
  Tractor, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  AlertTriangle,
  Egg,
  Fish
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: {
    activeFarms: number;
    activeCrops: number;
    totalEmployees: number;
    totalEquipment: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    pendingOrders: number;
    lowStockItems: number;
    eggProduction?: number;
    fishHarvest?: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const netProfit = stats.monthlyRevenue - stats.monthlyExpenses;
  const profitMargin = stats.monthlyRevenue > 0 
    ? ((netProfit / stats.monthlyRevenue) * 100).toFixed(1) 
    : '0';

  const cards = [
    {
      title: 'Active Farms',
      value: stats.activeFarms,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Active Productions',
      value: stats.activeCrops,
      icon: Leaf,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      title: 'Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Equipment',
      value: stats.totalEquipment,
      icon: Tractor,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={cn('p-2 rounded-full', card.bgColor)}>
                <card.icon className={cn('h-4 w-4', card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.monthlyRevenue.toLocaleString()} UGX
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Expenses
            </CardTitle>
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.monthlyExpenses.toLocaleString()} UGX
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            <div className={cn(
              'p-2 rounded-full',
              netProfit >= 0 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            )}>
              <DollarSign className={cn(
                'h-4 w-4',
                netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              )} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
              'text-2xl font-bold',
              netProfit >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {netProfit.toLocaleString()} UGX
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profitMargin}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Production Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Orders
            </CardTitle>
            <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <ShoppingCart className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting fulfillment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Items
            </CardTitle>
            <div className={cn(
              'p-2 rounded-full',
              stats.lowStockItems > 0 
                ? 'bg-red-100 dark:bg-red-900/30' 
                : 'bg-gray-100 dark:bg-gray-900/30'
            )}>
              <AlertTriangle className={cn(
                'h-4 w-4',
                stats.lowStockItems > 0 ? 'text-red-600' : 'text-gray-400'
              )} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
              'text-2xl font-bold',
              stats.lowStockItems > 0 ? 'text-red-600' : ''
            )}>
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Need reorder
            </p>
          </CardContent>
        </Card>

        {stats.eggProduction !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Egg Production
              </CardTitle>
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Egg className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.eggProduction.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                This week
              </p>
            </CardContent>
          </Card>
        )}

        {stats.fishHarvest !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fish Harvest
              </CardTitle>
              <div className="p-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30">
                <Fish className="h-4 w-4 text-cyan-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fishHarvest.toLocaleString()} kg</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Compact stat card for sidebar or mobile
export function StatCardCompact({ 
  title, 
  value, 
  icon: Icon, 
  color = 'text-primary',
  trend,
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  color?: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className={cn('p-2 rounded-full bg-background', color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{title}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
      {trend && (
        <div className={cn(
          'text-xs font-medium',
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          {trend.isPositive ? '+' : ''}{trend.value}%
        </div>
      )}
    </div>
  );
}
