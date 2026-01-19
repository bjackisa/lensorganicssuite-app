'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { syncManager, SyncStatus } from '@/lib/sync-manager';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SyncStatusIndicator() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
  });
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  useEffect(() => {
    // Initialize sync manager
    syncManager.init();

    // Subscribe to status changes
    const unsubscribe = syncManager.addListener((newStatus) => {
      setStatus(newStatus);
    });

    // Update pending count periodically
    const updatePendingCount = async () => {
      try {
        const count = await syncManager.getPendingCount();
        setStatus(prev => ({ ...prev, pendingCount: count }));
      } catch (error) {
        console.error('Failed to get pending count:', error);
      }
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!status.isOnline || status.isSyncing) return;

    const result = await syncManager.syncPendingChanges();
    setLastSyncResult(result.message);
    setTimeout(() => setLastSyncResult(null), 3000);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Online/Offline Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              status.isOnline 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {status.isOnline ? (
                <Cloud className="h-3 w-3" />
              ) : (
                <CloudOff className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">
                {status.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {status.isOnline 
              ? 'Connected to server' 
              : 'Working offline - changes will sync when online'}
          </TooltipContent>
        </Tooltip>

        {/* Pending Changes */}
        {status.pendingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertCircle className="h-3 w-3" />
                <span>{status.pendingCount}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {status.pendingCount} pending change{status.pendingCount !== 1 ? 's' : ''} to sync
            </TooltipContent>
          </Tooltip>
        )}

        {/* Sync Button */}
        {status.isOnline && status.pendingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualSync}
                disabled={status.isSyncing}
                className="h-7 w-7 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${status.isSyncing ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {status.isSyncing ? 'Syncing...' : 'Sync now'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Sync Result */}
        {lastSyncResult && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Check className="h-3 w-3" />
            <span className="hidden sm:inline">{lastSyncResult}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// Offline banner component
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
      <CloudOff className="inline-block h-4 w-4 mr-2" />
      You are currently offline. Changes will be saved locally and synced when you reconnect.
    </div>
  );
}
