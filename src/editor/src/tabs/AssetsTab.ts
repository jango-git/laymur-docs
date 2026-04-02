import type { PreviewBridge } from "../bridge/PreviewBridge";
import type { EditorBus } from "../events";
import { ELEMENT_REGISTRY } from "../registry/element-registry";
import type { EditorState } from "../state";
import type { EUIFontCardCallbackPack } from "../ui/EUIFontCard/EUIFontCard";
import { EUIFontCard } from "../ui/EUIFontCard/EUIFontCard";
import type { EUITextureCardCallbackPack } from "../ui/EUITextureCard/EUITextureCard";
import { EUITextureCard } from "../ui/EUITextureCard/EUITextureCard";
import {
  databaseDelete,
  databasePut,
  registerAsset,
  registerFontAsset,
  unregisterAsset,
} from "./AssetsTab.Internal";

const FONT_EXTENSIONS = new Set([".ttf", ".otf", ".woff", ".woff2"]);

function isFontFile(name: string): boolean {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return FONT_EXTENSIONS.has(ext);
}

export class AssetsTab {
  private readonly assetsGrid: HTMLElement;
  private readonly inputAssetFile: HTMLInputElement;
  private assetCards: { destroy(): void }[] = [];
  private readonly bus: EditorBus;

  constructor(
    private readonly editorState: EditorState,
    bus: EditorBus,
    private readonly bridge: PreviewBridge,
  ) {
    this.bus = bus;
    bus.sceneLoaded.on(() => this.render());
    bus.previewInitialized.on(() => this.syncFontsToPreview());
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
    this.inputAssetFile.accept = "image/*,.ttf,.otf,.woff,.woff2";

    addAssetButton.addEventListener("click", () => {
      this.inputAssetFile.click();
    });

    this.inputAssetFile.addEventListener("change", (event) => {
      void this.onFileInputChange(event);
    });
  }

  public render(): void {
    for (const card of this.assetCards) {
      card.destroy();
    }
    this.assetCards = [];
    this.assetsGrid.innerHTML = "";

    const assetsEntries = Object.entries(this.editorState.assets);
    if (assetsEntries.length === 0) {
      const placeholder = document.createElement("p");
      placeholder.className = "placeholder-text";
      placeholder.textContent = "No assets. Click '+ Add Texture' to import images or fonts.";
      this.assetsGrid.appendChild(placeholder);
      return;
    }

    const textureCallbacks: EUITextureCardCallbackPack = {
      onAssetReplace: (id, file) => {
        void this.replaceAsset(id, file);
      },
      onAssetDelete: (id) => {
        void this.deleteAsset(id);
      },
      isAssetUsed: (assetId) => this.isAssetUsed(assetId),
    };

    const fontCallbacks: EUIFontCardCallbackPack = {
      onAssetReplace: (id, file) => {
        void this.replaceAsset(id, file);
      },
      onAssetDelete: (id) => {
        void this.deleteAsset(id);
      },
      isAssetUsed: (assetId) => this.isAssetUsed(assetId),
    };

    const imageEntries = assetsEntries.filter(([, meta]) => meta.assetType !== "font");
    const fontEntries = assetsEntries.filter(([, meta]) => meta.assetType === "font");

    if (imageEntries.length > 0) {
      this.assetsGrid.appendChild(this.createSectionLabel("Textures"));
      for (const [id, meta] of imageEntries) {
        this.assetCards.push(new EUITextureCard(this.assetsGrid, id, textureCallbacks, meta));
      }
    }

    if (fontEntries.length > 0) {
      this.assetsGrid.appendChild(this.createSectionLabel("Fonts"));
      for (const [id, meta] of fontEntries) {
        this.assetCards.push(new EUIFontCard(this.assetsGrid, id, fontCallbacks, meta));
      }
    }
  }

  private createSectionLabel(text: string): HTMLElement {
    const label = document.createElement("p");
    label.className = "assets-section-label";
    label.textContent = text;
    return label;
  }

  private async replaceAsset(id: string, file: File): Promise<void> {
    console.debug("[AssetsTab] replaceAsset id=%s file=%s", id, file.name);
    await this.addAssetFromFile(file, id);
    this.render();
    this.bus.assetsChanged.emit();
  }

  private async deleteAsset(id: string): Promise<void> {
    console.debug("[AssetsTab] deleteAsset id=%s", id);
    await databaseDelete(id);
    unregisterAsset(this.editorState, id);
    this.render();
    this.bus.assetsChanged.emit();
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
      if (isFontFile(file.name)) {
        const fontFamily = file.name.replace(/\.[^.]+$/, "");
        await databasePut({ id: assetId, name: file.name, blob: file, assetType: "font" });
        await registerFontAsset(this.editorState, assetId, file.name, fontFamily, file);
        const meta = this.editorState.assets[assetId];
        this.bridge.loadFont(fontFamily, meta.dataURL);
      } else {
        await databasePut({ id: assetId, name: file.name, blob: file, assetType: "image" });
        await registerAsset(this.editorState, assetId, file.name, file);
      }
    } catch (error) {
      console.warn(`[AssetsTab] addAssetFromFile failed for "${assetId}":`, error);
    }
  }

  private syncFontsToPreview(): void {
    for (const meta of Object.values(this.editorState.assets)) {
      if (meta.assetType === "font" && meta.fontFamily !== undefined) {
        this.bridge.loadFont(meta.fontFamily, meta.dataURL);
      }
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
    this.bus.assetsChanged.emit();
  }
}
