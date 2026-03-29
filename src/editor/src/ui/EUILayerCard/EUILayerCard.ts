import type { LayerState } from "../../types";

export interface LayerCardCallbacks {
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  onConfigUpdate: (layer: LayerState) => void;
}

export interface LayerCardContext {
  isActive: boolean;
  canDelete: boolean;
  isNameAvailable: (name: string, excludeLayerId: string) => boolean;
}

export abstract class EUILayerCard {
  protected readonly layer: LayerState;
  protected readonly callbacks: LayerCardCallbacks;
  protected readonly context: LayerCardContext;
  protected readonly root: HTMLDivElement;
  protected readonly fieldsContainer: HTMLDivElement;

  constructor(
    container: HTMLElement,
    layer: LayerState,
    context: LayerCardContext,
    callbacks: LayerCardCallbacks,
  ) {
    this.layer = layer;
    this.callbacks = callbacks;
    this.context = context;

    this.root = document.createElement("div");
    this.root.className = "layer-card";
    if (context.isActive) {this.root.classList.add("layer-card-active");}
    this.root.draggable = true;

    this.root.appendChild(this.buildHeader(context));

    this.fieldsContainer = document.createElement("div");
    this.fieldsContainer.className = "layer-card-fields";
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

  private buildHeader(context: LayerCardContext): HTMLElement {
    const header = document.createElement("div");
    header.className = "layer-card-header";

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "⠿";

    const activateButton = document.createElement("button");
    activateButton.className = "layer-activate-btn" + (context.isActive ? " is-active" : "");
    activateButton.title = context.isActive ? "Active layer" : "Set as active layer";
    activateButton.disabled = context.isActive;
    activateButton.addEventListener("click", () => this.callbacks.onActivate(this.layer.id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "button-icon button-danger";
    deleteButton.textContent = "✕";
    deleteButton.title = "Remove layer";
    deleteButton.disabled = !context.canDelete;
    deleteButton.addEventListener("click", () => this.callbacks.onDelete(this.layer.id));

    header.appendChild(dragHandle);
    header.appendChild(activateButton);
    header.appendChild(deleteButton);

    return header;
  }
}
