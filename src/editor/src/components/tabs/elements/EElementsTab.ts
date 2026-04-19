import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { EStoreDeltaOperation } from "../../../document/signals";
import type { EStoreDeltaElementList } from "../../../document/signals/elements";
import { STORE } from "../../../document/store";
import type { EAnyElement, EElementType } from "../../../document/types.elements";
import type { UUID } from "../../../document/types.misc";
import { consoleDebug } from "../../../miscellaneous/debug.print";
import { makeSortable } from "../../../miscellaneous/make-sortable";
import { UI_STATE } from "../../../ui-state/EUIState";
import type { EAnyElementBuilder } from "../../builders/elements/types";
import type { ElementEntry } from "./registry";
import { DEFAULT_BUILDER_TYPE, ELEMENT_REGISTRY } from "./registry";

export class EElementsTab {
  private readonly cardsContentDiv: HTMLDivElement;
  private readonly cardUuidToCardContainer = new Map<UUID, HTMLElement>();
  private currentLayerUuid: UUID | undefined;

  private readonly builderContainers = new Map<EElementType, HTMLElement>();
  private readonly builders = new Map<EElementType, EAnyElementBuilder>();
  private readonly cardFactories = new Map<EElementType, ElementEntry["createCard"]>();

  private activeBuilder?: EAnyElementBuilder;
  private readonly addButton: HTMLButtonElement;

  constructor(private readonly container: HTMLElement) {
    {
      const scrollArea = document.createElement("div");
      scrollArea.className = "tab-scroll-area";
      this.container.appendChild(scrollArea);

      this.cardsContentDiv = document.createElement("div");
      this.cardsContentDiv.id = "elements-content";
      scrollArea.appendChild(this.cardsContentDiv);
    }

    const builderSection = document.createElement("div");
    builderSection.className = "tab-builder";
    this.container.appendChild(builderSection);

    for (const entry of ELEMENT_REGISTRY) {
      const div = document.createElement("div");
      div.style.display = entry.type === DEFAULT_BUILDER_TYPE ? "" : "none";
      builderSection.appendChild(div);

      this.builderContainers.set(entry.type, div);
      this.builders.set(entry.type, entry.createBuilder(div));
      this.cardFactories.set(entry.type, entry.createCard);
    }

    this.setActiveBuilder(DEFAULT_BUILDER_TYPE);

    const controlRow = document.createElement("div");
    controlRow.className = "tab-builder__control-row";
    builderSection.appendChild(controlRow);

    const builderTypeSelect = new ESelectControl<EElementType>(controlRow, {
      options: ELEMENT_REGISTRY.map(({ label, type }) => ({ label, value: type })),
      value: DEFAULT_BUILDER_TYPE,
    });

    this.addButton = document.createElement("button");
    this.addButton.className = "button-primary";
    this.addButton.textContent = "ADD";
    this.addButton.addEventListener("click", this.onAddButtonClicked);
    controlRow.appendChild(this.addButton);

    builderTypeSelect.signalValueChanged.on(this.onBuilderTypeChanged);
    STORE.signals.setup.on(this.onSetup);
    STORE.signals.elements.list.on(this.onCardListChanged);
    UI_STATE.signalActiveLayerChanged.on(this.onActiveLayerChanged);

    makeSortable(this.cardsContentDiv, (fromIndex, toIndex) => {
      if (this.currentLayerUuid === undefined) {
        return;
      }
      const uuids = [...this.cardsContentDiv.children].map(
        (el) => (el as HTMLElement).dataset.uuid ?? "",
      );
      const [moved] = uuids.splice(fromIndex, 1);
      uuids.splice(toIndex, 0, moved);
      STORE.commands.elements.reorder(this.currentLayerUuid, uuids);
    });

    const activeLayerUuid = UI_STATE.activeLayerUuid;
    if (activeLayerUuid !== undefined) {
      for (const element of STORE.selectors.elements.selectAll(activeLayerUuid)) {
        this.addCard(element);
      }
    }
  }

  private setActiveBuilder(type: EElementType): void {
    this.activeBuilder = this.builders.get(type) as EAnyElementBuilder;
  }

  private addCard(element: EAnyElement): void {
    const container = document.createElement("div");
    container.dataset.uuid = element.uuid;
    this.cardsContentDiv.appendChild(container);

    if (this.currentLayerUuid !== undefined) {
      this.cardFactories.get(element.type)?.(container, element.uuid, this.currentLayerUuid);
    }
    this.cardUuidToCardContainer.set(element.uuid, container);
  }

  private removeCard(uuid: UUID): void {
    this.cardUuidToCardContainer.get(uuid)?.remove();
    this.cardUuidToCardContainer.delete(uuid);
  }

  private reorderCards(uuids: UUID[]): void {
    for (const uuid of uuids) {
      const card = this.cardUuidToCardContainer.get(uuid);
      if (card !== undefined) {
        this.cardsContentDiv.appendChild(card);
      }
    }
  }

  private readonly onSetup = (): void => {
    consoleDebug("[EElementsTab] onSetup");
    this.onActiveLayerChanged(undefined);
  };

  private readonly onCardListChanged = (delta: EStoreDeltaElementList): void => {
    consoleDebug("[EElementsTab] onCardListChanged:", delta);
    if (delta.layerUuid !== UI_STATE.activeLayerUuid) {
      return;
    }

    switch (delta.operation) {
      case EStoreDeltaOperation.ADD:
        this.addCard(delta.element);
        break;
      case EStoreDeltaOperation.REMOVE:
        this.removeCard(delta.uuid);
        break;
      case EStoreDeltaOperation.REORDER:
        this.reorderCards(delta.uuids);
        break;
    }
  };

  private readonly onActiveLayerChanged = (uuid?: UUID): void => {
    consoleDebug("[EElementsTab] onActiveLayerChanged:", uuid);
    for (const cardContainer of this.cardUuidToCardContainer.values()) {
      cardContainer.remove();
    }
    this.cardUuidToCardContainer.clear();
    this.currentLayerUuid = uuid;

    if (uuid === undefined) {
      return;
    }

    for (const element of STORE.selectors.elements.selectAll(uuid)) {
      this.addCard(element);
    }
  };

  private readonly onBuilderTypeChanged = (elementType: EElementType): void => {
    for (const [builderType, builderDiv] of this.builderContainers) {
      builderDiv.style.display = builderType === elementType ? "" : "none";
    }
    this.setActiveBuilder(elementType);
  };

  private readonly onAddButtonClicked = (): void => {
    this.activeBuilder?.build();
  };
}
