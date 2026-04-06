import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { ELayerContext } from "../../../document/types";
import { ELayerType } from "../../../document/types.layers";
import { EResizePolicyType } from "../../../document/types.misc";
import { UI_STATE } from "../../../ui-state/ui-state";

export class EFullscreenLayerBuilder {
  private readonly nameControl: EStringControl;
  private readonly errorMessage: HTMLElement;

  private readonly signalBuildAvailabilityInternal = new Ferrsign1<boolean>();

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

    this.errorMessage = document.createElement("div");
    this.errorMessage.className = "element-card__error";
    this.container.appendChild(this.errorMessage);

    this.nameControl.signalValueChanged.on(this.handleDataUpdate);

    this.handleDataUpdate();
  }

  public get buildAvailabilitySignal(): FerrsignView1<boolean> {
    return this.signalBuildAvailabilityInternal;
  }

  public build(): void {
    const uuid = crypto.randomUUID();
    const layerContext: ELayerContext = {
      layer: {
        uuid,
        type: ELayerType.FULLSCREEN,
        name: this.nameControl.value,
        resizePolicy: EResizePolicyType.NONE,
        resizePolicyParameters: [0, 0],
      },
      debug: {
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
    UI_STATE.setActiveLayer(uuid);

    this.nameControl.value = "";
    this.handleDataUpdate();
  }

  private readonly handleDataUpdate = (): void => {
    const error = STORE.validators.layers.validateFullscreenBuilder(this.nameControl.value);
    const isAvailable = error === undefined;
    this.signalBuildAvailabilityInternal.emit(isAvailable);

    this.errorMessage.textContent = error?.message ?? "";
    this.errorMessage.style.display = error !== undefined ? "block" : "none";

    if (error?.field === "name") {
      this.nameControl.flash();
    }
  };
}
