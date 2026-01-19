// IndexedDB management for offline-first functionality
const DB_NAME = 'LensOrganicsDB';
const DB_VERSION = 1;

interface StoredData {
  id: string;
  timestamp: number;
  data: any;
  synced: boolean;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for different data types
        const stores = ['farm-activities', 'farm-data', 'employee-data', 'equipment-data', 'financial-data', 'processing-data', 'sync-queue'];

        stores.forEach((store) => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        });
      };
    });
  }

  async saveData(storeName: string, data: any) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const record: StoredData = {
        id: data.id || `${Date.now()}`,
        timestamp: Date.now(),
        data,
        synced: false,
      };

      const request = store.put(record);
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  }

  async getData(storeName: string, id: string) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllData(storeName: string) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteData(storeName: string, id: string) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(null);
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue() {
    return this.getAllData('sync-queue');
  }

  async addToSyncQueue(action: string, data: any) {
    return this.saveData('sync-queue', {
      id: `${action}-${Date.now()}`,
      action,
      data,
    });
  }

  async clearSyncQueue() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync-queue'], 'readwrite');
      const store = transaction.objectStore('sync-queue');
      const request = store.clear();

      request.onsuccess = () => resolve(null);
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();
