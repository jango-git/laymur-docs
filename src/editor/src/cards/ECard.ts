import type { FerrsignView0 } from "ferrsign";
import { Ferrsign0 } from "ferrsign";

export abstract class ECard<TModel> {
  protected readonly root: HTMLDivElement;
  protected readonly header: HTMLDivElement;
  protected readonly body: HTMLDivElement;

  private readonly signalDeleteRequestedInternal = new Ferrsign0();

  constructor(
    container: HTMLElement,
    protected model: TModel,
  ) {
    this.root = document.createElement("div");
    this.root.className = "card";

    this.header = document.createElement("div");
    this.header.className = "card__header";

    this.body = document.createElement("div");
    this.body.className = "card__body";

    this.root.appendChild(this.header);
    this.root.appendChild(this.body);
    container.appendChild(this.root);
  }

  public get signalDeleteRequested(): FerrsignView0 {
    return this.signalDeleteRequestedInternal;
  }

  public destroy(): void {
    this.root.remove();
  }

  protected addRow(label: string): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "card__row";

    const labelEl = document.createElement("span");
    labelEl.className = "card__row-label";
    labelEl.textContent = label;

    const controlContainer = document.createElement("div");
    controlContainer.className = "card__row-control";

    row.appendChild(labelEl);
    row.appendChild(controlContainer);
    this.body.appendChild(row);

    return controlContainer;
  }

  protected appendDragHandle(): void {
    const handle = document.createElement("span");
    handle.className = "card__drag-handle";
    handle.setAttribute("aria-hidden", "true");
    this.header.appendChild(handle);
  }

  protected appendDeleteButton(): void {
    const button = document.createElement("button");
    button.className = "card__delete-btn";
    button.setAttribute("aria-label", "Delete");
    button.tabIndex = -1;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      this.signalDeleteRequestedInternal.emit();
    });
    this.header.appendChild(button);
  }
}
