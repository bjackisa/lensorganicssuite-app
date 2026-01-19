'use client';

import { createClient } from '@supabase/supabase-js';

const DB_NAME = 'LensOrganicsDB';
const DB_VERSION = 2;

// Sync queue item interface
interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'conflict';
  errorMessage?: string;
}

// Cached data interface
interface CachedData {
  id: string;
  table: string;
  data: unknown;
  timestamp: number;
  version: number;
}

class SyncManager {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncInProgress: boolean = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  // Initialize IndexedDB
  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('table', 'table', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Cached data stores for each table
        const tables = [
          'farms', 'farm_zones', 'production_items', 'planting_batches',
          'farm_activities', 'harvest_records', 'growth_records',
          'livestock_batches', 'egg_production_records', 'feed_records',
          'fish_ponds', 'fish_stocking_records', 'water_quality_records',
          'employees', 'equipment', 'invoices', 'expenses', 'customers'
        ];

        tables.forEach(table => {
          if (!db.objectStoreNames.contains(table)) {
            const store = db.createObjectStore(table, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        });

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  // Handle coming online
  private async handleOnline() {
    this.isOnline = true;
    this.notifyListeners();
    await this.syncPendingChanges();
  }

  // Handle going offline
  private handleOffline() {
    this.isOnline = false;
    this.notifyListeners();
  }

  // Add listener for sync status changes
  addListener(callback: (status: SyncStatus) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  private notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach(callback => callback(status));
  }

  // Get current sync status
  getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.syncInProgress,
      pendingCount: 0, // Will be updated async
    };
  }

  // Queue an operation for sync
  async queueOperation(
    operation: 'create' | 'update' | 'delete',
    table: string,
    data: Record<string, unknown>
  ): Promise<void> {
    await this.init();

    const item: SyncQueueItem = {
      id: `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operation,
      table,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.add(item);

      request.onsuccess = () => {
        this.notifyListeners();
        // Try to sync immediately if online
        if (this.isOnline) {
          this.syncPendingChanges();
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Cache data locally
  async cacheData(table: string, data: unknown[]): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);

      // Clear existing data
      store.clear();

      // Add new data
      (data as Array<{ id: string }>).forEach(item => {
        store.put({
          ...item,
          timestamp: Date.now(),
          version: 1,
        });
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get cached data
  async getCachedData<T>(table: string): Promise<T[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([table], 'readonly');
      const store = transaction.objectStore(table);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  // Get single cached item
  async getCachedItem<T>(table: string, id: string): Promise<T | null> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([table], 'readonly');
      const store = transaction.objectStore(table);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result as T | null);
      request.onerror = () => reject(request.error);
    });
  }

  // Save single item to cache
  async saveToCacheItem(table: string, data: Record<string, unknown>): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      const request = store.put({
        ...data,
        timestamp: Date.now(),
        version: 1,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get pending sync count
  async getPendingCount(): Promise<number> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const index = store.index('status');
      const request = index.count(IDBKeyRange.only('pending'));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all pending items
  async getPendingItems(): Promise<SyncQueueItem[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const index = store.index('status');
      const request = index.getAll(IDBKeyRange.only('pending'));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync pending changes to server
  async syncPendingChanges(): Promise<SyncResult> {
    if (this.syncInProgress || !this.isOnline) {
      return { success: false, synced: 0, failed: 0, message: 'Sync not available' };
    }

    this.syncInProgress = true;
    this.notifyListeners();

    try {
      const pendingItems = await this.getPendingItems();
      let synced = 0;
      let failed = 0;

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await this.removeFromQueue(item.id);
          synced++;
        } catch (error) {
          failed++;
          await this.markItemFailed(item.id, (error as Error).message);
        }
      }

      this.syncInProgress = false;
      this.notifyListeners();

      return { success: true, synced, failed, message: `Synced ${synced} items` };
    } catch (error) {
      this.syncInProgress = false;
      this.notifyListeners();
      return { success: false, synced: 0, failed: 0, message: (error as Error).message };
    }
  }

  // Sync a single item
  private async syncItem(item: SyncQueueItem): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (item.operation) {
      case 'create':
        const { error: createError } = await supabase
          .from(item.table)
          .insert(item.data);
        if (createError) throw createError;
        break;

      case 'update':
        const { error: updateError } = await supabase
          .from(item.table)
          .update(item.data)
          .eq('id', item.data.id);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(item.table)
          .delete()
          .eq('id', item.data.id);
        if (deleteError) throw deleteError;
        break;
    }
  }

  // Remove item from sync queue
  private async removeFromQueue(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Mark item as failed
  private async markItemFailed(id: string, errorMessage: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result as SyncQueueItem;
        item.status = 'failed';
        item.errorMessage = errorMessage;
        item.retryCount++;

        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Clear all cached data
  async clearCache(): Promise<void> {
    await this.init();

    const tables = [
      'farms', 'farm_zones', 'production_items', 'planting_batches',
      'farm_activities', 'harvest_records', 'growth_records',
      'livestock_batches', 'egg_production_records', 'feed_records',
      'fish_ponds', 'fish_stocking_records', 'water_quality_records',
      'employees', 'equipment', 'invoices', 'expenses', 'customers'
    ];

    for (const table of tables) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([table], 'readwrite');
        const store = transaction.objectStore(table);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  // Set last sync timestamp
  async setLastSync(table: string): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({
        key: `lastSync_${table}`,
        value: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get last sync timestamp
  async getLastSync(table: string): Promise<number | null> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get(`lastSync_${table}`);

      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Types
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  message: string;
}

// Singleton instance
export const syncManager = new SyncManager();
