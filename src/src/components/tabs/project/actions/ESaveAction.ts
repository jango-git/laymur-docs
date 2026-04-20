import { STORE } from "../../../../document/store";
import { consoleDebug } from "../../../../miscellaneous/debug.print";

export class ESaveAction {
  public execute(): void {
    consoleDebug("[ESaveAction] execute");
    const document = STORE.selectors.all();
    const json = JSON.stringify(document, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = "project.json";
    window.document.body.appendChild(anchor);
    anchor.click();
    window.document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}
