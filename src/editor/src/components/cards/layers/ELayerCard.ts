import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { UUID } from "../../../document/types.misc";
import { UI_STATE } from "../../../ui-state/EUIState";

export abstract class ELayerCard {
  protected readonly bodyRoot: HTMLDivElement;
  protected readonly nameControl: EStringControl;
  private readonly root: HTMLDivElement;
  private readonly activeToggle: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected readonly uuid: UUID,
    typeLabel: string,
  ) {
    this.root = document.createElement("div");
    this.root.className = "element-card";

    const header = document.createElement("div");
    header.className = "element-card__header";

    const dragHandle = document.createElement("div");
    dragHandle.className = "element-card__drag-handle";
    dragHandle.dataset.dragHandle = "";

    this.activeToggle = document.createElement("button");
    this.activeToggle.className = "element-card__active-toggle";
    this.activeToggle.addEventListener("click", this.onActiveToggleClicked);

    const typeSpan = document.createElement("span");
    typeSpan.className = "element-card__type";
    typeSpan.textContent = typeLabel;

    header.appendChild(dragHandle);
    header.appendChild(this.activeToggle);
    header.appendChild(typeSpan);

    this.nameControl = new EStringControl(header, { placeholder: "name" });

    const deleteButton = document.createElement("button");
    deleteButton.className = "element-card__delete";
    deleteButton.addEventListener("click", this.onDeleteClicked);
    header.appendChild(deleteButton);

    this.root.appendChild(header);

    this.bodyRoot = document.createElement("div");
    this.bodyRoot.className = "element-card__body";
    this.root.appendChild(this.bodyRoot);

    container.appendChild(this.root);

    this.updateActivityStyles(UI_STATE.activeLayerUuid === uuid);
    UI_STATE.signalActiveLayerChanged.on(this.onActiveLayerChanged);
  }

  private readonly onActiveToggleClicked = (): void => {
    UI_STATE.setActiveLayer(this.uuid);
  };

  private readonly onDeleteClicked = (): void => {
    STORE.commands.layers.remove(this.uuid);
  };

  private readonly onActiveLayerChanged = (uuid: UUID | undefined): void => {
    this.updateActivityStyles(uuid === this.uuid);
  };

  private updateActivityStyles(active: boolean): void {
    this.root.classList.toggle("element-card--active", active);
    this.activeToggle.classList.toggle("element-card__active-toggle--active", active);
  }
}
