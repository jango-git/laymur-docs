import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import type { EStoreDeltaElement } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { EProgressElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EColor, EElementUuid } from "../../../document/types.misc";
import { EProgressMaskFunction } from "../../../document/types.misc";
import { makeRow } from "../../../utils/rows";
import { MASK_FUNCTION_OPTIONS } from "./EProgressElementCard.Internal";

export class EProgressElementCard {
  private readonly colorControl: EColorControl;
  private readonly textureControl: EAssetControl<EImageAsset>;
  private readonly maskFunctionControl: ESelectControl<EProgressMaskFunction>;
  private readonly progressControl: ENumberControl;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EElementUuid,
  ) {
    const root = document.createElement("div");
    root.className = "element-card";

    this.colorControl = new EColorControl(makeRow(root, "Color"));
    this.colorControl.signalValueChanged.on(this.onColorChanged);

    this.textureControl = new EAssetControl<EImageAsset>(
      makeRow(root, "Texture"),
      () => STORE.selectors.assets.selectAllImages(),
      { nullable: false },
    );
    this.textureControl.signalValueChanged.on(this.onTextureChanged);

    this.maskFunctionControl = new ESelectControl<EProgressMaskFunction>(
      makeRow(root, "Mask Function"),
      {
        options: MASK_FUNCTION_OPTIONS,
        value: EProgressMaskFunction.CIRCULAR,
      },
    );
    this.maskFunctionControl.signalValueChanged.on(this.onMaskFunctionChanged);

    this.progressControl = new ENumberControl(makeRow(root, "Progress"), {
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
      precision: 2,
    });
    this.progressControl.signalValueChanged.on(this.onProgressChanged);

    this.container.appendChild(root);

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type !== EElementType.PROGRESS) {
      throw new Error("EProgressElementCard: initial element is not a progress element");
    }

    this.refresh(initial);
    STORE.signals.elements.item.on(this.onElementItemChanged);
  }

  private refresh(element: EProgressElement): void {
    this.colorControl.value = element.color;
    this.textureControl.value = STORE.selectors.assets.selectImage(element.texture);
    this.maskFunctionControl.value = element.maskFunction;
    this.progressControl.value = element.progress;
  }

  private readonly onColorChanged = (color: EColor): void => {
    STORE.commands.elements.writeProgress({ uuid: this.uuid, color });
  };

  private readonly onTextureChanged = (next: EImageAsset | undefined): void => {
    if (next !== undefined) {
      STORE.commands.elements.writeProgress({ uuid: this.uuid, texture: next.uuid });
    }
  };

  private readonly onMaskFunctionChanged = (maskFunction: EProgressMaskFunction): void => {
    STORE.commands.elements.writeProgress({ uuid: this.uuid, maskFunction });
  };

  private readonly onProgressChanged = (progress: number): void => {
    STORE.commands.elements.writeProgress({ uuid: this.uuid, progress });
  };

  private readonly onElementItemChanged = (delta: EStoreDeltaElement): void => {
    if (delta.element.uuid === this.uuid && delta.element.type === EElementType.PROGRESS) {
      this.refresh(delta.element);
    }
  };
}
