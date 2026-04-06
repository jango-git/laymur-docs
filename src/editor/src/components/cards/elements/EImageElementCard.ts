import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import type { EStoreDeltaElement } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { EImageElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EElementUuid } from "../../../document/types.misc";
import { makeRow } from "../../../utils/rows";

export class EImageElementCard {
  private readonly colorControl: EColorControl;
  private readonly textureControl: EAssetControl<EImageAsset>;

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

    this.container.appendChild(root);

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type !== EElementType.IMAGE) {
      throw new Error("EImageElementCard: initial element is not an image element");
    }

    this.refresh(initial);
    STORE.signals.elements.item.on(this.onElementItemChanged);
  }

  private refresh(element: EImageElement): void {
    this.colorControl.value = element.color;
    this.textureControl.value = STORE.selectors.assets.selectImage(element.texture);
  }

  private readonly onColorChanged = (color: string): void => {
    STORE.commands.elements.writeImage({ uuid: this.uuid, color });
  };

  private readonly onTextureChanged = (next: EImageAsset | undefined): void => {
    if (next !== undefined) {
      STORE.commands.elements.writeImage({ uuid: this.uuid, texture: next.uuid });
    }
  };

  private readonly onElementItemChanged = (delta: EStoreDeltaElement): void => {
    if (delta.element.uuid === this.uuid && delta.element.type === EElementType.IMAGE) {
      this.refresh(delta.element);
    }
  };
}
