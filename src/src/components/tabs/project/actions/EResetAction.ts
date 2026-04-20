import { consoleDebug } from "../../../../miscellaneous/debug.print";
import { STORE } from "../../../../document/store";

export class EResetAction {
  public execute(): void {
    consoleDebug("[EResetAction] execute");
    STORE.commands.setup({ assets: [], layerContexts: [] });
  }
}
