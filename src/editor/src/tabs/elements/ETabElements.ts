import type { PreviewBridge } from "../../bridge/PreviewBridge";
import type { EBuilderForm } from "../../builder/EBuilder";
import { EBuilder } from "../../builder/EBuilder";
import { buildAssetRow, buildStringRow } from "../../builder/form-helpers";
import type { ECardUIImageModel } from "../../cards/element/ECardUIImage";
import type { EAssetControlItem } from "../../controls/EAssetControl/EAssetControl";
import type { EditorBus } from "../../events";
import { makeSortable } from "../../miscellaneous/make-sortable";
import type { EditorState } from "../../state";
import type { UIElement, UIElementType } from "./registry";
import { DEFAULT_COLOR, ELEMENT_HANDLERS } from "./registry";

interface UIImageBuilderModel {
  name: string;
  texture: EAssetControlItem;
}

export class ETabElements {
  private readonly elementsByLayer = new Map<string, UIElement[]>();
  private activeCards: {
    id: string;
    card: ReturnType<typeof ELEMENT_HANDLERS.UIImage.createCard>;
  }[] = [];

  private readonly root: HTMLDivElement;
  private readonly list: HTMLDivElement;
  private readonly builder: EBuilder<UIElementType, UIImageBuilderModel>;

  constructor(
    container: HTMLElement,
    private readonly editorState: EditorState,
    private readonly bridge: PreviewBridge,
    private readonly bus: EditorBus,
  ) {
    this.root = document.createElement("div");
    this.root.className = "tab-elements";

    this.list = document.createElement("div");
    this.list.className = "tab-elements__list";
    this.root.appendChild(this.list);

    const builderWrap = document.createElement("div");
    builderWrap.className = "tab-elements__builder";
    this.root.appendChild(builderWrap);

    this.builder = new EBuilder<UIElementType, UIImageBuilderModel>(
      builderWrap,
      [
        {
          label: "UI Image",
          value: "UIImage",
          buildForm: (c, onChange) => this.buildUIImageForm(c, onChange),
        },
      ],
      (type, model) => this.validateBuilderModel(type, model),
    );

    container.appendChild(this.root);

    this.builder.signalAddRequested.on(({ type, model }) => {
      this.handleAdd(type, model);
    });

    this.bus.layerChanged.on(() => this.render());
    this.bus.sceneLoaded.on(() => {
      this.elementsByLayer.clear();
      this.render();
    });
  }

  public render(): void {
    for (const { card } of this.activeCards) {
      card.destroy();
    }
    this.activeCards = [];
    this.list.innerHTML = "";

    const elements = this.currentElements;

    if (elements.length === 0) {
      const placeholder = document.createElement("p");
      placeholder.className = "placeholder-text";
      placeholder.textContent = "No elements. Add one below.";
      this.list.appendChild(placeholder);
      return;
    }

    const layerId = this.editorState.activeLayer().id;

    for (const element of elements) {
      const card = ELEMENT_HANDLERS.UIImage.createCard(this.list, element, () =>
        this.fetchTextures(),
      );

      card.signalModelChanged.on((next, prev) => {
        element.model = next;
        ELEMENT_HANDLERS.UIImage.onModelChange(element.id, layerId, prev, next, this.bridge);
      });

      card.signalDeleteRequested.on(() => {
        this.deleteElement(element.id, layerId);
      });

      this.activeCards.push({ id: element.id, card });
    }

    makeSortable(this.list, (fromIndex, toIndex) => {
      const [moved] = elements.splice(fromIndex, 1);
      elements.splice(toIndex, 0, moved);
      this.bridge.reorderElements(
        layerId,
        elements.map((e) => e.id),
      );
      this.render();
      this.bus.elementsChanged.emit();
    });
  }

  public destroy(): void {
    for (const { card } of this.activeCards) {
      card.destroy();
    }
    this.builder.destroy();
    this.root.remove();
  }

  private get currentElements(): UIElement[] {
    const layerId = this.editorState.activeLayer().id;
    if (!this.elementsByLayer.has(layerId)) {
      this.elementsByLayer.set(layerId, []);
    }
    return this.elementsByLayer.get(layerId)!;
  }

  private fetchTextures(): EAssetControlItem[] {
    return Object.values(this.editorState.assets)
      .filter((a) => a.assetType === "image")
      .map((a) => ({ name: a.name, thumbnail: a.dataURL }));
  }

  private validateBuilderModel(type: UIElementType, model: UIImageBuilderModel): string | null {
    if (type === "UIImage") {
      if (model.name.trim() === "") {
        return "Name is required";
      }
      if (this.currentElements.some((e) => e.name === model.name)) {
        return "Name already taken";
      }
      if (model.texture.thumbnail === "") {
        return "Texture is required";
      }
    }
    return null;
  }

  private buildUIImageForm(
    container: HTMLElement,
    onChange: () => void,
  ): EBuilderForm<UIImageBuilderModel> {
    const name = buildStringRow(container, "Name", onChange, { placeholder: "element name" });
    const texture = buildAssetRow(container, "Texture", onChange, () => this.fetchTextures());
    return {
      getModel: () => ({
        name: name.getValue(),
        texture: texture.getValue() ?? { name: "", thumbnail: "" },
      }),
      reset: () => {
        name.reset();
        texture.reset();
      },
      destroy: () => {
        name.destroy();
        texture.destroy();
      },
    };
  }

  private handleAdd(type: UIElementType, model: UIImageBuilderModel): void {
    const id = crypto.randomUUID();
    const layerId = this.editorState.activeLayer().id;
    const elementModel: ECardUIImageModel = { color: DEFAULT_COLOR, texture: model.texture };
    const element: UIElement = { id, type, name: model.name, model: elementModel };

    this.currentElements.push(element);
    ELEMENT_HANDLERS.UIImage.onAdd(id, layerId, elementModel, this.bridge);

    this.render();
    this.bus.elementsChanged.emit();
  }

  private deleteElement(id: string, layerId: string): void {
    const elements = this.currentElements;
    const index = elements.findIndex((e) => e.id === id);
    if (index === -1) {
      return;
    }
    elements.splice(index, 1);
    this.bridge.removeElement(id, layerId);
    this.render();
    this.bus.elementDeleted.emit(id);
    this.bus.elementsChanged.emit();
  }
}
