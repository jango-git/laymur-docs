import type { AssetMeta } from "../../types";

export interface TextureCardCallbacks {
  onReplace: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  isAssetUsed: (id: string) => boolean;
}

export class EUITextureCard {
  private readonly id: string;
  private readonly root: HTMLDivElement;
  private readonly thumbnailElement: HTMLImageElement;

  constructor(
    container: HTMLElement,
    id: string,
    meta: AssetMeta,
    callbacks: TextureCardCallbacks,
  ) {
    this.id = id;

    this.root = document.createElement("div");
    this.root.className = "asset-card";

    this.thumbnailElement = document.createElement("img");
    this.thumbnailElement.src = meta.url;
    this.thumbnailElement.className = "asset-card-thumb";
    this.thumbnailElement.title = "Click to replace";
    this.thumbnailElement.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (!file) {return;}
        callbacks.onReplace(this.id, file);
      });
      fileInput.click();
    });

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = meta.name;
    nameInput.className = "asset-card-name";
    nameInput.title = `Asset ID: ${id}`;
    nameInput.readOnly = true;

    const deleteButton = document.createElement("button");
    deleteButton.className = "button-icon button-danger asset-card-delete";
    deleteButton.textContent = "✕";
    deleteButton.title = "Remove asset";
    deleteButton.addEventListener("click", async () => {
      if (callbacks.isAssetUsed(this.id)) {
        deleteButton.style.color = "var(--danger)";
        deleteButton.title = "In use — remove element first";
        setTimeout(() => {
          deleteButton.style.color = "";
          deleteButton.title = "Remove asset";
        }, 2000);
        return;
      }
      callbacks.onDelete(this.id);
    });

    this.root.appendChild(this.thumbnailElement);
    this.root.appendChild(nameInput);
    this.root.appendChild(deleteButton);
    container.appendChild(this.root);
  }

  public updateThumbnail(url: string): void {
    this.thumbnailElement.src = url;
  }

  public destroy(): void {
    if (this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
  }
}
