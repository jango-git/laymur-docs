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

  public generateId(): string {
    return `el_${this.nextId++}`;
  }

  public generateConstraintId(): string {
    return `cst_${this.nextConstraintId++}`;
  }

  public generateLayerId(): string {
    return `layer_${this.nextLayerId++}`;
  }

  public activeLayer(): LayerState {
    return this.layers.find((l) => l.id === this.activeLayerId) ?? this.layers[0];
  }

  public isLayerChildNameTaken(
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

  public resetState(layers: LayerState[], activeLayerId: string): void {
    console.debug("[state] resetState: layers=%d activeLayerId=%s", layers.length, activeLayerId);
    this.layers = layers;
    this.activeLayerId = activeLayerId;

    let maxElementId = 0;
    let maxConstraintId = 0;
    let maxLayerId = 1;

    for (const layer of layers) {
      const layerNumber = parseInt(layer.id.replace("layer_", ""), 10);
      if (!isNaN(layerNumber) && layerNumber > maxLayerId) {
        maxLayerId = layerNumber;
      }
      for (const element of layer.elements) {
        const n = parseInt(element.id.replace("el_", ""), 10);
        if (!isNaN(n) && n > maxElementId) {
          maxElementId = n;
        }
      }
      for (const constraint of layer.constraints) {
        const n = parseInt(constraint.id.replace("cst_", ""), 10);
        if (!isNaN(n) && n > maxConstraintId) {
          maxConstraintId = n;
        }
      }
    }

    this.nextId = maxElementId + 1;
    this.nextConstraintId = maxConstraintId + 1;
    this.nextLayerId = maxLayerId + 1;
  }
}

export const EDITOR_STATE = new EditorState();
