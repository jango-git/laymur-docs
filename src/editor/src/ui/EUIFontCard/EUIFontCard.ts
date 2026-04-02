import type { AssetMeta } from "../../types";

export interface EUIFontCardCallbackPack {
  onAssetReplace: (id: string, file: File) => unknown;
  onAssetDelete: (id: string) => unknown;
  isAssetUsed: (id: string) => boolean;
}

export class EUIFontCard {
  private readonly root: HTMLDivElement;
  private readonly deleteButton: HTMLButtonElement;

  constructor(
    private readonly container: HTMLElement,
    private readonly id: string,
    private readonly callbacks: EUIFontCardCallbackPack,
    meta: AssetMeta,
  ) {
    this.root = document.createElement("div");
    this.root.className = "asset-card";

    const iconEl = document.createElement("div");
    iconEl.className = "asset-card-font-icon";
    iconEl.textContent = "Aa";
    iconEl.title = "Click to replace";
    iconEl.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".ttf,.otf,.woff,.woff2";
      fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (file) {
          console.debug("[EUIFontCard] replacing asset id=%s with file=%s", this.id, file.name);
          this.callbacks.onAssetReplace(this.id, file);
        }
      });
      fileInput.click();
    });

    const nameText = document.createElement("div");
    nameText.className = "asset-card-name";
    nameText.title = `Asset ID: ${id}\nFont family: ${meta.fontFamily ?? id}`;
    nameText.textContent = meta.name;

    const downloadButton = document.createElement("button");
    downloadButton.className = "button-icon asset-card-download";
    downloadButton.textContent = "Download";
    downloadButton.className = "button-icon asset-card-download";
    downloadButton.title = "Download font";
    downloadButton.addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = meta.dataURL;
      a.download = meta.name;
      a.click();
    });

    this.deleteButton = document.createElement("button");
    this.deleteButton.className = "button-icon button-delete asset-card-delete";
    this.deleteButton.textContent = "✕";
    this.deleteButton.title = "Remove asset";
    this.deleteButton.addEventListener("click", this.onDeleteButtonClick);

    this.root.appendChild(iconEl);
    this.root.appendChild(nameText);
    this.root.appendChild(downloadButton);
    this.root.appendChild(this.deleteButton);
    this.container.appendChild(this.root);
  }

  public destroy(): void {
    this.root.remove();
  }

  private readonly onDeleteButtonClick = (): void => {
    if (!this.callbacks.isAssetUsed(this.id)) {
      console.debug("[EUIFontCard] deleting asset id=%s", this.id);
      this.callbacks.onAssetDelete(this.id);
      return;
    }

    console.debug("[EUIFontCard] delete blocked: asset id=%s is in use", this.id);
    this.deleteButton.classList.add("asset-card-delete--in-use");
    this.deleteButton.title = "In use - remove element first";

    setTimeout(() => {
      this.deleteButton.classList.remove("asset-card-delete--in-use");
      this.deleteButton.title = "Remove asset";
    }, 2000);
  };
}
