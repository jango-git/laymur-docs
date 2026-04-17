const DB_NAME = "laymur";
const DB_VERSION = 1;
export const STORE_NAME = "project";

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (): void => {
      request.result.createObjectStore(STORE_NAME);
    };

    request.onsuccess = (): void => resolve(request.result);
    request.onerror = (): void => reject(request.error);
  });
}
