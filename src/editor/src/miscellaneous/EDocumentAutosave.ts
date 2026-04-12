import { STORE } from "../document/store";
import { openDatabase, STORE_NAME } from "./open-database";

const DOCUMENT_KEY = "document";

export class EDocumentAutosave {
  constructor() {
    STORE.signals.setup.on(this.onAnyChange);
    STORE.signals.assets.list.on(this.onAnyChange);
    STORE.signals.assets.item.on(this.onAnyChange);
    STORE.signals.layers.list.on(this.onAnyChange);
    STORE.signals.layers.item.on(this.onAnyChange);
    STORE.signals.elements.list.on(this.onAnyChange);
    STORE.signals.elements.item.on(this.onAnyChange);
    STORE.signals.constraints.list.on(this.onAnyChange);
    STORE.signals.constraints.item.on(this.onAnyChange);
  }

  private readonly onAnyChange = (): void => {
    void this.save();
  };

  private async save(): Promise<void> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const request = db
          .transaction(STORE_NAME, "readwrite")
          .objectStore(STORE_NAME)
          .put(STORE.selectors.all(), DOCUMENT_KEY);
        request.onsuccess = (): void => resolve();
        request.onerror = (): void => reject(request.error);
      });
    } catch {
      console.error("[EDocumentAutosave] failed to save project to IndexedDB");
    }
  }
}
