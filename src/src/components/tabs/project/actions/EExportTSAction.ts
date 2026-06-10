import { consoleDebug } from "../../../../miscellaneous/debug.print";
import { exportActiveLayer } from "./export-layer";

export class EExportTSAction {
  public execute(): void {
    consoleDebug("[EExportTSAction] execute");
    exportActiveLayer(true);
  }
}
