import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { EImageElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EElementUUID } from "../../../document/types.misc";
import { makeRow } from "./helpers";

export class EImageElementCard {
  private readonly colorControl: EColorControl;
  private readonly textureControl: EAssetControl<EImageAsset>;

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
      { nullable: false },
    );

    this.container.appendChild(root);

    this.colorControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeImage({ uuid: this.uuid, color: next });
    });

    this.textureControl.signalValueChanged.on((next) => {
      if (next !== undefined) {
        STORE.commands.elements.writeImage({ uuid: this.uuid, texture: next.uuid });
      }
    });

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type === EElementType.IMAGE) {
      this.refresh(initial);
    }

    STORE.signals.elements.item.on((delta) => {
      if (delta.element.uuid === this.uuid && delta.element.type === EElementType.IMAGE) {
        this.refresh(delta.element);
      }
    });
  }

  private refresh(element: EImageElement): void {
    this.colorControl.value = element.color;
    this.textureControl.value = STORE.selectors.assets.selectImage(element.texture);
  }
}
