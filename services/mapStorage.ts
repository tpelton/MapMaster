
const DB_NAME = 'MapTasker_Final_DB_v3';
const DB_VERSION = 2;

const STORES = {
  PROJECTS: 'projects',
  MAPS: 'maps',
  TEMPLATES: 'templates',
  SETTINGS: 'settings'
};

let dbInstance: IDBDatabase | null = null;

export const StorageService = {
  async openDB(): Promise<IDBDatabase> {
    if (dbInstance) return dbInstance;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
          db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.MAPS)) {
          db.createObjectStore(STORES.MAPS);
        }
        if (!db.objectStoreNames.contains(STORES.TEMPLATES)) {
          db.createObjectStore(STORES.TEMPLATES);
        }
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS);
        }
      };

      request.onsuccess = (event: any) => {
        dbInstance = event.target.result;
        dbInstance!.onclose = () => {
          console.warn("DB Connection closed unexpectedly. Resetting instance.");
          dbInstance = null;
        };
        resolve(dbInstance!);
      };

      request.onerror = (event: any) => {
        console.error("IndexedDB Open Error:", event.target.error);
        reject(event.target.error);
      };
    });
  },

  async performTransaction(
    storeName: string | string[],
    mode: 'readonly' | 'readwrite',
    callback: (store: any) => IDBRequest | void
  ): Promise<any> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, mode);

        transaction.oncomplete = () => resolve(true);
        transaction.onerror = (event: any) => {
          console.error(`Transaction Error [${storeName}]:`, event.target.error);
          reject(event.target.error);
        };

        // Simplified store retrieval to avoid syntax pitfalls
        let stores: any;
        if (Array.isArray(storeName)) {
          stores = {};
          for (const name of storeName) {
            stores[name] = transaction.objectStore(name);
          }
        } else {
          stores = transaction.objectStore(storeName);
        }

        const request = callback(stores);

        // Handle read request results
        if (mode === 'readonly' && request && 'onsuccess' in request) {
          request.onsuccess = () => resolve(request.result);
        }
      } catch (err) {
        console.error("Transaction Creation Failed", err);
        dbInstance = null;
        reject(err);
      }
    });
  },

  async saveProject(project: any): Promise<void> {
    return this.performTransaction(STORES.PROJECTS, 'readwrite', (store) => {
      store.put(project);
    });
  },

  async getAllProjects(): Promise<any[]> {
    return this.performTransaction(STORES.PROJECTS, 'readonly', (store) => {
      return store.getAll();
    }) || [];
  },

  async deleteProject(projectId: string): Promise<void> {
    return this.performTransaction([STORES.PROJECTS, STORES.MAPS], 'readwrite', (stores: any) => {
      stores[STORES.PROJECTS].delete(projectId);
      stores[STORES.MAPS].delete(projectId);
    });
  },

  async saveTemplates(templates: any[]): Promise<void> {
    const safeTemplates = JSON.parse(JSON.stringify(templates));
    return this.performTransaction(STORES.TEMPLATES, 'readwrite', (store) => {
      store.put(safeTemplates, 'active_templates');
    });
  },

  async getTemplates(): Promise<any[]> {
    const result = await this.performTransaction(STORES.TEMPLATES, 'readonly', (store) => {
      return store.get('active_templates');
    });
    return result || [];
  },

  async saveMap(projectId: string, dataUrl: string): Promise<void> {
    return this.performTransaction(STORES.MAPS, 'readwrite', (store) => {
      store.put(dataUrl, projectId);
    });
  },

  async getMap(projectId: string): Promise<string | null> {
    return this.performTransaction(STORES.MAPS, 'readonly', (store) => {
      return store.get(projectId);
    });
  },

  async saveSettings(settings: { slackApiToken: string; slackClientId?: string; slackClientSecret?: string }): Promise<void> {
    return this.performTransaction(STORES.SETTINGS, 'readwrite', (store) => {
      store.put(settings, 'global_settings');
    });
  },

  async getSettings(): Promise<{ slackApiToken: string; slackClientId?: string; slackClientSecret?: string } | null> {
    return this.performTransaction(STORES.SETTINGS, 'readonly', (store) => {
      return store.get('global_settings');
    });
  }
};

export const MapStorage = StorageService;
