import { STORE } from "../document/store";
import type { EDocument } from "../document/types";
import { UI_STATE } from "../ui-state/ui-state";
import { createDefaultLayerContext } from "./create-default-layer-context";
import { openDatabase, STORE_NAME } from "./open-database";

const DOCUMENT_KEY = "document";

export class EDocumentAutoload {
  public static async load(): Promise<void> {
    try {
      const db = await openDatabase();
      const editorDocument = await new Promise<EDocument | undefined>((resolve, reject) => {
        const request = db
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
      UI_STATE.setActiveLayer(defaultLayer.layer.uuid);
    }
  }
}
