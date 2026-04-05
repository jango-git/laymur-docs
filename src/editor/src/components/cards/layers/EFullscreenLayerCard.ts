import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { STORE } from "../../../document/store";
import { ELayerType } from "../../../document/types.layers";
import type { ELayerUUID } from "../../../document/types.misc";
import { EResizePolicyType } from "../../../document/types.misc";

const RESIZE_POLICY_OPTIONS = [
  { label: "None", value: EResizePolicyType.NONE },
  { label: "Cover", value: EResizePolicyType.COVER },
  { label: "Fit", value: EResizePolicyType.FIT },
  { label: "Cross", value: EResizePolicyType.CROSS },
  { label: "Cross Inverted", value: EResizePolicyType.CROSS_INVERTED },
  { label: "Fixed Width", value: EResizePolicyType.FIXED_WIDTH },
  { label: "Fixed Height", value: EResizePolicyType.FIXED_HEIGHT },
];

export class EFullscreenLayerCard {
  private readonly resizePolicyControl: ESelectControl<EResizePolicyType>;
  private readonly parametersRow: HTMLDivElement;
  private readonly horizontalControl: ENumberControl;
  private readonly verticalControl: ENumberControl;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: ELayerUUID,
  ) {
    const root = document.createElement("div");
    root.className = "layer-card";

    const policyRow = document.createElement("div");
    policyRow.className = "layer-card__row";

    const policyLabel = document.createElement("span");
    policyLabel.className = "layer-card__label";
    policyLabel.textContent = "Resize Policy";

    this.resizePolicyControl = new ESelectControl<EResizePolicyType>(policyRow, {
      options: RESIZE_POLICY_OPTIONS,
      value: EResizePolicyType.NONE,
    });

    policyRow.prepend(policyLabel);
    root.appendChild(policyRow);

    this.parametersRow = document.createElement("div");
    this.parametersRow.className = "layer-card__row layer-card__row--params";

    const hLabel = document.createElement("span");
    hLabel.className = "layer-card__label";
    hLabel.textContent = "H";

    this.horizontalControl = new ENumberControl(this.parametersRow, {
      value: 0,
      min: 0,
      max: 99999,
      step: 1,
      precision: 2,
    });

    const vLabel = document.createElement("span");
    vLabel.className = "layer-card__label";
    vLabel.textContent = "V";

    this.verticalControl = new ENumberControl(this.parametersRow, {
      value: 0,
      min: 0,
      max: 99999,
      step: 1,
      precision: 2,
    });

    this.parametersRow.prepend(vLabel);
    this.parametersRow.prepend(hLabel);
    root.appendChild(this.parametersRow);

    this.container.appendChild(root);

    this.resizePolicyControl.signalValueChanged.on((next) => {
      STORE.commands.layers.writeFullscreen({ uuid: this.uuid, resizePolicy: next });
    });

    this.horizontalControl.signalValueChanged.on((next) => {
      const current = this.currentParameters();
      STORE.commands.layers.writeFullscreen({
        uuid: this.uuid,
        resizePolicyParameters: [next, current[1]],
      });
    });

    this.verticalControl.signalValueChanged.on((next) => {
      const current = this.currentParameters();
      STORE.commands.layers.writeFullscreen({
        uuid: this.uuid,
        resizePolicyParameters: [current[0], next],
      });
    });

    const initial = STORE.selectors.layers.select(uuid);
    if (initial?.type === ELayerType.FULLSCREEN) {
      this.refresh(initial.resizePolicy, initial.resizePolicyParameters);
    }

    STORE.signals.layers.item.on((delta) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (delta.layer.uuid === this.uuid && delta.layer.type === ELayerType.FULLSCREEN) {
        this.refresh(delta.layer.resizePolicy, delta.layer.resizePolicyParameters);
      }
    });
  }

  private currentParameters(): [number, number] {
    return [this.horizontalControl.value, this.verticalControl.value];
  }

  private refresh(policy: EResizePolicyType, params: [number, number]): void {
    this.resizePolicyControl.value = policy;
    this.horizontalControl.value = params[0];
    this.verticalControl.value = params[1];
    this.parametersRow.style.display = policy === EResizePolicyType.NONE ? "none" : "";
  }
}
