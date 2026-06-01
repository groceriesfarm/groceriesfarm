/**
 * Image Storage Service
 * 
 * Stores base64 images in IndexedDB (client-side) instead of Firestore.
 * This keeps Firestore documents lean while preserving base64 images locally.
 * 
 * Why IndexedDB?
 * - Can store large blobs (MBs) without size limits
 * - Persists across browser sessions
 * - Faster than localStorage for large data
 * - Doesn't block the main thread
 */

const DB_NAME = 'GroceriesFarmDB';
const STORE_NAME = 'images';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB connection
 */
export const initImageDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Save a base64 image to IndexedDB
 * @param imageId - Unique identifier for the image
 * @param base64Data - The base64 image string (e.g., "data:image/jpeg;base64,...")
 */
export const saveBase64Image = async (
  imageId: string,
  base64Data: string
): Promise<void> => {
  const database = await initImageDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      id: imageId,
      data: base64Data,
      savedAt: new Date().toISOString(),
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/**
 * Retrieve a base64 image from IndexedDB
 * @param imageId - The image identifier
 * @returns The base64 string or null if not found
 */
export const getBase64Image = async (imageId: string): Promise<string | null> => {
  const database = await initImageDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(imageId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.data : null);
    };
  });
};

/**
 * Delete a base64 image from IndexedDB
 * @param imageId - The image identifier
 */
export const deleteBase64Image = async (imageId: string): Promise<void> => {
  const database = await initImageDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(imageId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/**
 * Get all stored image IDs
 */
export const getAllImageIds = async (): Promise<string[]> => {
  const database = await initImageDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve((request.result as string[]) || []);
    };
  });
};

/**
 * Clear all images from IndexedDB
 */
export const clearAllImages = async (): Promise<void> => {
  const database = await initImageDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/**
 * Generate a unique image ID
 * Format: "img_<timestamp>_<random>"
 */
export const generateImageId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `img_${timestamp}_${random}`;
};

/**
 * Check if a string is a base64 image
 */
export const isBase64Image = (str: string): boolean => {
  return typeof str === 'string' && str.startsWith('data:image/');
};
