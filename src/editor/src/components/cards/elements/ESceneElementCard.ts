import { EBoolControl } from "../../../controls/EBoolControl/EBoolControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import type { ESelectControlOption } from "../../../controls/ESelectControl/ESelectControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { STORE } from "../../../document/store";
import type { ESceneElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EElementUUID } from "../../../document/types.misc";
import { ESceneUpdateMode } from "../../../document/types.misc";
import { makeRow } from "./helpers";

const UPDATE_MODE_OPTIONS: ESelectControlOption<ESceneUpdateMode>[] = [
  { label: "Every Frame", value: ESceneUpdateMode.EVERY_FRAME },
  { label: "Every 2nd Frame", value: ESceneUpdateMode.EVERY_SECOND_FRAME },
  { label: "On Props Change", value: ESceneUpdateMode.ON_PROPERTIES_CHANGE },
  { label: "On Dim Change", value: ESceneUpdateMode.ON_DIMENSIONS_CHANGE },
  { label: "Manual", value: ESceneUpdateMode.MANUAL },
];

export class ESceneElementCard {
  private readonly colorControl: EColorControl;
  private readonly updateModeControl: ESelectControl<ESceneUpdateMode>;
  private readonly resolutionFactorControl: ENumberControl;
  private readonly clearColorControl: EColorControl;
  private readonly enableDepthBufferControl: EBoolControl;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EElementUUID,
  ) {
    const root = document.createElement("div");
    root.className = "element-card";

    const colorRow = makeRow(root, "Color");
    this.colorControl = new EColorControl(colorRow);

    const updateModeRow = makeRow(root, "Update Mode");
    this.updateModeControl = new ESelectControl<ESceneUpdateMode>(updateModeRow, {
      options: UPDATE_MODE_OPTIONS,
      value: ESceneUpdateMode.EVERY_FRAME,
    });

    const resFactorRow = makeRow(root, "Res Factor");
    this.resolutionFactorControl = new ENumberControl(resFactorRow, {
      value: 1,
      min: 0.1,
      max: 4,
      step: 0.1,
      precision: 2,
    });

    const clearColorRow = makeRow(root, "Clear Color");
    this.clearColorControl = new EColorControl(clearColorRow);

    const depthRow = makeRow(root, "Depth Buffer");
    this.enableDepthBufferControl = new EBoolControl(depthRow);

    this.container.appendChild(root);

    this.colorControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeScene({ uuid: this.uuid, color: next });
    });
    this.updateModeControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeScene({ uuid: this.uuid, updateMode: next });
    });
    this.resolutionFactorControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeScene({ uuid: this.uuid, resolutionFactor: next });
    });
    this.clearColorControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeScene({ uuid: this.uuid, clearColor: next });
    });
    this.enableDepthBufferControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeScene({ uuid: this.uuid, enableDepthBuffer: next });
    });

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type === EElementType.SCENE) {
      this.refresh(initial);
    }

    STORE.signals.elements.item.on((delta) => {
      if (delta.element.uuid === this.uuid && delta.element.type === EElementType.SCENE) {
        this.refresh(delta.element);
      }
    });
  }

  private refresh(element: ESceneElement): void {
    this.colorControl.value = element.color;
    this.updateModeControl.value = element.updateMode;
    this.resolutionFactorControl.value = element.resolutionFactor;
    this.clearColorControl.value = element.clearColor;
    this.enableDepthBufferControl.value = element.enableDepthBuffer;
  }
}
