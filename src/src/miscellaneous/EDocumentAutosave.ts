import { STORE } from "../document/store";
import { consoleDebug } from "./debug.print";
import { openDatabase, STORE_NAME } from "./open-database";

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

    consoleDebug("[EDocumentAutosave] initialized");
  }

  private readonly onAnyChange = (): void => {
    void this.save();
  };

  private async save(): Promise<void> {
    try {
      const database = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const request = database
          .transaction(STORE_NAME, "readwrite")
          .objectStore(STORE_NAME)
          .put(STORE.selectors.all(), "document");
        request.onsuccess = (): void => resolve();
        request.onerror = (): void => reject(request.error);
      });
    } catch {
      console.error("[EDocumentAutosave] failed to save project to IndexedDB");
    }
  }
}
