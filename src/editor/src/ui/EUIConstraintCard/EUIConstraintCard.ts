import type { ConstraintDescriptor } from "../../registry/constraint-registry";
import type { ConstraintState, ElementState } from "../../types";

export interface ConstraintCardCallbacks {
  onFieldsUpdate: (constraint: ConstraintState) => void;
  onDelete: (id: string) => void;
}

export interface ConstraintCardContext {
  getElements: () => ElementState[];
  getAssetUrl: (assetId: string) => string | undefined;
  isNameAvailable: (name: string, excludeConstraintId: string) => boolean;
}

export abstract class EUIConstraintCard {
  protected readonly constraint: ConstraintState;
  protected readonly descriptor: ConstraintDescriptor;
  protected readonly callbacks: ConstraintCardCallbacks;
  protected readonly context: ConstraintCardContext;
  protected readonly root: HTMLDivElement;
  protected readonly fieldsContainer: HTMLDivElement;

  private readonly detailSpan: HTMLSpanElement;

  constructor(
    container: HTMLElement,
    constraint: ConstraintState,
    descriptor: ConstraintDescriptor,
    callbacks: ConstraintCardCallbacks,
    context: ConstraintCardContext,
  ) {
    this.constraint = constraint;
    this.descriptor = descriptor;
    this.callbacks = callbacks;
    this.context = context;

    this.root = document.createElement("div");
    this.root.className = "constraint-card";
    this.root.draggable = true;

    const { header, detailSpan } = this.buildHeader();
    this.detailSpan = detailSpan;
    this.root.appendChild(header);

    this.fieldsContainer = document.createElement("div");
    this.fieldsContainer.className = "constraint-fields";
    this.buildNameField(this.fieldsContainer);
    this.root.appendChild(this.fieldsContainer);

    container.appendChild(this.root);
    // Subclass constructors call renderFields(this.fieldsContainer) after super()
  }

  protected abstract renderFields(container: HTMLElement): void;

  public destroy(): void {
    if (this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
  }

  protected elementLabel(id: string): string {
    if (id === "layer") {
      return "Layer";
    }
    const element = this.context.getElements().find((e) => e.id === id);
    return element?.name ?? id;
  }

  protected updateSubtitle(): void {
    this.detailSpan.textContent = this.descriptor.cardDetail(this.constraint, (id) =>
      this.elementLabel(id),
    );
  }

  private buildHeader(): { header: HTMLElement; detailSpan: HTMLSpanElement } {
    const header = document.createElement("div");
    header.className = "constraint-card-header";

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "⠿";

    const info = document.createElement("div");
    info.className = "element-card-info";

    const typeSpan = document.createElement("span");
    typeSpan.className = "element-card-type";
    typeSpan.textContent = this.descriptor.label;

    const detailSpan = document.createElement("span");
    detailSpan.className = "element-card-asset";
    detailSpan.textContent = this.descriptor.cardDetail(this.constraint, (id) =>
      this.elementLabel(id),
    );

    info.appendChild(typeSpan);
    info.appendChild(detailSpan);

    const deleteButton = document.createElement("button");
    deleteButton.className = "button-icon button-danger";
    deleteButton.textContent = "✕";
    deleteButton.title = "Remove constraint";
    deleteButton.addEventListener("click", () => this.callbacks.onDelete(this.constraint.id));

    header.appendChild(dragHandle);
    header.appendChild(info);
    header.appendChild(deleteButton);

    return { header, detailSpan };
  }

  private buildNameField(container: HTMLElement): void {
    const row = document.createElement("div");
    row.className = "constraint-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = "Name";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "param-input";
    input.placeholder = "optional";
    input.value = this.constraint.name ?? "";

    input.addEventListener("change", () => {
      const newName = input.value.trim();

      if (newName === (this.constraint.name ?? "")) {
        return;
      }

      if (newName === "") {
        this.constraint.name = undefined;
        return;
      }

      if (!this.context.isNameAvailable(newName, this.constraint.id)) {
        input.value = this.constraint.name ?? "";
        return;
      }

      this.constraint.name = newName;
    });

    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  }
}
