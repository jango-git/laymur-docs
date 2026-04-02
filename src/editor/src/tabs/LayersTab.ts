/**
 * LayersTab.ts
 *
 * Layers tab: manage multiple UIFullscreenLayer instances.
 * Each layer has its own name, resize policy, elements, and constraints.
 * Only one layer is active (rendered) at a time.
 */

import type { PreviewBridge } from "../bridge/PreviewBridge";
import type { EditorBus } from "../events";
import { makeSortable } from "../miscellaneous/make-sortable";
import type { EditorState } from "../state";
import type { AssetMeta, LayerState, UITextStyleConfig } from "../types";
import { TEXT_STYLE_DEFAULTS } from "../types";
import { EUILayerAddForm } from "../ui/EUILayerAddForm/EUILayerAddForm";
import {
  EUILayerCard,
  type LayerCardCallbacks,
  type LayerCardContext,
} from "../ui/EUILayerCard/EUILayerCard";

export class LayersTab {
  private activeLayerCards: EUILayerCard[] = [];
  private activeLayerAddForm: EUILayerAddForm | null = null;

  constructor(
    private readonly editorState: EditorState,
    private readonly bridge: PreviewBridge,
    private readonly bus: EditorBus,
  ) {
    this.bridge.whenReady(() => {
      this.initializePreview();
    });
    this.bus.previewInitializing.on(() => {
      this.initializePreview();
    });
    this.bus.sceneLoaded.on(() => {
      this.render();
      this.renderAddForm();
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
        this.bus.layerChanged.emit(id);
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
        this.bus.layerChanged.emit(id);
      },
    });
  }

  private initializePreview(): void {
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
        const color = element.fieldValues.color as string | undefined;
        if (element.type === "UIImage") {
          const assetId = element.fieldValues.assetId as string;
          const asset = this.editorState.assets[assetId] as AssetMeta | undefined;
          if (asset !== undefined) {
            this.bridge.addImage(element.id, layer.id, asset.dataURL, color);
          }
        } else if (element.type === "UIText") {
          this.bridge.addText(
            element.id,
            layer.id,
            (element.fieldValues.content as string | undefined) ?? "",
            (element.fieldValues.resizeMode as number | undefined) ?? 1,
            (element.fieldValues.maxLineWidth as number | undefined) ?? 1024,
            (element.fieldValues.padding as number | undefined) ?? 0,
            styleFromFieldValues(element.fieldValues),
            color,
          );
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
    this.bus.previewInitialized.emit(this.editorState.activeLayerId);
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
    this.bus.layerChanged.emit(this.editorState.activeLayerId);
  }
}

function styleFromFieldValues(fieldValues: Record<string, unknown>): UITextStyleConfig {
  return {
    color: (fieldValues.style_color as string | undefined) ?? TEXT_STYLE_DEFAULTS.color,
    align:
      (fieldValues.style_align as UITextStyleConfig["align"] | undefined) ??
      TEXT_STYLE_DEFAULTS.align,
    fontFamily:
      (fieldValues.style_fontFamily as string | undefined) ?? TEXT_STYLE_DEFAULTS.fontFamily,
    fontSize: (fieldValues.style_fontSize as number | undefined) ?? TEXT_STYLE_DEFAULTS.fontSize,
    fontStyle:
      (fieldValues.style_fontStyle as UITextStyleConfig["fontStyle"] | undefined) ??
      TEXT_STYLE_DEFAULTS.fontStyle,
    fontWeight:
      (fieldValues.style_fontWeight as UITextStyleConfig["fontWeight"] | undefined) ??
      TEXT_STYLE_DEFAULTS.fontWeight,
    lineHeight:
      (fieldValues.style_lineHeight as number | undefined) ?? TEXT_STYLE_DEFAULTS.lineHeight,
    enableShadow:
      (fieldValues.style_enableShadow as boolean | undefined) ?? TEXT_STYLE_DEFAULTS.enableShadow,
    shadowOffsetX:
      (fieldValues.style_shadowOffsetX as number | undefined) ?? TEXT_STYLE_DEFAULTS.shadowOffsetX,
    shadowOffsetY:
      (fieldValues.style_shadowOffsetY as number | undefined) ?? TEXT_STYLE_DEFAULTS.shadowOffsetY,
    shadowBlur:
      (fieldValues.style_shadowBlur as number | undefined) ?? TEXT_STYLE_DEFAULTS.shadowBlur,
    shadowColor:
      (fieldValues.style_shadowColor as string | undefined) ?? TEXT_STYLE_DEFAULTS.shadowColor,
    enableStroke:
      (fieldValues.style_enableStroke as boolean | undefined) ?? TEXT_STYLE_DEFAULTS.enableStroke,
    strokeColor:
      (fieldValues.style_strokeColor as string | undefined) ?? TEXT_STYLE_DEFAULTS.strokeColor,
    strokeThickness:
      (fieldValues.style_strokeThickness as number | undefined) ??
      TEXT_STYLE_DEFAULTS.strokeThickness,
  };
}
