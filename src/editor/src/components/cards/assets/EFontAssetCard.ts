import type { EStoreDeltaAsset } from "../../../document/signals";
import { STORE } from "../../../document/store";
import { EAssetType, type EFontAsset } from "../../../document/types.assets";
import type { EAssetUuid } from "../../../document/types.misc";

export class EFontAssetCard {
  private readonly root: HTMLDivElement;
  private readonly nameLabel: HTMLSpanElement;
  private readonly downloadButton: HTMLButtonElement;
  private readonly deleteButton: HTMLButtonElement;

  private asset: EFontAsset;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EAssetUuid,
  ) {
    this.root = document.createElement("div");
    this.root.className = "asset-card";

    const thumbnail = document.createElement("div");
    thumbnail.className = "asset-card__thumbnail asset-card__thumbnail--font";
    thumbnail.textContent = "Aa";

    this.nameLabel = document.createElement("span");
    this.nameLabel.className = "asset-card__name";

    this.downloadButton = document.createElement("button");
    this.downloadButton.className = "asset-card__action-btn";
    this.downloadButton.textContent = "Download";
    this.downloadButton.title = "Download";
    this.downloadButton.addEventListener("click", this.onDownloadButtonClicked);

    this.deleteButton = document.createElement("button");
    this.deleteButton.className = "asset-card__action-btn";
    this.deleteButton.textContent = "Delete";
    this.deleteButton.title = "Delete";
    this.deleteButton.addEventListener("click", this.onDeleteButtonClicked);

    this.root.appendChild(thumbnail);
    this.root.appendChild(this.nameLabel);
    this.root.appendChild(this.downloadButton);
    this.root.appendChild(this.deleteButton);
    this.container.appendChild(this.root);

    const initialAssetData = STORE.selectors.assets.selectFont(uuid);
    if (!initialAssetData) {
      throw new Error(`[EFontAssetCard] asset with uuid ${uuid} not found`);
    }

    this.asset = initialAssetData;
    this.refresh(initialAssetData);
    STORE.signals.assets.item.on(this.onAssetChanged);
  }

  private refresh(asset: EFontAsset): void {
    this.nameLabel.textContent = asset.name;
    this.asset = asset;
  }

  private readonly onAssetChanged = (delta: EStoreDeltaAsset): void => {
    if (delta.asset.uuid === this.uuid && delta.asset.type === EAssetType.FONT) {
      this.refresh(delta.asset);
    }
  };

  private readonly onDownloadButtonClicked = (): void => {
    const link = document.createElement("a");
    link.href = this.asset.dataURL;
    link.download = this.asset.name;
    link.click();
  };

  private readonly onDeleteButtonClicked = (): void => {
    STORE.commands.assets.remove(this.uuid);
  };
}
