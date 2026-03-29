import type { ElementFieldDescriptor } from "../../registry/element-registry";
import { ELEMENT_REGISTRY } from "../../registry/element-registry";
import type { ElementState } from "../../types";
import { EUIElementPicker } from "../EUIElementPicker/EUIElementPicker";

export interface ElementCardCallbacks {
  onDelete: (id: string) => void;
  onAssetFieldChange: (
    elementId: string,
    fieldKey: string,
    newAssetId: string,
    dataURL: string,
  ) => void;
}

export interface ElementCardContext {
  isNameAvailable: (name: string, excludeElementId: string) => boolean;
  getAssets: () => Record<string, { name: string; url: string; dataURL: string }>;
}

interface AssetPickerItem {
  id: string;
  name: string;
  url: string;
  dataURL: string;
}

export class EUIElementCard {
  private readonly element: ElementState;
  private readonly callbacks: ElementCardCallbacks;
  private readonly context: ElementCardContext;
  private readonly root: HTMLDivElement;

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

    this.root.appendChild(this.buildHeader());

    const fieldsContainer = document.createElement("div");
    fieldsContainer.className = "element-card-fields";
    this.renderNameRow(fieldsContainer);
    this.renderRegistryFields(fieldsContainer);
    this.root.appendChild(fieldsContainer);

    container.appendChild(this.root);
  }

  public destroy(): void {
    this.root.remove();
  }

  private buildHeader(): HTMLElement {
    const header = document.createElement("div");
    header.className = "element-card-header";

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "⠿";
    dragHandle.addEventListener("mousedown", (event) => {
      event.stopPropagation();
    });

    const typeSpan = document.createElement("span");
    typeSpan.className = "element-card-type";
    typeSpan.textContent = this.element.type;

    const deleteButton = document.createElement("button");
    deleteButton.className = "button-icon button-delete";
    deleteButton.textContent = "✕";
    deleteButton.title = "Remove element";
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.callbacks.onDelete(this.element.id);
    });

    header.appendChild(dragHandle);
    header.appendChild(typeSpan);
    header.appendChild(deleteButton);

    return header;
  }

  private renderNameRow(container: HTMLElement): void {
    const row = document.createElement("div");
    row.className = "element-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = "Name";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "param-input";
    input.value = this.element.name;
    input.addEventListener("change", () => {
      const newName = input.value.trim();
      if (newName.length === 0 || newName === this.element.name) {
        input.value = this.element.name;
        return;
      }
      if (!this.context.isNameAvailable(newName, this.element.id)) {
        input.value = this.element.name;
        return;
      }
      console.debug(
        "[EUIElementCard] name: %s → %s (id=%s)",
        this.element.name,
        newName,
        this.element.id,
      );
      this.element.name = newName;
    });

    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  }

  private renderRegistryFields(container: HTMLElement): void {
    const descriptor = ELEMENT_REGISTRY.get(this.element.type);
    if (descriptor === undefined) {
      return;
    }
    for (const field of descriptor.fields) {
      if (field.fieldType === "asset") {
        this.renderAssetField(container, field);
      }
    }
  }

  private renderAssetField(container: HTMLElement, field: ElementFieldDescriptor): void {
    const assetId = this.element.fieldValues[field.key] as string | undefined;
    const currentAsset = assetId !== undefined ? this.context.getAssets()[assetId] : undefined;

    const row = document.createElement("div");
    row.className = "element-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const pickerRow = document.createElement("div");
    pickerRow.className = "element-texture-row";
    pickerRow.title = "Click to change texture";

    const thumb = document.createElement("img");
    thumb.className = "element-texture-thumb";
    thumb.src = currentAsset?.url ?? "";

    const nameSpan = document.createElement("span");
    nameSpan.className = "element-texture-name";
    nameSpan.textContent = currentAsset?.name ?? "(none)";

    pickerRow.appendChild(thumb);
    pickerRow.appendChild(nameSpan);

    pickerRow.addEventListener("click", () => {
      void this.openAssetPicker(field.key, thumb, nameSpan);
    });

    row.appendChild(label);
    row.appendChild(pickerRow);
    container.appendChild(row);
  }

  private async openAssetPicker(
    fieldKey: string,
    thumb: HTMLImageElement,
    nameSpan: HTMLSpanElement,
  ): Promise<void> {
    const currentAssets = this.context.getAssets();
    const currentAssetId = this.element.fieldValues[fieldKey] as string | undefined;

    const items: AssetPickerItem[] = Object.entries(currentAssets).map(([id, assetMeta]) => ({
      id,
      name: assetMeta.name,
      url: assetMeta.url,
      dataURL: assetMeta.dataURL,
    }));

    if (items.length === 0) {
      return;
    }

    const picker = new EUIElementPicker<AssetPickerItem>({
      items,
      getId: (item): string => item.id,
      renderItem: (item): HTMLElement => {
        const wrapper = document.createElement("div");
        wrapper.className = "picker-item-content";
        const img = document.createElement("img");
        img.src = item.url;
        img.className = "picker-btn-thumb";
        const nameElement = document.createElement("span");
        nameElement.className = "picker-btn-name";
        nameElement.textContent = item.name;
        wrapper.appendChild(img);
        wrapper.appendChild(nameElement);
        return wrapper;
      },
      filterItem: (item, query): boolean => item.name.toLowerCase().includes(query),
      currentId: currentAssetId ?? null,
    });

    const newId = await picker.open();
    if (newId === null || newId === this.element.fieldValues[fieldKey]) {
      return;
    }

    this.element.fieldValues[fieldKey] = newId;
    const newAsset = this.context.getAssets()[newId];
    thumb.src = newAsset.url;
    nameSpan.textContent = newAsset.name;
    console.debug(
      "[EUIElementCard] asset field %s → %s (elementId=%s)",
      fieldKey,
      newId,
      this.element.id,
    );
    this.callbacks.onAssetFieldChange(this.element.id, fieldKey, newId, newAsset.dataURL);
  }
}
