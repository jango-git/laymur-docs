import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import type { ESelectControlOption } from "../../../controls/ESelectControl/ESelectControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { EProgressElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EElementUUID } from "../../../document/types.misc";
import { EProgressMaskFunction } from "../../../document/types.misc";
import { makeRow } from "./helpers";

const MASK_FUNCTION_OPTIONS: ESelectControlOption<EProgressMaskFunction>[] = [
  { label: "Circular", value: EProgressMaskFunction.CIRCULAR },
  { label: "Directional", value: EProgressMaskFunction.DIRECTIONAL },
];

export class EProgressElementCard {
  private readonly colorControl: EColorControl;
  private readonly textureControl: EAssetControl<EImageAsset>;
  private readonly maskFunctionControl: ESelectControl<EProgressMaskFunction>;
  private readonly progressControl: ENumberControl;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EElementUUID,
  ) {
    const root = document.createElement("div");
    root.className = "element-card";

    const colorRow = makeRow(root, "Color");
    this.colorControl = new EColorControl(colorRow);

    const textureRow = makeRow(root, "Texture");
    this.textureControl = new EAssetControl<EImageAsset>(
      textureRow,
      STORE.selectors.assets.selectAllImages,
      {
        nullable: false,
      },
    );

    const maskRow = makeRow(root, "Mask Fn");
    this.maskFunctionControl = new ESelectControl<EProgressMaskFunction>(maskRow, {
      options: MASK_FUNCTION_OPTIONS,
      value: EProgressMaskFunction.CIRCULAR,
    });

    const progressRow = makeRow(root, "Progress");
    this.progressControl = new ENumberControl(progressRow, {
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
      precision: 2,
    });

    this.container.appendChild(root);

    this.colorControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeProgress({ uuid: this.uuid, color: next });
    });
    this.textureControl.signalValueChanged.on((next) => {
      if (next !== undefined) {
        STORE.commands.elements.writeProgress({ uuid: this.uuid, texture: next.uuid });
      }
    });
    this.maskFunctionControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeProgress({ uuid: this.uuid, maskFunction: next });
    });
    this.progressControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeProgress({ uuid: this.uuid, progress: next });
    });

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type === EElementType.PROGRESS) {
      this.refresh(initial);
    }

    STORE.signals.elements.item.on((delta) => {
      if (delta.element.uuid === this.uuid && delta.element.type === EElementType.PROGRESS) {
        this.refresh(delta.element);
      }
    });
  }

  private refresh(element: EProgressElement): void {
    this.colorControl.value = element.color;
    this.textureControl.value = STORE.selectors.assets.selectImage(element.texture);
    this.maskFunctionControl.value = element.maskFunction;
    this.progressControl.value = element.progress;
  }
}
