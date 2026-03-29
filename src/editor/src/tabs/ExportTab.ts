/**
 * ExportTab.ts
 *
 * Export tab: Save/Load scene as JSON, Export layer(s) as TypeScript.
 */

import type { PreviewBridge } from "../bridge/PreviewBridge";
import { ELEMENT_REGISTRY } from "../registry/element-registry";
import type { EditorState } from "../state";
import type { AssetMeta } from "../types";
import { addAssetFromDataURL } from "./AssetsTab.Internal";
import { type SavedScene, downloadFile, generateTs } from "./ExportTab.Internal";

const SCENE_VERSION = 1;

export interface ExportTabCallbacks {
  onInitializePreview: () => void;
  onSceneLoad?: () => void;
}

export class ExportTab {
  constructor(
    private readonly editorState: EditorState,
    private readonly bridge: PreviewBridge,
    private readonly callbacks: ExportTabCallbacks,
  ) {}

  public render(): void {
    const container = document.getElementById("export-content");
    if (container === null) {
      return;
    }
    container.innerHTML = "";

    const sceneRow = document.createElement("div");
    sceneRow.className = "button-row";

    const saveButton = document.createElement("button");
    saveButton.className = "button-primary";
    saveButton.textContent = "Save Scene";
    saveButton.addEventListener("click", () => {
      this.saveScene();
    });

    const loadInput = document.createElement("input");
    loadInput.type = "file";
    loadInput.accept = ".json";
    loadInput.hidden = true;
    loadInput.addEventListener("change", () => {
      void this.handleLoadFileChange(loadInput);
    });

    const loadButton = document.createElement("button");
    loadButton.className = "button-secondary";
    loadButton.textContent = "Load Scene";
    loadButton.addEventListener("click", () => {
      loadInput.click();
    });

    sceneRow.appendChild(saveButton);
    sceneRow.appendChild(loadButton);
    container.appendChild(sceneRow);
    container.appendChild(loadInput);

    const divider = document.createElement("hr");
    divider.className = "export-divider";
    container.appendChild(divider);

    const tsRow = document.createElement("div");
    tsRow.className = "button-row";

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

    tsRow.appendChild(tsActiveButton);
    tsRow.appendChild(tsAllButton);
    container.appendChild(tsRow);
  }

  private saveScene(): void {
    console.debug("[ExportTab] saveScene");
    const usedAssetIds = this.collectUsedAssetIds();

    const assets: Record<string, { name: string; dataURL: string }> = {};
    for (const id of usedAssetIds) {
      const meta = this.editorState.assets[id] as AssetMeta | undefined;
      if (meta !== undefined) {
        assets[id] = { name: meta.name, dataURL: meta.dataURL };
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

    downloadFile(JSON.stringify(scene, null, 2), "scene.json", "application/json");
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
      await addAssetFromDataURL(this.editorState, id, assetData.name, assetData.dataURL);
    }

    this.editorState.resetState(scene.layers, scene.activeLayerId);
    this.callbacks.onInitializePreview();
    this.callbacks.onSceneLoad?.();
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
