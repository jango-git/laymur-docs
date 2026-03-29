import type { AssetMeta } from "../../types";

export interface EUITextureCardCallbackPack {
  onAssetReplace: (id: string, file: File) => void;
  onAssetDelete: (id: string) => void;
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
    this.deleteButton.className = "button-icon button-danger asset-card-delete";
    this.deleteButton.textContent = "✕";
    this.deleteButton.title = "Remove asset";
    this.deleteButton.addEventListener("click", this.onDeleteButtonClick);

    this.root.appendChild(this.thumbnailElement);
    this.root.appendChild(this.nameText);
    this.root.appendChild(this.deleteButton);
    this.container.appendChild(this.root);
  }

  public destroy(): void {
    if (this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
  }

  private readonly onThumbnailClick = (): void => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (file) {
        this.callbacks.onAssetReplace(this.id, file);
      }
    });

    fileInput.click();
  };

  private readonly onDeleteButtonClick = (): void => {
    if (!this.callbacks.isAssetUsed(this.id)) {
      this.callbacks.onAssetDelete(this.id);
      return;
    }

    this.deleteButton.style.color = "var(--danger)";
    this.deleteButton.title = "In use - remove element first";

    setTimeout(() => {
      this.deleteButton.style.color = "";
      this.deleteButton.title = "Remove asset";
    }, 2000);
  };
}
