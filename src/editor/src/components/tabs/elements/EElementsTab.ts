import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { EStoreDeltaOperation } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EAnyElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EElementUUID, ELayerUUID } from "../../../document/types.misc";
import { EAnimatedImageElementBuilder } from "../../builders/elements/EAnimatedImageElementBuilder";
import { EGraphicsElementBuilder } from "../../builders/elements/EGraphicsElementBuilder";
import { EImageElementBuilder } from "../../builders/elements/EImageElementBuilder";
import { ENineSliceElementBuilder } from "../../builders/elements/ENineSliceElementBuilder";
import { EProgressElementBuilder } from "../../builders/elements/EProgressElementBuilder";
import { ESceneElementBuilder } from "../../builders/elements/ESceneElementBuilder";
import { ETextElementBuilder } from "../../builders/elements/ETextElementBuilder";
import { EAnimatedImageElementCard } from "../../cards/elements/EAnimatedImageElementCard";
import { EGraphicsElementCard } from "../../cards/elements/EGraphicsElementCard";
import { EImageElementCard } from "../../cards/elements/EImageElementCard";
import { ENineSliceElementCard } from "../../cards/elements/ENineSliceElementCard";
import { EProgressElementCard } from "../../cards/elements/EProgressElementCard";
import { ESceneElementCard } from "../../cards/elements/ESceneElementCard";
import { ETextElementCard } from "../../cards/elements/ETextElementCard";

const ELEMENT_TYPE_OPTIONS = [
  { label: "Image", value: EElementType.IMAGE },
  { label: "Animated Image", value: EElementType.ANIMATED_IMAGE },
  { label: "Graphics", value: EElementType.GRAPHICS },
  { label: "Nine Slice", value: EElementType.NINE_SLICE },
  { label: "Progress", value: EElementType.PROGRESS },
  { label: "Scene", value: EElementType.SCENE },
  { label: "Text", value: EElementType.TEXT },
];

export class EElementsTab {
  private readonly cardList: HTMLElement;
  private readonly cardMap = new Map<EElementUUID, HTMLElement>();

  constructor(container: HTMLElement) {
    const cardList = container.querySelector<HTMLElement>("#elements-content");
    if (!cardList) {
      throw new Error("[EElementsTab] #elements-content not found");
    }
    this.cardList = cardList;

    // ── Builder section ──────────────────────────────────────────────────────
    const builderSection = document.createElement("div");
    builderSection.className = "tab-builder";
    container.appendChild(builderSection);

    const typeRow = document.createElement("div");
    typeRow.className = "tab-builder__type-row";
    const typeLabel = document.createElement("span");
    typeLabel.className = "tab-builder__type-label";
    typeLabel.textContent = "Type";
    typeRow.appendChild(typeLabel);
    builderSection.appendChild(typeRow);

    const typeSelect = new ESelectControl<EElementType>(typeRow, {
      options: ELEMENT_TYPE_OPTIONS,
      value: EElementType.IMAGE,
    });

    const builderDivs = new Map<EElementType, HTMLElement>();
    for (const { value: type } of ELEMENT_TYPE_OPTIONS) {
      const div = document.createElement("div");
      div.style.display = type === EElementType.IMAGE ? "" : "none";
      builderSection.appendChild(div);
      builderDivs.set(type, div);
    }

    new EImageElementBuilder(builderDivs.get(EElementType.IMAGE)!);
    new EAnimatedImageElementBuilder(builderDivs.get(EElementType.ANIMATED_IMAGE)!);
    new EGraphicsElementBuilder(builderDivs.get(EElementType.GRAPHICS)!);
    new ENineSliceElementBuilder(builderDivs.get(EElementType.NINE_SLICE)!);
    new EProgressElementBuilder(builderDivs.get(EElementType.PROGRESS)!);
    new ESceneElementBuilder(builderDivs.get(EElementType.SCENE)!);
    new ETextElementBuilder(builderDivs.get(EElementType.TEXT)!);

    typeSelect.signalValueChanged.on((newType) => {
      for (const [type, div] of builderDivs) {
        div.style.display = type === newType ? "" : "none";
      }
    });

    // ── Signals ──────────────────────────────────────────────────────────────
    STORE.signals.elements.list.on((delta) => {
      if (delta.operation === EStoreDeltaOperation.ADD) {
        if (delta.layerUuid === STORE.currentLayerUuid) {
          this.addCard(delta.element);
        }
      } else if (delta.operation === EStoreDeltaOperation.REMOVE) {
        if (delta.layerUuid === STORE.currentLayerUuid) {
          this.removeCard(delta.uuid);
        }
      }
    });

    STORE.currentLayerChanged.on((uuid) => {
      this.reloadForLayer(uuid);
    });
  }

  private addCard(element: EAnyElement): void {
    const wrapper = document.createElement("div");
    wrapper.dataset.uuid = element.uuid;
    this.cardList.appendChild(wrapper);

    switch (element.type) {
      case EElementType.IMAGE:
        new EImageElementCard(wrapper, element.uuid);
        break;
      case EElementType.ANIMATED_IMAGE:
        new EAnimatedImageElementCard(wrapper, element.uuid);
        break;
      case EElementType.GRAPHICS:
        new EGraphicsElementCard(wrapper, element.uuid);
        break;
      case EElementType.NINE_SLICE:
        new ENineSliceElementCard(wrapper, element.uuid);
        break;
      case EElementType.PROGRESS:
        new EProgressElementCard(wrapper, element.uuid);
        break;
      case EElementType.SCENE:
        new ESceneElementCard(wrapper, element.uuid);
        break;
      case EElementType.TEXT:
        new ETextElementCard(wrapper, element.uuid);
        break;
    }

    this.cardMap.set(element.uuid, wrapper);
  }

  private removeCard(uuid: EElementUUID): void {
    this.cardMap.get(uuid)?.remove();
    this.cardMap.delete(uuid);
  }

  private reloadForLayer(layerUuid: ELayerUUID | null): void {
    for (const wrapper of this.cardMap.values()) {
      wrapper.remove();
    }
    this.cardMap.clear();

    if (layerUuid === null) {
      return;
    }

    const elements = STORE.selectors.elements.selectAll(layerUuid);
    if (elements) {
      for (const element of elements) {
        this.addCard(element);
      }
    }
  }
}
