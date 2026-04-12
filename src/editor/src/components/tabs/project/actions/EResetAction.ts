import { STORE } from "../../../../document/store";
import { createDefaultLayerContext } from "../../../../miscellaneous/create-default-layer-context";
import { UI_STATE } from "../../../../ui-state/ui-state";

export class EResetAction {
  public execute(): void {
    const defaultLayer = createDefaultLayerContext();
    STORE.commands.setup({
      assets: [],
      layerContexts: [defaultLayer],
    });
    UI_STATE.setActiveLayer(defaultLayer.layer.uuid);
  }
}
