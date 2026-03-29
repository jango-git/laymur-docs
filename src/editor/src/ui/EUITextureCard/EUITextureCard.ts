import type { AssetMeta } from "../../types";

export interface EUITextureCardCallbackPack {
  onAssetReplace: (id: string, file: File) => unknown;
  onAssetDelete: (id: string) => unknown;
  isAssetUsed: (id: string) => boolean;
}

export class EUITextureCard {
  private readonly root: HTMLDivElement;
  private readonly thumbnailElement: HTMLImageElement;
  private readonly nameText: HTMLDivElement;
  private readonly deleteButton: HTMLButtonElement;

  constructor(
    private readonly container: HTMLElement,
    private readonly id: string,
    private readonly callbacks: EUITextureCardCallbackPack,
    meta: AssetMeta,
  ) {
    this.root = document.createElement("div");
    this.root.className = "asset-card";

    this.thumbnailElement = document.createElement("img");
    this.thumbnailElement.src = meta.url;
    this.thumbnailElement.className = "asset-card-thumb";
    this.thumbnailElement.title = "Click to replace";
    this.thumbnailElement.addEventListener("click", this.onThumbnailClick);

    this.nameText = document.createElement("div");
    this.nameText.className = "asset-card-name";
    this.nameText.title = `Asset ID: ${id}`;
    this.nameText.textContent = meta.name;

    this.deleteButton = document.createElement("button");
    this.deleteButton.className = "button-icon button-delete asset-card-delete";
    this.deleteButton.textContent = "✕";
    this.deleteButton.title = "Remove asset";
    this.deleteButton.addEventListener("click", this.onDeleteButtonClick);

    this.root.appendChild(this.thumbnailElement);
    this.root.appendChild(this.nameText);
    this.root.appendChild(this.deleteButton);
    this.container.appendChild(this.root);
  }

  public destroy(): void {
    this.root.remove();
  }

  private readonly onThumbnailClick = (): void => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (file) {
        console.debug("[EUITextureCard] replacing asset id=%s with file=%s", this.id, file.name);
        this.callbacks.onAssetReplace(this.id, file);
      }
    });
    fileInput.click();
  };

  private readonly onDeleteButtonClick = (): void => {
    if (!this.callbacks.isAssetUsed(this.id)) {
      console.debug("[EUITextureCard] deleting asset id=%s", this.id);
      this.callbacks.onAssetDelete(this.id);
      return;
    }

    console.debug("[EUITextureCard] delete blocked: asset id=%s is in use", this.id);
    this.deleteButton.classList.add("asset-card-delete--in-use");
    this.deleteButton.title = "In use - remove element first";

    setTimeout(() => {
      this.deleteButton.classList.remove("asset-card-delete--in-use");
      this.deleteButton.title = "Remove asset";
    }, 2000);
  };
}
