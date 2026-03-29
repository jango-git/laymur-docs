import type { AssetMeta, LayerState } from "./types";

export class EditorState {
  public assets: Record<string, AssetMeta> = {};
  public layers: LayerState[] = [
    {
      id: "layer_1",
      name: "UIGameplayLayer",
      policyType: "fixedHeight",
      policyParams: { fixedHeightLandscape: 1080, fixedHeightPortrait: 1920 },
      elements: [],
      constraints: [],
    },
  ];
  public activeLayerId = "layer_1";

  private nextId = 1;
  private nextConstraintId = 1;
  private nextLayerId = 2;

  generateId(): string {
    return `el_${this.nextId++}`;
  }

  generateConstraintId(): string {
    return `cst_${this.nextConstraintId++}`;
  }

  generateLayerId(): string {
    return `layer_${this.nextLayerId++}`;
  }

  activeLayer(): LayerState {
    return this.layers.find((l) => l.id === this.activeLayerId) ?? this.layers[0];
  }

  isNameTaken(
    name: string,
    layer: LayerState,
    {
      excludeElementId = null,
      excludeConstraintId = null,
    }: { excludeElementId?: string | null; excludeConstraintId?: string | null } = {},
  ): boolean {
    if (!name) {
      return false;
    }
    return (
      layer.elements.some((e) => e.name === name && e.id !== excludeElementId) ||
      layer.constraints.some((c) => c.name === name && c.id !== excludeConstraintId)
    );
  }

  resetState(layers: LayerState[], activeLayerId: string): void {
    this.layers = layers;
    this.activeLayerId = activeLayerId;

    let maxEl = 0;
    let maxCst = 0;
    let maxLayer = 1;
    for (const layer of layers) {
      const layerNumber = parseInt(layer.id.replace("layer_", ""), 10);
      if (!isNaN(layerNumber) && layerNumber > maxLayer) {
        maxLayer = layerNumber;
      }
      for (const el of layer.elements) {
        const n = parseInt(el.id.replace("el_", ""), 10);
        if (!isNaN(n) && n > maxEl) {
          maxEl = n;
        }
      }
      for (const c of layer.constraints) {
        const n = parseInt(c.id.replace("cst_", ""), 10);
        if (!isNaN(n) && n > maxCst) {
          maxCst = n;
        }
      }
    }
    this.nextId = maxEl + 1;
    this.nextConstraintId = maxCst + 1;
    this.nextLayerId = maxLayer + 1;
  }
}

export const editorState = new EditorState();
