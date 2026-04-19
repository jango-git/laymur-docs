import type { EStoreDeltaAsset } from "../../../document/signals/assets";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import { EAssetType } from "../../../document/types.assets";
import type { UUID } from "../../../document/types.misc";

export class EImageAssetCard {
  private readonly root: HTMLDivElement;
  private readonly thumbnail: HTMLImageElement;
  private readonly nameLabel: HTMLSpanElement;
  private readonly nameBase: HTMLSpanElement;
  private readonly nameExt: HTMLSpanElement;
  private readonly downloadButton: HTMLButtonElement;
  private readonly deleteButton: HTMLButtonElement;

  private asset: EImageAsset;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: UUID,
  ) {
    this.root = document.createElement("div");
    this.root.className = "asset-card";

    this.thumbnail = document.createElement("img");
    this.thumbnail.className = "asset-card__thumbnail";
    this.thumbnail.alt = "";

    this.nameLabel = document.createElement("span");
    this.nameLabel.className = "asset-card__name";

    this.nameBase = document.createElement("span");
    this.nameBase.className = "asset-card__name-base";

    this.nameExt = document.createElement("span");
    this.nameExt.className = "asset-card__name-ext";

    this.nameLabel.appendChild(this.nameBase);
    this.nameLabel.appendChild(this.nameExt);

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

    this.root.appendChild(this.thumbnail);
    this.root.appendChild(this.nameLabel);
    this.root.appendChild(this.downloadButton);
    this.root.appendChild(this.deleteButton);
    this.container.appendChild(this.root);

    const initialAssetData = STORE.selectors.assets.selectImage(uuid);
    if (!initialAssetData) {
      throw new Error(`[EImageAssetCard] asset with uuid ${uuid} not found`);
    }

    this.asset = initialAssetData;
    this.refresh(initialAssetData);
    STORE.signals.assets.item.on(this.onAssetChanged);
  }

  private refresh(asset: EImageAsset): void {
    this.thumbnail.src = asset.dataURL;
    const dotIdx = asset.name.lastIndexOf(".");
    this.nameBase.textContent = dotIdx > 0 ? asset.name.slice(0, dotIdx) : asset.name;
    this.nameExt.textContent = dotIdx > 0 ? asset.name.slice(dotIdx) : "";
    this.asset = asset;
  }

  private readonly onAssetChanged = (delta: EStoreDeltaAsset): void => {
    if (delta.asset.uuid === this.uuid && delta.asset.type === EAssetType.IMAGE) {
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
