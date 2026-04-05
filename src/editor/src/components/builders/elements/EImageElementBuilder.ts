import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import { EElementType } from "../../../document/types.elements";

export class EImageElementBuilder {
  private readonly textureControl: EAssetControl<EImageAsset>;
  private readonly addButton: HTMLButtonElement;

  constructor(container: HTMLElement) {
    const textureRow = document.createElement("div");
    textureRow.className = "element-card__row";
    const textureLabel = document.createElement("span");
    textureLabel.className = "element-card__label";
    textureLabel.textContent = "Texture";
    textureRow.appendChild(textureLabel);
    container.appendChild(textureRow);

    this.textureControl = new EAssetControl<EImageAsset>(
      textureRow,
      STORE.selectors.assets.selectAllImages,
      { nullable: false },
    );

    this.addButton = document.createElement("button");
    this.addButton.className = "button-primary";
    this.addButton.textContent = "+ Add";
    container.appendChild(this.addButton);

    this.textureControl.signalValueChanged.on(() => this.updateButton());
    STORE.currentLayerChanged.on(() => this.updateButton());
    this.updateButton();

    this.addButton.addEventListener("click", () => {
      if (!this.isValid()) {
        return;
      }
      STORE.commands.elements.add(STORE.currentLayerUuid!, {
        uuid: crypto.randomUUID(),
        type: EElementType.IMAGE,
        name: "Image",
        color: "#ffffffff",
        texture: this.textureControl.value!.uuid,
      });
      this.textureControl.value = null;
      this.updateButton();
    });
  }

  private isValid(): boolean {
    return STORE.currentLayerUuid !== null && this.textureControl.value !== null;
  }

  private updateButton(): void {
    this.addButton.disabled = !this.isValid();
  }
}
