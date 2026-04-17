import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { ELayerContext } from "../../../document/types";
import { ELayerType } from "../../../document/types.layers";
import { EResizePolicyType } from "../../../document/types.misc";
import { UI_STATE } from "../../../ui-state/EUIState";
import { TOAST } from "../../toast/EToast";

export class EFullscreenLayerBuilder {
  private readonly nameControl: EStringControl;

  constructor(private readonly container: HTMLElement) {
    {
      const nameRow = document.createElement("div");
      nameRow.className = "element-card__row";

      const nameLabel = document.createElement("span");
      nameLabel.className = "element-card__label";
      nameLabel.textContent = "Name";

      nameRow.appendChild(nameLabel);
      this.container.appendChild(nameRow);

      this.nameControl = new EStringControl(nameRow, { placeholder: "name" });
    }
  }

  public build(): void {
    const uuid = crypto.randomUUID();
    const layerContext: ELayerContext = {
      layer: {
        uuid,
        type: ELayerType.FULLSCREEN,
        name: this.nameControl.value,
        resizePolicy: EResizePolicyType.NONE,
        resizePolicyParameters: [1920, 1920],
      },
      elements: [],
      constraints: [],
    };

    const error = STORE.validators.layers.fullscreen(layerContext.layer);
    if (error === undefined) {
      STORE.commands.layers.add(layerContext);
      UI_STATE.setActiveLayer(uuid);

      this.nameControl.value = "";
      return;
    }

    TOAST.warning(`**[EFullscreenLayerBuilder]** ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    }
  }
}
