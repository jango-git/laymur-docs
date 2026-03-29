/**
 * ElementsTab.ts
 *
 * Elements tab: add form + element list + preview sync.
 */

import type { PreviewBridge } from "../bridge/PreviewBridge";
import { ELEMENT_REGISTRY } from "../registry/element-registry";
import { makeSortable } from "../sortable";
import type { EditorState } from "../state";
import type { AssetMeta } from "../types";
import { EUIElementAddForm } from "../ui/EUIElementAddForm/EUIElementAddForm";
import {
  EUIElementCard,
  type ElementCardCallbacks,
  type ElementCardContext,
} from "../ui/EUIElementCard/EUIElementCard";

export interface ElementsTabCallbacks {
  onElementDeleted: (id: string) => void;
  onElementsChange: () => void;
}

export class ElementsTab {
  private activeElementCards: EUIElementCard[] = [];
  private readonly elementAddForm: EUIElementAddForm;

  constructor(
    private readonly editorState: EditorState,
    private readonly bridge: PreviewBridge,
    private readonly callbacks: Partial<ElementsTabCallbacks> = {},
  ) {
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

          if (type === "UIImage") {
            const assetId = fieldValues.assetId as string;
            const asset = this.editorState.assets[assetId] as AssetMeta | undefined;
            if (asset !== undefined) {
              console.debug("[ElementsTab] bridge.addImage id=%s layerId=%s", id, layer.id);
              this.bridge.addImage(id, layer.id, asset.dataURL);
            } else {
              console.warn("[ElementsTab] addImage skipped - no asset for id=%s", assetId);
            }
          }

          this.render();
          this.callbacks.onElementsChange?.();
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
      onAssetFieldChange: (elementId, fieldKey, newAssetId, dataURL) => {
        console.debug(
          "[ElementsTab] asset field change elementId=%s fieldKey=%s assetId=%s",
          elementId,
          fieldKey,
          newAssetId,
        );
        this.bridge.setElementTexture(elementId, this.editorState.activeLayer().id, dataURL);
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
      this.callbacks.onElementsChange?.();
    });
  }

  private deleteElement(id: string): void {
    this.callbacks.onElementDeleted?.(id);
    const layer = this.editorState.activeLayer();
    console.debug("[ElementsTab] delete element id=%s layerId=%s", id, layer.id);
    layer.elements = layer.elements.filter((e) => e.id !== id);
    this.bridge.removeElement(id, layer.id);
    this.render();
    this.callbacks.onElementsChange?.();
  }
}
