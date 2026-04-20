import { STORE } from "../../../../document/store";
import { consoleDebug } from "../../../../miscellaneous/debug.print";

export class EResetAction {
  public execute(): void {
    consoleDebug("[EResetAction] execute");
    STORE.commands.setup({ assets: [], layerContexts: [] });
  }
}
