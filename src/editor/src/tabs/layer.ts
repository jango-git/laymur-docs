/**
 * layer.ts
 *
 * Layers tab: manage multiple UIFullscreenLayer instances.
 * Each layer has its own name, resize policy, elements, and constraints.
 * Only one layer is active (rendered) at a time.
 */

import type { PreviewBridge } from "../bridge/PreviewBridge";
import { makeSortable } from "../sortable";
import type { EditorState } from "../state";
import type { LayerState } from "../types";
import { EUILayerAddForm } from "../ui/EUILayerAddForm/EUILayerAddForm";
import type { LayerCardCallbacks, LayerCardContext } from "../ui/EUILayerCard/EUILayerCard";
import { EUILayerCardDefault } from "../ui/EUILayerCard/EUILayerCardDefault";

export class LayerTab {
  private readonly editorState: EditorState;
  private readonly bridge: PreviewBridge;
  private readonly onLayerChange: () => void;
  private activeLayerCards: EUILayerCardDefault[] = [];
  private activeLayerAddForm: EUILayerAddForm | null = null;

  constructor(
    editorState: EditorState,
    bridge: PreviewBridge,
    callbacks: { onLayerChange?: () => void } = {},
  ) {
    this.editorState = editorState;
    this.bridge = bridge;
    this.onLayerChange = callbacks.onLayerChange ?? (() => {});

    this.bridge.whenReady(() => this._initializePreview());
  }

  // ─── Public ───────────────────────────────────────────────────────────────

  public initializePreview(): void {
    this._initializePreview();
  }

  public render(): void {
    for (const card of this.activeLayerCards) {
      card.destroy();
    }
    this.activeLayerCards = [];

    const container = document.getElementById("layers-list");
    if (!container) {return;}
    container.innerHTML = "";

    const callbacks: LayerCardCallbacks = {
      onActivate: (id) => {
        this.editorState.activeLayerId = id;
        this.bridge.setActiveLayer(id);
        this.render();
        this.onLayerChange();
      },
      onDelete: (id) => {
        const index = this.editorState.layers.findIndex((l) => l.id === id);
        if (index === -1) {return;}
        this.editorState.layers.splice(index, 1);
        if (this.editorState.activeLayerId === id) {
          const next = this.editorState.layers[Math.max(0, index - 1)];
          this.editorState.activeLayerId = next.id;
          this.bridge.setActiveLayer(next.id);
        }
        this.bridge.removeLayer(id);
        this.render();
        this.onLayerChange();
      },
      onConfigUpdate: (layer) => this.bridge.setLayerConfig(layer),
    };

    for (const layer of this.editorState.layers) {
      const context: LayerCardContext = {
        isActive: layer.id === this.editorState.activeLayerId,
        canDelete: this.editorState.layers.length > 1,
        isNameAvailable: (name, excludeLayerId) =>
          !this.editorState.layers.some((l) => l.id !== excludeLayerId && l.name === name),
      };

      const card = new EUILayerCardDefault(container, layer, context, callbacks);
      this.activeLayerCards.push(card);
    }

    if (this.editorState.layers.length > 1) {
      makeSortable(container, (fromIndex, toIndex) => {
        const [moved] = this.editorState.layers.splice(fromIndex, 1);
        this.editorState.layers.splice(toIndex, 0, moved);
        this.render();
      });
    }
  }

  public renderAddForm(): void {
    this.activeLayerAddForm?.destroy();

    const container = document.getElementById("add-layer-row");
    if (!container) {return;}

    this.activeLayerAddForm = new EUILayerAddForm(
      container,
      { isNameAvailable: (name) => !this.editorState.layers.some((l) => l.name === name) },
      {
        onAdd: ({ name, policyType, policyParams }) => {
          const id = this.editorState.generateLayerId();
          const newLayer: LayerState = {
            id,
            name,
            policyType,
            policyParams,
            elements: [],
            constraints: [],
          };
          this.editorState.layers.push(newLayer);
          this.editorState.activeLayerId = id;
          this.bridge.addLayer(newLayer);
          this.bridge.setActiveLayer(id);
          this.render();
          this.renderAddForm();
          this.onLayerChange();
        },
      },
    );
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private _initializePreview(): void {
    for (const layer of this.editorState.layers) {
      this.bridge.addLayer(layer);
    }
    this.bridge.setActiveLayer(this.editorState.activeLayerId);
  }
}
