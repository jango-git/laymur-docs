import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import type { EStoreDeltaElement } from "../../../document/signals/elements";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { EImageElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EColor, UUID } from "../../../document/types.misc";
import { makeRow } from "../../../miscellaneous/rows";
import { EElementCard } from "./EElementCard";

export class EImageElementCard extends EElementCard {
  private readonly textureControl: EAssetControl<EImageAsset>;

  constructor(container: HTMLElement, uuid: UUID, layerUuid: UUID) {
    super(container, uuid, layerUuid, "Image");

    this.nameControl.signalValueChanged.on(this.onNameChanged);
    this.colorControl.signalValueChanged.on(this.onColorChanged);

    this.textureControl = new EAssetControl<EImageAsset>(
      makeRow(this.bodyRoot, "Texture"),
      () => STORE.selectors.assets.selectAllImages(),
      { nullable: false },
    );
    this.textureControl.signalValueChanged.on(this.onTextureChanged);

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type !== EElementType.IMAGE) {
      throw new Error("EImageElementCard: initial element is not an image element");
    }

    this.refresh(initial);
    STORE.signals.elements.item.on(this.onElementItemChanged);
  }

  private refresh(element: EImageElement): void {
    this.nameControl.value = element.name;
    this.colorControl.value = element.color;
    this.textureControl.value = STORE.selectors.assets.selectImage(element.texture);
  }

  private readonly onNameChanged = (name: string): void => {
    STORE.commands.elements.writeImage({ uuid: this.uuid, name });
  };

  private readonly onColorChanged = (color: EColor): void => {
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
