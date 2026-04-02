/**
 * ElementsTab.ts
 *
 * Elements tab: add form + element list + preview sync.
 */

import type { PreviewBridge } from "../bridge/PreviewBridge";
import type { EditorBus } from "../events";
import { makeSortable } from "../miscellaneous/make-sortable";
import { ELEMENT_REGISTRY } from "../registry/element-registry";
import type { EditorState } from "../state";
import type { AssetMeta, UITextStyleConfig } from "../types";
import { TEXT_STYLE_DEFAULTS } from "../types";
import { EUIElementAddForm } from "../ui/EUIElementAddForm/EUIElementAddForm";
import {
  EUIElementCard,
  type ElementCardCallbacks,
  type ElementCardContext,
} from "../ui/EUIElementCard/EUIElementCard";

export class ElementsTab {
  private activeElementCards: EUIElementCard[] = [];
  private readonly elementAddForm: EUIElementAddForm;

  constructor(
    private readonly editorState: EditorState,
    private readonly bridge: PreviewBridge,
    private readonly bus: EditorBus,
  ) {
    this.bus.layerChanged.on(() => this.render());
    this.bus.assetsChanged.on(() => this.refreshAddForm());
    this.bus.sceneLoaded.on(() => {
      this.render();
      this.refreshAddForm();
    });
    this.elementAddForm = new EUIElementAddForm(
      {
        getAssets: (): EditorState["assets"] => this.editorState.assets,
        isNameAvailable: (name): boolean =>
          !this.editorState.isLayerChildNameTaken(name, this.editorState.activeLayer()),
      },
      {
        onAdd: ({ type, name, fieldValues }): void => {
          if (!ELEMENT_REGISTRY.has(type)) {
            return;
          }
          const id = this.editorState.generateId();
          const layer = this.editorState.activeLayer();
          console.debug("[ElementsTab] add element id=%s type=%s layerId=%s", id, type, layer.id);
          layer.elements.push({ id, type, name, fieldValues });

          const color = fieldValues.color as string | undefined;
          if (type === "UIImage") {
            const assetId = fieldValues.assetId as string;
            const asset = this.editorState.assets[assetId] as AssetMeta | undefined;
            if (asset !== undefined) {
              console.debug("[ElementsTab] bridge.addImage id=%s layerId=%s", id, layer.id);
              this.bridge.addImage(id, layer.id, asset.dataURL, color);
            } else {
              console.warn("[ElementsTab] addImage skipped - no asset for id=%s", assetId);
            }
          } else if (type === "UIText") {
            this.bridge.addText(
              id,
              layer.id,
              (fieldValues.content as string | undefined) ?? "",
              (fieldValues.resizeMode as number | undefined) ?? 1,
              (fieldValues.maxLineWidth as number | undefined) ?? 1024,
              (fieldValues.padding as number | undefined) ?? 0,
              styleFromFieldValues(fieldValues),
              color,
            );
          }

          this.render();
          this.bus.elementsChanged.emit();
        },
      },
    );
  }

  public refreshAddForm(): void {
    this.elementAddForm.refresh();
  }

  public render(): void {
    for (const card of this.activeElementCards) {
      card.destroy();
    }
    this.activeElementCards = [];

    const list = document.getElementById("elements-list");
    if (list === null) {
      return;
    }
    list.innerHTML = "";

    const elements = this.editorState.activeLayer().elements;

    if (elements.length === 0) {
      const placeholder = document.createElement("p");
      placeholder.className = "placeholder-text";
      placeholder.textContent = "No elements. Add one below.";
      list.appendChild(placeholder);
      return;
    }

    const callbacks: ElementCardCallbacks = {
      onDelete: (id) => {
        this.deleteElement(id);
      },
      onImageTextureChange: (elementId, fieldKey, newAssetId, dataURL) => {
        console.debug(
          "[ElementsTab] image texture change elementId=%s fieldKey=%s assetId=%s",
          elementId,
          fieldKey,
          newAssetId,
        );
        this.bridge.setImageTexture(elementId, this.editorState.activeLayer().id, dataURL);
      },
      onColorFieldChange: (elementId, color) => {
        console.debug("[ElementsTab] color field change elementId=%s color=%s", elementId, color);
        this.bridge.setElementColor(elementId, this.editorState.activeLayer().id, color);
      },
      onFieldChange: (elementId) => {
        const layer = this.editorState.activeLayer();
        const element = layer.elements.find((e) => e.id === elementId);
        if (element === undefined) {
          return;
        }
        if (element.type === "UIText") {
          this.bridge.setTextConfig(
            elementId,
            layer.id,
            (element.fieldValues.content as string | undefined) ?? "",
            (element.fieldValues.resizeMode as number | undefined) ?? 0,
            (element.fieldValues.maxLineWidth as number | undefined) ?? 1024,
            (element.fieldValues.padding as number | undefined) ?? 0,
            styleFromFieldValues(element.fieldValues),
          );
        }
      },
    };

    const context: ElementCardContext = {
      isNameAvailable: (name, excludeElementId): boolean =>
        !this.editorState.isLayerChildNameTaken(name, this.editorState.activeLayer(), {
          excludeElementId,
        }),
      getAssets: (): EditorState["assets"] => this.editorState.assets,
    };

    for (const element of elements) {
      this.activeElementCards.push(new EUIElementCard(list, element, callbacks, context));
    }

    makeSortable(list, (fromIndex, toIndex) => {
      console.debug("[ElementsTab] reorder element from=%d to=%d", fromIndex, toIndex);
      const layer = this.editorState.activeLayer();
      const [moved] = layer.elements.splice(fromIndex, 1);
      layer.elements.splice(toIndex, 0, moved);
      this.bridge.reorderElements(
        layer.id,
        layer.elements.map((e) => e.id),
      );
      this.render();
      this.bus.elementsChanged.emit();
    });
  }

  private deleteElement(id: string): void {
    const layer = this.editorState.activeLayer();
    console.debug("[ElementsTab] delete element id=%s layerId=%s", id, layer.id);
    layer.elements = layer.elements.filter((e) => e.id !== id);
    this.bridge.removeElement(id, layer.id);
    this.render();
    this.bus.elementDeleted.emit(id);
    this.bus.elementsChanged.emit();
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
