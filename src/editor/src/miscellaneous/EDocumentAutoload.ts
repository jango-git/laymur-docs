import { STORE } from "../document/store";
import type { EDocument } from "../document/types";
import { UI_STATE } from "../ui-state/ui-state";
import { createDefaultLayerContext } from "./create-default-layer-context";
import { openDatabase, STORE_NAME } from "./open-database";

const DOCUMENT_KEY = "document";

export class EDocumentAutoload {
  public static async load(): Promise<void> {
    try {
      const database = await openDatabase();
      const editorDocument = await new Promise<EDocument | undefined>((resolve, reject) => {
        const request = database
          .transaction(STORE_NAME, "readonly")
          .objectStore(STORE_NAME)
          .get(DOCUMENT_KEY);
        request.onsuccess = (): void => resolve(request.result as EDocument | undefined);
        request.onerror = (): void => reject(request.error);
      });

      if (editorDocument !== undefined) {
        STORE.commands.setup(editorDocument);
      }
    } catch {
      console.error("[EDocumentAutoload] failed to load project from IndexedDB");
    }

    if (STORE.selectors.layers.selectAllContexts().length === 0) {
      const defaultLayer = createDefaultLayerContext();
      STORE.commands.layers.add(defaultLayer);
    }

    const layers = STORE.selectors.layers.selectAll();
    if (layers.length > 0) {
      UI_STATE.setActiveLayer(layers[0].uuid);
    }
  }
}
