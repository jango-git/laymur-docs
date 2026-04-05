import { STORE } from "../../../document/store";
import type { ELayerContext } from "../../../document/types";
import { ELayerType } from "../../../document/types.layers";
import { EResizePolicyType } from "../../../document/types.misc";

export class EFullscreenLayerBuilder {
  constructor(container: HTMLElement) {
    const addButton = document.createElement("button");
    addButton.className = "button-primary";
    addButton.textContent = "+ Add Layer";
    container.appendChild(addButton);

    addButton.addEventListener("click", () => {
      const uuid = crypto.randomUUID();
      const layerContext: ELayerContext = {
        layer: {
          uuid,
          type: ELayerType.FULLSCREEN,
          name: "New Layer",
          resizePolicy: EResizePolicyType.NONE,
          resizePolicyParameters: [0, 0],
        },
        debug: {
          layer: uuid,
          showAspect: false,
          showHeight: false,
          showWidth: false,
          showHorizontalDistance: false,
          showHorizontalInterpolation: false,
          showVerticalDistance: false,
          showVerticalInterpolation: false,
        },
        elements: [],
        constraints: [],
      };
      STORE.commands.layers.add(layerContext);
      STORE.setCurrentLayer(uuid);
    });
  }
}
