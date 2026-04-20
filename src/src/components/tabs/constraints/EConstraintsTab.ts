import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { EStoreDeltaOperation } from "../../../document/signals";
import type { EStoreDeltaConstraintList } from "../../../document/signals/constraints";
import { STORE } from "../../../document/store";
import type { EAnyConstraint, EConstraintType } from "../../../document/types.constraints";
import type { EConstraintUUID, ELayerUUID } from "../../../document/types.misc";
import { consoleDebug } from "../../../miscellaneous/debug.print";
import { makeSortable } from "../../../miscellaneous/make-sortable";
import { UI_STATE } from "../../../ui-state/EUIState";
import type { EAnyConstraintBuilder } from "../../builders/constraints/types";
import type { ConstraintEntry } from "./registry";
import { CONSTRAINT_REGISTRY, DEFAULT_BUILDER_TYPE } from "./registry";

export class EConstraintsTab {
  private readonly cardsContentDiv: HTMLDivElement;
  private readonly cardUuidToCardContainer = new Map<EConstraintUUID, HTMLElement>();
  private currentLayerUuid: ELayerUUID | undefined;

  private readonly builderContainers = new Map<EConstraintType, HTMLElement>();
  private readonly builders = new Map<EConstraintType, EAnyConstraintBuilder>();
  private readonly cardFactories = new Map<EConstraintType, ConstraintEntry["createCard"]>();

  private activeBuilder?: EAnyConstraintBuilder;
  private readonly addButton: HTMLButtonElement;

  constructor(private readonly container: HTMLElement) {
    {
      const scrollArea = document.createElement("div");
      scrollArea.className = "tab-scroll-area";
      this.container.appendChild(scrollArea);

      this.cardsContentDiv = document.createElement("div");
      this.cardsContentDiv.id = "constraints-content";
      scrollArea.appendChild(this.cardsContentDiv);
    }

    const builderSection = document.createElement("div");
    builderSection.className = "tab-builder";
    this.container.appendChild(builderSection);

    for (const entry of CONSTRAINT_REGISTRY) {
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

    const builderTypeSelect = new ESelectControl<EConstraintType>(controlRow, {
      options: CONSTRAINT_REGISTRY.map(({ label, type }) => ({ label, value: type })),
      value: DEFAULT_BUILDER_TYPE,
    });

    this.addButton = document.createElement("button");
    this.addButton.className = "button-primary";
    this.addButton.textContent = "ADD";
    this.addButton.addEventListener("click", this.onAddButtonClicked);
    controlRow.appendChild(this.addButton);

    builderTypeSelect.signalValueChanged.on(this.onBuilderTypeChanged);
    STORE.signals.setup.on(this.onSetup);
    STORE.signals.constraints.list.on(this.onCardListChanged);
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
      STORE.commands.constraints.reorder(this.currentLayerUuid, uuids as EConstraintUUID[]);
    });

    const activeLayerUuid = UI_STATE.activeLayerUuid;
    if (activeLayerUuid !== undefined) {
      for (const constraint of STORE.selectors.constraints.selectAll(activeLayerUuid)) {
        this.addCard(constraint);
      }
    }
  }

  private setActiveBuilder(type: EConstraintType): void {
    this.activeBuilder = this.builders.get(type) as EAnyConstraintBuilder;
  }

  private addCard(constraint: EAnyConstraint): void {
    const container = document.createElement("div");
    container.dataset.uuid = constraint.uuid;
    this.cardsContentDiv.appendChild(container);

    if (this.currentLayerUuid !== undefined) {
      this.cardFactories.get(constraint.type)?.(container, constraint.uuid, this.currentLayerUuid);
    }
    this.cardUuidToCardContainer.set(constraint.uuid, container);
  }

  private removeCard(uuid: EConstraintUUID): void {
    this.cardUuidToCardContainer.get(uuid)?.remove();
    this.cardUuidToCardContainer.delete(uuid);
  }

  private reorderCards(uuids: EConstraintUUID[]): void {
    for (const uuid of uuids) {
      const card = this.cardUuidToCardContainer.get(uuid);
      if (card !== undefined) {
        this.cardsContentDiv.appendChild(card);
      }
    }
  }

  private readonly onSetup = (): void => {
    consoleDebug("[EConstraintsTab] onSetup");
    this.onActiveLayerChanged(undefined);
  };

  private readonly onCardListChanged = (delta: EStoreDeltaConstraintList): void => {
    consoleDebug("[EConstraintsTab] onCardListChanged:", delta);
    if (delta.layerUuid !== UI_STATE.activeLayerUuid) {
      return;
    }

    switch (delta.operation) {
      case EStoreDeltaOperation.ADD:
        this.addCard(delta.constraint);
        break;
      case EStoreDeltaOperation.REMOVE:
        this.removeCard(delta.uuid);
        break;
      case EStoreDeltaOperation.REORDER:
        this.reorderCards(delta.uuids);
        break;
    }
  };

  private readonly onActiveLayerChanged = (uuid?: ELayerUUID): void => {
    consoleDebug("[EConstraintsTab] onActiveLayerChanged:", uuid);
    for (const cardContainer of this.cardUuidToCardContainer.values()) {
      cardContainer.remove();
    }
    this.cardUuidToCardContainer.clear();
    this.currentLayerUuid = uuid;

    if (uuid === undefined) {
      return;
    }

    for (const constraint of STORE.selectors.constraints.selectAll(uuid)) {
      this.addCard(constraint);
    }
  };

  private readonly onBuilderTypeChanged = (constraintType: EConstraintType): void => {
    for (const [builderType, builderDiv] of this.builderContainers) {
      builderDiv.style.display = builderType === constraintType ? "" : "none";
    }
    this.setActiveBuilder(constraintType);
  };

  private readonly onAddButtonClicked = (): void => {
    this.activeBuilder?.build();
  };
}
