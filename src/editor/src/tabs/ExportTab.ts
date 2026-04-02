/**
 * ExportTab.ts
 *
 * Export tab: Save/Load scene as JSON, Export layer(s) as TypeScript.
 */

import type { PreviewBridge } from "../bridge/PreviewBridge";
import type { EditorBus } from "../events";
import { ELEMENT_REGISTRY } from "../registry/element-registry";
import type { EditorState } from "../state";
import type { AssetMeta } from "../types";
import { addAssetFromDataURL } from "./AssetsTab.Internal";
import { type SavedScene, downloadFile, generateTs } from "./ExportTab.Internal";

const SCENE_VERSION = 1;

export class ExportTab {
  private filenameInput: HTMLInputElement | null = null;

  constructor(
    private readonly editorState: EditorState,
    private readonly bridge: PreviewBridge,
    private readonly bus: EditorBus,
  ) {
    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyS" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const base = this.filenameInput?.value.trim() ?? "scene";
        const now = new Date();
        const datetime = now.toISOString().replace("T", "_").replace(/:/g, "-").slice(0, 19);
        this.saveScene(`${base}_${datetime}`);
      }
    });
  }

  public render(): void {
    const container = document.getElementById("export-content");
    if (container === null) {
      return;
    }
    container.innerHTML = "";

    const filenameRow = document.createElement("div");
    filenameRow.className = "input-labeled-row";

    const filenameLabel = document.createElement("span");
    filenameLabel.className = "input-label";
    filenameLabel.textContent = "Default File Name:";

    const filenameInput = document.createElement("input");
    filenameInput.type = "text";
    filenameInput.className = "input-full";
    filenameInput.placeholder = "default file name";
    filenameInput.value = this.filenameInput?.value ?? "laymur-scene";
    this.filenameInput = filenameInput;

    filenameRow.appendChild(filenameLabel);
    filenameRow.appendChild(filenameInput);
    container.appendChild(filenameRow);

    const loadInput = document.createElement("input");
    loadInput.type = "file";
    loadInput.accept = ".json";
    loadInput.hidden = true;
    loadInput.addEventListener("change", () => {
      void this.handleLoadFileChange(loadInput);
    });

    const buttonsRow = document.createElement("div");
    buttonsRow.className = "button-row";

    const saveButton = document.createElement("button");
    saveButton.className = "button-primary";
    saveButton.textContent = "Save Scene";
    saveButton.addEventListener("click", () => {
      this.saveScene(filenameInput.value.trim() || "scene");
    });

    const loadButton = document.createElement("button");
    loadButton.className = "button-secondary";
    loadButton.textContent = "Load Scene";
    loadButton.addEventListener("click", () => {
      loadInput.click();
    });

    const tsActiveButton = document.createElement("button");
    tsActiveButton.className = "button-success";
    tsActiveButton.textContent = "Export Active Layer";
    tsActiveButton.addEventListener("click", () => {
      this.exportActiveLayerTs();
    });

    const tsAllButton = document.createElement("button");
    tsAllButton.className = "button-success-dim";
    tsAllButton.textContent = "Export All Layers";
    tsAllButton.addEventListener("click", () => {
      this.exportAllLayersTs();
    });

    buttonsRow.appendChild(saveButton);
    buttonsRow.appendChild(loadButton);
    buttonsRow.appendChild(tsActiveButton);
    buttonsRow.appendChild(tsAllButton);
    container.appendChild(buttonsRow);

    const hint = document.createElement("p");
    hint.className = "export-hint";
    hint.textContent = "Tip: Ctrl+S saves the scene using the file name above.";
    container.appendChild(hint);

    container.appendChild(loadInput);
  }

  private saveScene(filename: string): void {
    console.debug("[ExportTab] saveScene filename=%s", filename);
    const usedAssetIds = this.collectUsedAssetIds();

    const assets: Record<string, { name: string; dataURL: string }> = {};
    for (const id of usedAssetIds) {
      const meta = this.editorState.assets[id] as AssetMeta | undefined;
      if (meta !== undefined) {
        assets[id] = {
          name: meta.name,
          dataURL: meta.dataURL,
          ...(meta.assetType === "font"
            ? { assetType: "font" as const, fontFamily: meta.fontFamily }
            : {}),
        };
      }
    }

    const scene: SavedScene = {
      version: SCENE_VERSION,
      activeLayerId: this.editorState.activeLayerId,
      layers: this.editorState.layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        policyType: layer.policyType,
        policyParams: { ...layer.policyParams },
        elements: layer.elements.map((el) => ({
          id: el.id,
          type: el.type,
          name: el.name,
          fieldValues: { ...el.fieldValues },
        })),
        constraints: layer.constraints.map((c) => ({
          id: c.id,
          constraintType: c.constraintType,
          ...(c.name !== undefined ? { name: c.name } : {}),
          fieldValues: { ...c.fieldValues },
        })),
      })),
      assets,
    };

    downloadFile(JSON.stringify(scene, null, 2), `${filename}.json`, "application/json");
  }

  private collectUsedAssetIds(): Set<string> {
    const ids = new Set<string>();
    for (const layer of this.editorState.layers) {
      for (const element of layer.elements) {
        const descriptor = ELEMENT_REGISTRY.get(element.type);
        if (descriptor === undefined) {
          continue;
        }
        for (const field of descriptor.fields) {
          const value = element.fieldValues[field.key];
          if (field.fieldType === "asset" && typeof value === "string" && value.length > 0) {
            ids.add(value);
          }
        }
      }
    }
    return ids;
  }

  private async handleLoadFileChange(loadInput: HTMLInputElement): Promise<void> {
    const file = loadInput.files?.[0];
    if (file === undefined) {
      return;
    }
    loadInput.value = "";
    const text = await file.text();
    try {
      console.debug("[ExportTab] loadScene from file=%s", file.name);
      await this.loadScene(JSON.parse(text) as unknown);
    } catch (err) {
      console.error("[ExportTab] loadScene failed:", err);
    }
  }

  private async loadScene(json: unknown): Promise<void> {
    if (typeof json !== "object" || json === null) {
      console.error("[ExportTab] loadScene: invalid JSON");
      return;
    }
    const scene = json as SavedScene;
    if (scene.version !== SCENE_VERSION) {
      console.error("[ExportTab] loadScene: unsupported version=%s", scene.version);
      return;
    }

    for (const [id, assetData] of Object.entries(scene.assets)) {
      await addAssetFromDataURL(
        this.editorState,
        id,
        assetData.name,
        assetData.dataURL,
        assetData.assetType,
        assetData.fontFamily,
      );
    }

    this.editorState.resetState(scene.layers, scene.activeLayerId);
    this.bus.previewInitializing.emit();
    this.bus.sceneLoaded.emit();
  }

  private exportActiveLayerTs(): void {
    const layer = this.editorState.activeLayer();
    console.debug("[ExportTab] exportActiveLayerTs layer=%s", layer.name);
    downloadFile(generateTs(layer), `${layer.name}.ts`, "text/plain");
  }

  private exportAllLayersTs(): void {
    console.debug("[ExportTab] exportAllLayersTs count=%d", this.editorState.layers.length);
    for (const layer of this.editorState.layers) {
      downloadFile(generateTs(layer), `${layer.name}.ts`, "text/plain");
    }
  }
}
