/**
 * EUIElementCard — abstract base for element list cards.
 *
 * Builds the header (drag handle, type badge, delete button) and name field.
 * Subclasses call this.renderFields(this.fieldsContainer) in their constructor.
 */

import type { ElementState } from "../../types";

export interface ElementCardCallbacks {
  onDelete: (id: string) => void;
  onTextureChange: (elementId: string, newAssetId: string, dataURL: string) => void;
}

export interface ElementCardContext {
  isNameAvailable: (name: string, excludeElementId: string) => boolean;
  getAssets: () => Record<string, { name: string; url: string; dataURL: string }>;
}

export abstract class EUIElementCard {
  protected readonly element: ElementState;
  protected readonly callbacks: ElementCardCallbacks;
  protected readonly context: ElementCardContext;
  protected readonly root: HTMLDivElement;
  protected readonly fieldsContainer: HTMLDivElement;

  constructor(
    container: HTMLElement,
    element: ElementState,
    callbacks: ElementCardCallbacks,
    context: ElementCardContext,
  ) {
    this.element = element;
    this.callbacks = callbacks;
    this.context = context;

    this.root = document.createElement("div");
    this.root.className = "element-card";
    this.root.draggable = true;

    // ── Header ────────────────────────────────────────────────────────────────
    const header = document.createElement("div");
    header.className = "element-card-header";

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "⠿";
    dragHandle.addEventListener("mousedown", (e) => e.stopPropagation());

    const typeSpan = document.createElement("span");
    typeSpan.className = "element-card-type";
    typeSpan.textContent = element.type;

    const deleteButton = document.createElement("button");
    deleteButton.className = "button-icon button-danger";
    deleteButton.textContent = "✕";
    deleteButton.title = "Remove element";
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.callbacks.onDelete(this.element.id);
    });

    header.appendChild(dragHandle);
    header.appendChild(typeSpan);
    header.appendChild(deleteButton);
    this.root.appendChild(header);

    // ── Fields container ──────────────────────────────────────────────────────
    this.fieldsContainer = document.createElement("div");
    this.fieldsContainer.className = "layer-card-fields";

    // Name row
    const nameRow = document.createElement("div");
    nameRow.className = "layer-field-row";
    const nameLabel = document.createElement("span");
    nameLabel.className = "add-field-label";
    nameLabel.textContent = "Name";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "param-input";
    nameInput.value = element.name;
    nameInput.addEventListener("change", (e) => {
      const newName = (e.target as HTMLInputElement).value.trim();
      if (!newName || newName === this.element.name) {
        (e.target as HTMLInputElement).value = this.element.name;
        return;
      }
      if (!this.context.isNameAvailable(newName, this.element.id)) {
        (e.target as HTMLInputElement).value = this.element.name;
        return;
      }
      this.element.name = newName;
    });
    nameRow.appendChild(nameLabel);
    nameRow.appendChild(nameInput);
    this.fieldsContainer.appendChild(nameRow);

    this.root.appendChild(this.fieldsContainer);
    container.appendChild(this.root);
  }

  protected abstract renderFields(container: HTMLElement): void;

  public destroy(): void {
    this.root.remove();
  }
}
