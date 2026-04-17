import { STORE } from "../document/store";
import type { EDocument } from "../document/types";
import { consoleDebug, consoleError } from "./debug.print";
import { openDatabase, STORE_NAME } from "./open-database";

const DOCUMENT_KEY = "document";

export class EDocumentAutoload {
  public static async load(): Promise<void> {
    try {
      consoleDebug("[EDocumentAutoload] loading project from IndexedDB...");
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
        consoleDebug("[EDocumentAutoload] loaded project from IndexedDB", editorDocument);
        STORE.commands.setup(editorDocument);
      } else {
        consoleDebug("[EDocumentAutoload] no project found in IndexedDB");
      }
    } catch {
      consoleError("[EDocumentAutoload] failed to load project from IndexedDB");
    }
  }
}
