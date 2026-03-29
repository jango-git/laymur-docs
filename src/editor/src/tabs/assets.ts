/**
 * assets.ts
 *
 * Asset management: IndexedDB persistence, Assets tab UI.
 */

import { ELEMENT_REGISTRY } from "../registry/element-registry";
import type { EditorState } from "../state";
import type { EUITextureCardCallbackPack } from "../ui/EUITextureCard/EUITextureCard";
import { EUITextureCard } from "../ui/EUITextureCard/EUITextureCard";

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

const DB_NAME = "laymur-assets";
const DB_VERSION = 1;
const STORE_NAME = "textures";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function databasePut(record: { id: string; name: string; blob: Blob }): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const request = transaction.objectStore(STORE_NAME).put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function databaseGetAll(): Promise<{ id: string; name: string; blob: Blob }[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function databaseDelete(id: string): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const request = transaction.objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ─── Blob helpers ─────────────────────────────────────────────────────────────

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// ─── State helpers (module-level, no editorState import) ──────────────────────

async function registerAsset(
  editorState: EditorState,
  id: string,
  name: string,
  blob: Blob,
): Promise<void> {
  if (editorState.assets[id]?.url) {
    URL.revokeObjectURL(editorState.assets[id].url);
  }
  const url = URL.createObjectURL(blob);
  const dataURL = await blobToDataURL(blob);
  editorState.assets[id] = { name, url, dataURL };
}

function unregisterAsset(editorState: EditorState, id: string): void {
  if (editorState.assets[id]?.url) {
    URL.revokeObjectURL(editorState.assets[id].url);
  }
  delete editorState.assets[id];
}

// ─── Standalone exports (used by ExportTab and main.ts) ───────────────────────

export async function addAssetFromDataURL(
  editorState: EditorState,
  id: string,
  name: string,
  dataURL: string,
): Promise<void> {
  try {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    await databasePut({ id, name, blob });
    await registerAsset(editorState, id, name, blob);
  } catch (error) {
    console.warn(`[assets] Failed to add asset "${id}" from dataURL:`, error);
  }
}

export async function loadAssetsIntoState(editorState: EditorState): Promise<void> {
  try {
    const records = await databaseGetAll();
    for (const { id, name, blob } of records) {
      await registerAsset(editorState, id, name, blob);
    }
  } catch (error) {
    console.warn("[assets] Failed to load from IndexedDB:", error);
  }
}

// ─── AssetsTab class ──────────────────────────────────────────────────────────

export class AssetsTab {
  private readonly editorState: EditorState;
  private readonly onAssetsChange: () => void;
  private readonly assetsTabGrid: HTMLElement | null = null;
  private activeTextureCards: EUITextureCard[] = [];

  constructor(editorState: EditorState, callbacks: { onAssetsChange?: () => void } = {}) {
    this.editorState = editorState;
    this.onAssetsChange = callbacks.onAssetsChange ?? (() => {});

    this.assetsTabGrid = document.getElementById("assets-grid");

    document.getElementById("button-add-asset")!.addEventListener("click", () => {
      document.getElementById("input-asset-file")!.click();
    });

    document.getElementById("input-asset-file")!.addEventListener("change", async (event) => {
      const files = Array.from((event.target as HTMLInputElement).files!);
      (event.target as HTMLInputElement).value = "";
      for (const file of files) {
        await this._addAssetFromFile(file, undefined);
      }
      this.render();
      this.onAssetsChange();
    });
  }

  // ─── Public ─────────────────────────────────────────────────────────────

  public render(): void {
    for (const card of this.activeTextureCards) {
      card.destroy();
    }
    this.activeTextureCards = [];

    if (!this.assetsTabGrid) {
      return;
    }
    this.assetsTabGrid.innerHTML = "";

    const entries = Object.entries(this.editorState.assets);

    if (entries.length === 0) {
      const placeholder = document.createElement("p");
      placeholder.className = "placeholder-text";
      placeholder.textContent = "No assets. Click + Add Texture to import images.";
      this.assetsTabGrid.appendChild(placeholder);
      return;
    }

    const callbacks: EUITextureCardCallbackPack = {
      onAssetReplace: async (id, file) => {
        await this._addAssetFromFile(file, id);
        this.render();
        this.onAssetsChange();
      },
      onAssetDelete: async (id) => {
        await databaseDelete(id);
        unregisterAsset(this.editorState, id);
        this.render();
        this.onAssetsChange();
      },
      isAssetUsed: (id) => this._isAssetUsed(id),
    };

    for (const [id, meta] of entries) {
      const card = new EUITextureCard(this.assetsTabGrid, id, callbacks, meta);
      this.activeTextureCards.push(card);
    }
  }

  // ─── Private ────────────────────────────────────────────────────────────

  private _isAssetUsed(assetId: string): boolean {
    for (const layer of this.editorState.layers) {
      for (const el of layer.elements) {
        const descriptor = ELEMENT_REGISTRY.get(el.type);
        if (!descriptor) {
          continue;
        }
        for (const field of descriptor.fields) {
          if (field.fieldType === "asset" && el.fieldValues[field.key] === assetId) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private async _addAssetFromFile(file: File, overrideId: string | undefined): Promise<void> {
    const defaultId = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const assetId = overrideId ?? defaultId;
    try {
      await databasePut({ id: assetId, name: file.name, blob: file });
      await registerAsset(this.editorState, assetId, file.name, file);
    } catch (error) {
      console.warn(`[assets] Failed to add asset "${assetId}":`, error);
    }
  }
}
