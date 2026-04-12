import { STORE } from "../../../../document/store";
import type { EDocument } from "../../../../document/types";

export class ELoadAction {
  public execute(): void {
    const fileInput = window.document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";

    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        try {
          const editorDocument = JSON.parse(reader.result as string) as EDocument;
          STORE.commands.setup(editorDocument);
        } catch {
          console.error("[ELoadAction] failed to parse project file");
        }
      });
      reader.readAsText(file);
    });

    fileInput.click();
  }
}
