import { STORE } from "../../../document/store";
import { EAssetType, type EFontAsset } from "../../../document/types.assets";
import type { EAssetUUID } from "../../../document/types.misc";

export class EFontAssetCard {
  private readonly root: HTMLDivElement;
  private readonly nameLabel: HTMLSpanElement;
  private readonly downloadLink: HTMLAnchorElement;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EAssetUUID,
  ) {
    this.root = document.createElement("div");
    this.root.className = "asset-card";

    const thumbnail = document.createElement("div");
    thumbnail.className = "asset-card__thumbnail asset-card__thumbnail--font";
    thumbnail.textContent = "Aa";

    this.nameLabel = document.createElement("span");
    this.nameLabel.className = "asset-card__name";

    this.downloadLink = document.createElement("a");
    this.downloadLink.className = "asset-card__download";
    this.downloadLink.textContent = "↓";
    this.downloadLink.title = "Download";

    const deleteButton = document.createElement("button");
    deleteButton.className = "asset-card__delete";
    deleteButton.textContent = "✕";
    deleteButton.title = "Delete";
    deleteButton.addEventListener("click", () => {
      STORE.commands.assets.remove(this.uuid);
    });

    this.root.appendChild(thumbnail);
    this.root.appendChild(this.nameLabel);
    this.root.appendChild(this.downloadLink);
    this.root.appendChild(deleteButton);
    this.container.appendChild(this.root);

    const initial = STORE.selectors.assets.selectFont(uuid);
    if (initial !== undefined) {
      this.refresh(initial);
    }

    STORE.signals.assets.item.on((delta) => {
      if (delta.asset.uuid === this.uuid && delta.asset.type === EAssetType.FONT) {
        this.refresh(delta.asset);
      }
    });
  }

  private refresh(asset: EFontAsset): void {
    this.nameLabel.textContent = asset.name;
    this.downloadLink.href = asset.dataURL;
    this.downloadLink.download = asset.name;
  }
}
