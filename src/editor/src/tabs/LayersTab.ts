/**
 * LayersTab.ts
 *
 * Layers tab: manage multiple UIFullscreenLayer instances.
 * Each layer has its own name, resize policy, elements, and constraints.
 * Only one layer is active (rendered) at a time.
 */

import type { PreviewBridge } from "../bridge/PreviewBridge";
import { makeSortable } from "../sortable";
import type { EditorState } from "../state";
import type { AssetMeta, LayerState } from "../types";
import { EUILayerAddForm } from "../ui/EUILayerAddForm/EUILayerAddForm";
import {
  EUILayerCard,
  type LayerCardCallbacks,
  type LayerCardContext,
} from "../ui/EUILayerCard/EUILayerCard";

export interface LayersTabCallbacks {
  onLayerChange: () => void;
}

export class LayersTab {
  private activeLayerCards: EUILayerCard[] = [];
  private activeLayerAddForm: EUILayerAddForm | null = null;

  constructor(
    private readonly editorState: EditorState,
    private readonly bridge: PreviewBridge,
    private readonly callbacks: Partial<LayersTabCallbacks> = {},
  ) {
    this.bridge.whenReady(() => {
      this.initializePreview();
    });
  }

  public render(): void {
    for (const card of this.activeLayerCards) {
      card.destroy();
    }
    this.activeLayerCards = [];

    const container = document.getElementById("layers-list");
    if (container === null) {
      return;
    }
    container.innerHTML = "";

    const callbacks: LayerCardCallbacks = {
      onActivate: (id) => {
        console.debug("[LayersTab] activate layer id=%s", id);
        this.editorState.activeLayerId = id;
        this.bridge.setActiveLayer(id);
        this.render();
        this.callbacks.onLayerChange?.();
      },
      onDelete: (id) => {
        this.deleteLayer(id);
      },
      onConfigUpdate: (layer) => {
        this.bridge.updateLayer(layer);
      },
    };

    for (const layer of this.editorState.layers) {
      const context: LayerCardContext = {
        isActive: layer.id === this.editorState.activeLayerId,
        canDelete: this.editorState.layers.length > 1,
        isNameAvailable: (name, excludeLayerId) =>
          !this.editorState.layers.some((l) => l.id !== excludeLayerId && l.name === name),
      };

      const card = new EUILayerCard(container, layer, context, callbacks);
      this.activeLayerCards.push(card);
    }

    if (this.editorState.layers.length > 1) {
      makeSortable(container, (fromIndex, toIndex) => {
        console.debug("[LayersTab] reorder layer from=%d to=%d", fromIndex, toIndex);
        const [moved] = this.editorState.layers.splice(fromIndex, 1);
        this.editorState.layers.splice(toIndex, 0, moved);
        this.render();
      });
    }
  }

  public renderAddForm(): void {
    this.activeLayerAddForm?.destroy();

    const container = document.getElementById("add-layer-row");
    if (container === null) {
      return;
    }

    this.activeLayerAddForm = new EUILayerAddForm(container, {
      isNameAvailable: (name): boolean => !this.editorState.layers.some((l) => l.name === name),
      onLayerAdded: ({ name, policyType, policyParameters: policyParams }): void => {
        const id = this.editorState.generateLayerId();
        console.debug("[LayersTab] add layer id=%s name=%s policyType=%s", id, name, policyType);
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
        this.callbacks.onLayerChange?.();
      },
    });
  }

  public initializePreview(): void {
    console.debug(
      "[LayersTab] initializePreview: layers=%o",
      this.editorState.layers.map((l) => l.id),
    );
    this.bridge.resetScene();
    for (const layer of this.editorState.layers) {
      this.bridge.addLayer(layer);
    }
    this.bridge.setActiveLayer(this.editorState.activeLayerId);
    for (const layer of this.editorState.layers) {
      for (const element of layer.elements) {
        if (element.type === "UIImage") {
          const assetId = element.fieldValues.assetId as string;
          const asset = this.editorState.assets[assetId] as AssetMeta | undefined;
          if (asset !== undefined) {
            this.bridge.addImage(element.id, layer.id, asset.dataURL);
          }
        }
      }
      for (const constraint of layer.constraints) {
        this.bridge.addConstraint(
          constraint.id,
          layer.id,
          constraint.constraintType,
          constraint.fieldValues,
        );
      }
    }
  }

  private deleteLayer(id: string): void {
    const index = this.editorState.layers.findIndex((l) => l.id === id);
    if (index === -1) {
      return;
    }
    console.debug("[LayersTab] delete layer id=%s index=%d", id, index);
    this.editorState.layers.splice(index, 1);
    if (this.editorState.activeLayerId === id) {
      const next = this.editorState.layers[Math.max(0, index - 1)];
      this.editorState.activeLayerId = next.id;
      this.bridge.setActiveLayer(next.id);
    }
    this.bridge.removeLayer(id);
    this.render();
    this.callbacks.onLayerChange?.();
  }
}
