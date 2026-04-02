import type { EditorState } from "../state";
import type { AssetMeta } from "../types";

const ASSETS_DATABASE_NAME = "laymur-assets";
const ASSETS_DATABASE_VERSION = 1;
const ASSETS_STORE_NAME = "textures";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ASSETS_DATABASE_NAME, ASSETS_DATABASE_VERSION);
    request.onupgradeneeded = (event): void => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(ASSETS_STORE_NAME)) {
        database.createObjectStore(ASSETS_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = (): void => resolve(request.result);
    request.onerror = (): void => reject(request.error);
  });
}

export async function databasePut(record: { id: string; name: string; blob: Blob; assetType?: "image" | "font" }): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ASSETS_STORE_NAME, "readwrite");
    const request = transaction.objectStore(ASSETS_STORE_NAME).put(record);
    request.onsuccess = (): void => resolve();
    request.onerror = (): void => reject(request.error);
  });
}

async function databaseGetAll(): Promise<{ id: string; name: string; blob: Blob }[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ASSETS_STORE_NAME, "readonly");
    const request = transaction.objectStore(ASSETS_STORE_NAME).getAll();
    request.onsuccess = (): void => resolve(request.result);
    request.onerror = (): void => reject(request.error);
  });
}

export async function databaseDelete(id: string): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ASSETS_STORE_NAME, "readwrite");
    const request = transaction.objectStore(ASSETS_STORE_NAME).delete(id);
    request.onsuccess = (): void => resolve();
    request.onerror = (): void => reject(request.error);
  });
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (): void => resolve(reader.result as string);
    reader.onerror = (): void => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function registerAsset(
  editorState: EditorState,
  id: string,
  name: string,
  blob: Blob,
): Promise<void> {
  const existingAsset = editorState.assets[id] as AssetMeta | undefined;
  if (existingAsset !== undefined) {
    URL.revokeObjectURL(existingAsset.url);
  }
  const url = URL.createObjectURL(blob);
  const dataURL = await blobToDataURL(blob);
  console.debug("[assets] registerAsset id=%s name=%s", id, name);
  editorState.assets[id] = { assetType: "image", name, url, dataURL };
}

export async function registerFontAsset(
  editorState: EditorState,
  id: string,
  name: string,
  fontFamily: string,
  blob: Blob,
): Promise<void> {
  const existingAsset = editorState.assets[id] as AssetMeta | undefined;
  if (existingAsset !== undefined) {
    URL.revokeObjectURL(existingAsset.url);
  }
  const url = URL.createObjectURL(blob);
  const dataURL = await blobToDataURL(blob);
  const face = new FontFace(fontFamily, `url(${dataURL})`);
  await face.load();
  document.fonts.add(face);
  console.debug("[assets] registerFontAsset id=%s fontFamily=%s", id, fontFamily);
  editorState.assets[id] = { assetType: "font", name, url, dataURL, fontFamily };
}

export function unregisterAsset(editorState: EditorState, id: string): void {
  const existingAsset = editorState.assets[id] as AssetMeta | undefined;
  if (existingAsset !== undefined) {
    URL.revokeObjectURL(existingAsset.url);
  }
  console.debug("[assets] unregisterAsset id=%s", id);
  delete editorState.assets[id];
}

export async function addAssetFromDataURL(
  editorState: EditorState,
  id: string,
  name: string,
  dataURL: string,
  assetType?: "image" | "font",
  fontFamily?: string,
): Promise<void> {
  console.debug("[assets] addAssetFromDataURL id=%s name=%s", id, name);
  try {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    if (assetType === "font" && fontFamily !== undefined) {
      await databasePut({ id, name, blob, assetType: "font" });
      await registerFontAsset(editorState, id, name, fontFamily, blob);
    } else {
      await databasePut({ id, name, blob, assetType: "image" });
      await registerAsset(editorState, id, name, blob);
    }
  } catch (error) {
    console.warn(`[assets] addAssetFromDataURL failed for "${id}":`, error);
  }
}

export async function loadAssetsIntoState(editorState: EditorState): Promise<void> {
  console.debug("[assets] loadAssetsIntoState: reading IndexedDB");
  try {
    const records = await databaseGetAll();
    console.debug("[assets] loadAssetsIntoState: found %d record(s)", records.length);
    for (const record of records) {
      const assetType = (record as { assetType?: string }).assetType ?? "image";
      if (assetType === "font") {
        const fontFamily = record.name.replace(/\.[^.]+$/, "");
        await registerFontAsset(editorState, record.id, record.name, fontFamily, record.blob);
      } else {
        await registerAsset(editorState, record.id, record.name, record.blob);
      }
    }
  } catch (error) {
    console.warn("[assets] loadAssetsIntoState: failed to load from IndexedDB:", error);
  }
}
