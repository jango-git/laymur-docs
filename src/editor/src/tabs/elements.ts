/**
 * elements.ts
 *
 * Elements tab: add form + element list + preview sync.
 */

import type { PreviewBridge } from "../bridge/PreviewBridge";
import { ELEMENT_REGISTRY } from "../registry/element-registry";
import { makeSortable } from "../sortable";
import type { EditorState } from "../state";
import { EUIElementAddForm } from "../ui/EUIElementAddForm/EUIElementAddForm";
import type {
  EUIElementCard,
  ElementCardCallbacks,
  ElementCardContext,
} from "../ui/EUIElementCard/EUIElementCard";
import { EUIElementCardGeneric } from "../ui/EUIElementCard/EUIElementCardGeneric";
import { EUIElementCardUIImage } from "../ui/EUIElementCard/EUIElementCardUIImage";

export class ElementsTab {
  private readonly editorState: EditorState;
  private readonly bridge: PreviewBridge;
  private readonly onElementDeleted: (id: string) => void;
  private readonly onElementsChange: () => void;
  private activeElementCards: EUIElementCard[] = [];
  private readonly elementAddForm: EUIElementAddForm | null = null;

  constructor(
    editorState: EditorState,
    bridge: PreviewBridge,
    callbacks: { onElementDeleted?: (id: string) => void; onElementsChange?: () => void } = {},
  ) {
    this.editorState = editorState;
    this.bridge = bridge;
    this.onElementDeleted = callbacks.onElementDeleted ?? (() => {});
    this.onElementsChange = callbacks.onElementsChange ?? (() => {});

    this.elementAddForm = new EUIElementAddForm(
      {
        getAssets: () => this.editorState.assets,
        isNameAvailable: (name) =>
          !this.editorState.isNameTaken(name, this.editorState.activeLayer()),
      },
      {
        onAdd: ({ type, name, fieldValues }) => {
          if (!ELEMENT_REGISTRY.has(type)) {return;}

          const id = this.editorState.generateId();
          const layer = this.editorState.activeLayer();
          layer.elements.push({ id, type, name, fieldValues });

          if (type === "UIImage") {
            const dataURL = this.editorState.assets[fieldValues.assetId as string]?.dataURL;
            if (dataURL) {this.bridge.addImage(id, layer.id, dataURL);}
          }

          this.render();
          this.onElementsChange();
        },
      },
    );
  }

  // ─── Public ───────────────────────────────────────────────────────────────

  public refreshAddForm(): void {
    this.elementAddForm?.refresh();
  }

  public render(): void {
    for (const card of this.activeElementCards) {
      card.destroy();
    }
    this.activeElementCards = [];

    const list = document.getElementById("elements-list") as HTMLElement;
    list.innerHTML = "";

    const elements = this.editorState.activeLayer().elements;

    if (elements.length === 0) {
      const p = document.createElement("p");
      p.className = "placeholder-text";
      p.textContent = "No elements. Add one below.";
      list.appendChild(p);
      return;
    }

    const callbacks: ElementCardCallbacks = {
      onDelete: (id) => {
        this.onElementDeleted(id);
        const layer = this.editorState.activeLayer();
        layer.elements = layer.elements.filter((e) => e.id !== id);
        this.bridge.removeElement(id, layer.id);
        this.render();
        this.onElementsChange();
      },
      onTextureChange: (elementId, _newAssetId, dataURL) => {
        this.bridge.setElementTexture(elementId, this.editorState.activeLayer().id, dataURL);
      },
    };

    const context: ElementCardContext = {
      isNameAvailable: (name, excludeElementId) =>
        !this.editorState.isNameTaken(name, this.editorState.activeLayer(), { excludeElementId }),
      getAssets: () => this.editorState.assets,
    };

    for (const element of elements) {
      const CardClass =
        element.type === "UIImage" ? EUIElementCardUIImage : EUIElementCardGeneric;
      this.activeElementCards.push(new CardClass(list, element, callbacks, context));
    }

    makeSortable(list, (fromIndex, toIndex) => {
      const layer = this.editorState.activeLayer();
      const [moved] = layer.elements.splice(fromIndex, 1);
      layer.elements.splice(toIndex, 0, moved);
      this.bridge.reorderElements(
        layer.id,
        layer.elements.map((e) => e.id),
      );
      this.render();
      this.onElementsChange();
    });
  }
}
