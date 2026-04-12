import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { EElementUuid, ELayerUuid } from "../../../document/types.misc";
import { makeRow } from "../../../utils/rows";

export abstract class EElementCard {
  protected readonly bodyRoot: HTMLDivElement;
  protected readonly nameControl: EStringControl;
  protected readonly colorControl: EColorControl;

  constructor(
    container: HTMLElement,
    protected readonly uuid: EElementUuid,
    private readonly layerUuid: ELayerUuid,
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

    this.nameControl = new EStringControl(header, { placeholder: "Name" });

    const deleteButton = document.createElement("button");
    deleteButton.className = "element-card__delete";
    deleteButton.addEventListener("click", this.onDeleteClicked);
    header.appendChild(deleteButton);

    root.appendChild(header);

    this.bodyRoot = document.createElement("div");
    this.bodyRoot.className = "element-card__body";
    root.appendChild(this.bodyRoot);

    this.colorControl = new EColorControl(makeRow(this.bodyRoot, "Color"));

    container.appendChild(root);
  }

  private readonly onDeleteClicked = (): void => {
    STORE.commands.elements.remove(this.layerUuid, this.uuid);
  };
}
