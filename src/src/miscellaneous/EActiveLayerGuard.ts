import { EStoreDeltaOperation } from "../document/signals";
import type { EStoreDeltaLayerList } from "../document/signals/layers";
import { STORE } from "../document/store";
import { ELayerType } from "../document/types.layers";
import { EResizePolicyType } from "../document/types.misc";
import { UI_STATE } from "../ui-state/EUIState";
import { consoleDebug } from "./debug.print";
import { generateLayerUUID } from "./generate-uuid";

export class EActiveLayerGuard {
  constructor() {
    STORE.signals.layers.list.on(this.onLayersListChanged);
    STORE.signals.setup.on(this.onSetup);
    UI_STATE.signalActiveLayerChanged.on(this.onActiveLayerChanged);
    consoleDebug("[EActiveLayerGuard] initialized");
    this.ensureActiveLayerExists();
  }

  private readonly onLayersListChanged = (delta: EStoreDeltaLayerList): void => {
    if (delta.operation === EStoreDeltaOperation.REMOVE) {
      this.ensureActiveLayerExists();
    }
  };

  private readonly onSetup = (): void => {
    this.ensureActiveLayerExists();
  };

  private readonly onActiveLayerChanged = (): void => {
    this.ensureActiveLayerExists();
  };

  private ensureActiveLayerExists(): void {
    if (STORE.selectors.layers.selectAllContexts().length === 0) {
      consoleDebug("[EActiveLayerGuard] no layers found, creating a default layer");
      STORE.commands.layers.add({
        layer: {
          uuid: generateLayerUUID(),
          type: ELayerType.FULLSCREEN,
          name: "Gameplay",
          resizePolicy: EResizePolicyType.FIXED_HEIGHT,
          resizePolicyParameters: [1080, 1920],
        },
        elements: [],
        constraints: [],
      });
    }

    const layerContexts = STORE.selectors.layers.selectAllContexts();
    if (layerContexts.length > 0 && UI_STATE.activeLayerUuid === undefined) {
      consoleDebug(
        "[EActiveLayerGuard] active layer is undefined, set to the first layer in the list",
      );
      UI_STATE.setActiveLayer(layerContexts[0].layer.uuid);
    }
  }
}
