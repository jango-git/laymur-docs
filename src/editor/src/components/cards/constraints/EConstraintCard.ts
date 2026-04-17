import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { UUID } from "../../../document/types.misc";

export abstract class EConstraintCard {
  protected readonly bodyRoot: HTMLDivElement;
  protected readonly nameControl: EStringControl;

  constructor(
    container: HTMLElement,
    protected readonly uuid: UUID,
    private readonly layerUuid: UUID,
    typeLabel: string,
  ) {
    const root = document.createElement("div");
    root.className = "element-card";

    const header = document.createElement("div");
    header.className = "element-card__header";

    const dragHandle = document.createElement("div");
    dragHandle.className = "element-card__drag-handle";
    dragHandle.dataset.dragHandle = "";

    const typeSpan = document.createElement("span");
    typeSpan.className = "element-card__type";
    typeSpan.textContent = typeLabel;

    header.appendChild(dragHandle);
    header.appendChild(typeSpan);

    this.nameControl = new EStringControl(header, { placeholder: "name" });

    const deleteButton = document.createElement("button");
    deleteButton.className = "element-card__delete";
    deleteButton.addEventListener("click", this.onDeleteClicked);
    header.appendChild(deleteButton);

    root.appendChild(header);

    this.bodyRoot = document.createElement("div");
    this.bodyRoot.className = "element-card__body";
    root.appendChild(this.bodyRoot);

    container.appendChild(root);
  }

  private readonly onDeleteClicked = (): void => {
    STORE.commands.constraints.remove(this.layerUuid, this.uuid);
  };
}
