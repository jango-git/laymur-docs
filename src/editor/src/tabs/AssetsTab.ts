import { ELEMENT_REGISTRY } from "../registry/element-registry";
import type { EditorState } from "../state";
import type { EUITextureCardCallbackPack } from "../ui/EUITextureCard/EUITextureCard";
import { EUITextureCard } from "../ui/EUITextureCard/EUITextureCard";
import { databaseDelete, databasePut, registerAsset, unregisterAsset } from "./AssetsTab.Internal";

export interface AssetsTabCallbacks {
  onAssetsChange: () => void;
}

export class AssetsTab {
  private readonly assetsGrid: HTMLElement;
  private readonly inputAssetFile: HTMLInputElement;
  private textureCards: EUITextureCard[] = [];

  constructor(
    private readonly editorState: EditorState,
    private readonly callbacks: Partial<AssetsTabCallbacks> = {},
  ) {
    const assetsGrid = document.getElementById("assets-grid");
    if (assetsGrid === null) {
      throw new Error("AssetsTab: 'assets-grid' element not found");
    }

    const addAssetButton = document.getElementById("button-add-asset");
    if (addAssetButton === null) {
      throw new Error("AssetsTab: 'button-add-asset' element not found");
    }

    const inputAssetFile = document.getElementById("input-asset-file");
    if (!(inputAssetFile instanceof HTMLInputElement)) {
      throw new Error("AssetsTab: 'input-asset-file' element not found");
    }

    this.assetsGrid = assetsGrid;
    this.inputAssetFile = inputAssetFile;

    addAssetButton.addEventListener("click", () => {
      this.inputAssetFile.click();
    });

    this.inputAssetFile.addEventListener("change", (event) => {
      void this.onFileInputChange(event);
    });
  }

  public render(): void {
    for (const card of this.textureCards) {
      card.destroy();
    }
    this.textureCards = [];
    this.assetsGrid.innerHTML = "";

    const assetsEntries = Object.entries(this.editorState.assets);
    if (assetsEntries.length === 0) {
      const placeholder = document.createElement("p");
      placeholder.className = "placeholder-text";
      placeholder.textContent = "No assets. Click '+ Add Texture' to import images.";
      this.assetsGrid.appendChild(placeholder);
      return;
    }

    const callbacks: EUITextureCardCallbackPack = {
      onAssetReplace: (id, file) => {
        void this.replaceAsset(id, file);
      },
      onAssetDelete: (id) => {
        void this.deleteAsset(id);
      },
      isAssetUsed: (assetId) => this.isAssetUsed(assetId),
    };

    for (const [id, meta] of assetsEntries) {
      this.textureCards.push(new EUITextureCard(this.assetsGrid, id, callbacks, meta));
    }
  }

  private async replaceAsset(id: string, file: File): Promise<void> {
    console.debug("[AssetsTab] replaceAsset id=%s file=%s", id, file.name);
    await this.addAssetFromFile(file, id);
    this.render();
    this.callbacks.onAssetsChange?.();
  }

  private async deleteAsset(id: string): Promise<void> {
    console.debug("[AssetsTab] deleteAsset id=%s", id);
    await databaseDelete(id);
    unregisterAsset(this.editorState, id);
    this.render();
    this.callbacks.onAssetsChange?.();
  }

  private isAssetUsed(assetId: string): boolean {
    for (const layer of this.editorState.layers) {
      for (const element of layer.elements) {
        const descriptor = ELEMENT_REGISTRY.get(element.type);
        if (descriptor === undefined) {
          continue;
        }
        for (const field of descriptor.fields) {
          if (field.fieldType === "asset" && element.fieldValues[field.key] === assetId) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private async addAssetFromFile(file: File, overrideId: string | undefined): Promise<void> {
    const defaultId = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const assetId = overrideId ?? defaultId;
    console.debug("[AssetsTab] addAssetFromFile assetId=%s file=%s", assetId, file.name);
    try {
      await databasePut({ id: assetId, name: file.name, blob: file });
      await registerAsset(this.editorState, assetId, file.name, file);
    } catch (error) {
      console.warn(`[AssetsTab] addAssetFromFile failed for "${assetId}":`, error);
    }
  }

  private async onFileInputChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const selectedFiles = input.files;
    if (selectedFiles === null) {
      console.warn("[AssetsTab] onFileInputChange: no files selected");
      return;
    }

    const files = Array.from(selectedFiles);
    input.value = "";
    console.debug("[AssetsTab] onFileInputChange: importing %d file(s)", files.length);

    for (const file of files) {
      await this.addAssetFromFile(file, undefined);
    }

    this.render();
    this.callbacks.onAssetsChange?.();
  }
}
