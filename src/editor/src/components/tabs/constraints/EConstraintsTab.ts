import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import type { EStoreDeltaConstraints } from "../../../document/signals";
import { EStoreDeltaOperation } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EAnyConstraint, EConstraintType } from "../../../document/types.constraints";
import type { EConstraintUuid, ELayerUuid } from "../../../document/types.misc";
import { UI_STATE } from "../../../ui-state/ui-state";
import type { EAnyConstraintBuilder } from "../../builders/constraints/types";
import type { ConstraintEntry } from "./registry";
import { CONSTRAINT_REGISTRY, DEFAULT_BUILDER_TYPE } from "./registry";

export class EConstraintsTab {
  private readonly cardsContentDiv: HTMLDivElement;
  private readonly cardUuidToCardContainer = new Map<EConstraintUuid, HTMLElement>();

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
    STORE.signals.constraints.list.on(this.onCardListChanged);
    UI_STATE.signalActiveLayerChanged.on(this.onActiveLayerChanged);
  }

  private setActiveBuilder(type: EConstraintType): void {
    this.activeBuilder?.buildAvailabilitySignal.off(this.onButtonAvailabilityChanged);
    this.activeBuilder = this.builders.get(type) as EAnyConstraintBuilder;
    this.activeBuilder.buildAvailabilitySignal.on(this.onButtonAvailabilityChanged);
  }

  private addCard(constraint: EAnyConstraint): void {
    const container = document.createElement("div");
    container.dataset.uuid = constraint.uuid;
    this.cardsContentDiv.appendChild(container);

    this.cardFactories.get(constraint.type)?.(container, constraint.uuid);
    this.cardUuidToCardContainer.set(constraint.uuid, container);
  }

  private removeCard(uuid: EConstraintUuid): void {
    this.cardUuidToCardContainer.get(uuid)?.remove();
    this.cardUuidToCardContainer.delete(uuid);
  }

  private readonly onCardListChanged = (delta: EStoreDeltaConstraints): void => {
    if (delta.layerUuid !== UI_STATE.activeLayerUuid) {
      return;
    }

    if (delta.operation === EStoreDeltaOperation.ADD) {
      this.addCard(delta.constraint);
    } else if (delta.operation === EStoreDeltaOperation.REMOVE) {
      this.removeCard(delta.uuid);
    }
  };

  private readonly onActiveLayerChanged = (uuid?: ELayerUuid): void => {
    for (const cardContainer of this.cardUuidToCardContainer.values()) {
      cardContainer.remove();
    }
    this.cardUuidToCardContainer.clear();

    if (uuid === undefined) {
      return;
    }

    for (const constraint of STORE.selectors.constraints.selectAll(uuid) ?? []) {
      this.addCard(constraint);
    }
  };

  private readonly onBuilderTypeChanged = (constraintType: EConstraintType): void => {
    for (const [builderType, builderDiv] of this.builderContainers) {
      builderDiv.style.display = builderType === constraintType ? "" : "none";
    }
    this.setActiveBuilder(constraintType);
  };

  private readonly onButtonAvailabilityChanged = (available: boolean): void => {
    this.addButton.disabled = !available;
  };

  private readonly onAddButtonClicked = (): void => {
    this.activeBuilder?.build();
  };
}
