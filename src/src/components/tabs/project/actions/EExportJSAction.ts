import { consoleDebug } from "../../../../miscellaneous/debug.print";
import { exportActiveLayer } from "./export-layer";

export class EExportJSAction {
  public execute(): void {
    consoleDebug("[EExportJSAction] execute");
    exportActiveLayer(false);
  }
}
