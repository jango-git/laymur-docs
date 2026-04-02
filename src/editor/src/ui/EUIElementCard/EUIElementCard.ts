import { ENumberControl } from "../../Controls/ENumberControl/ENumberControl";
import type { ElementFieldDescriptor, SelectOption } from "../../registry/element-registry";
import { ELEMENT_REGISTRY } from "../../registry/element-registry";
import type { ElementState } from "../../types";
import { EUIElementPicker } from "../EUIElementPicker/EUIElementPicker";

export interface ElementCardCallbacks {
  onDelete: (id: string) => void;
  onImageTextureChange: (
    elementId: string,
    fieldKey: string,
    newAssetId: string,
    dataURL: string,
  ) => void;
  onColorFieldChange: (elementId: string, color: string) => void;
  onFieldChange: (elementId: string, fieldKey: string, value: string | number | boolean) => void;
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
  private readonly numberControls: ENumberControl[] = [];

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
    for (const control of this.numberControls) {
      control.destroy();
    }
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
      } else if (field.fieldType === "color") {
        this.renderColorField(container, field);
      } else if (field.fieldType === "text") {
        this.renderTextField(container, field);
      } else if (field.fieldType === "textarea") {
        this.renderTextareaField(container, field);
      } else if (field.fieldType === "number") {
        this.renderNumberField(container, field);
      } else if (field.fieldType === "select") {
        this.renderSelectField(container, field);
      } else if (field.fieldType === "checkbox") {
        this.renderCheckboxField(container, field);
      } else if (field.fieldType === "section") {
        this.renderSectionField(container, field);
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

  private renderTextField(container: HTMLElement, field: ElementFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "element-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "param-input";
    input.value = String(this.element.fieldValues[field.key] ?? field.default ?? "");
    input.addEventListener("change", () => {
      this.element.fieldValues[field.key] = input.value;
      this.callbacks.onFieldChange(this.element.id, field.key, input.value);
    });

    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  }

  private renderTextareaField(container: HTMLElement, field: ElementFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "element-field-row element-field-row--top";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const textarea = document.createElement("textarea");
    textarea.className = "param-input";
    textarea.rows = 3;
    textarea.value = String(this.element.fieldValues[field.key] ?? field.default ?? "");
    textarea.addEventListener("change", () => {
      this.element.fieldValues[field.key] = textarea.value;
      this.callbacks.onFieldChange(this.element.id, field.key, textarea.value);
    });

    row.appendChild(label);
    row.appendChild(textarea);
    container.appendChild(row);
  }

  private renderCheckboxField(container: HTMLElement, field: ElementFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "element-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "param-checkbox";
    checkbox.checked =
      (this.element.fieldValues[field.key] as boolean | undefined) ??
      (field.default as boolean) ??
      false;
    checkbox.addEventListener("change", () => {
      this.element.fieldValues[field.key] = checkbox.checked;
      this.callbacks.onFieldChange(this.element.id, field.key, checkbox.checked);
    });

    row.appendChild(label);
    row.appendChild(checkbox);
    container.appendChild(row);
  }

  private renderSectionField(container: HTMLElement, field: ElementFieldDescriptor): void {
    const section = document.createElement("div");
    section.className = "element-field-section";
    section.textContent = field.label;
    container.appendChild(section);
  }

  private renderNumberField(container: HTMLElement, field: ElementFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "element-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;
    row.appendChild(label);

    const initialValue =
      typeof this.element.fieldValues[field.key] === "number"
        ? (this.element.fieldValues[field.key] as number)
        : typeof field.default === "number"
          ? field.default
          : 0;

    const control = new ENumberControl(row, {
      value: initialValue,
      ...(field.step !== undefined ? { step: field.step } : {}),
    });
    this.numberControls.push(control);
    control.signalValueChanged.on((value) => {
      this.element.fieldValues[field.key] = value;
      this.callbacks.onFieldChange(this.element.id, field.key, value);
    });

    container.appendChild(row);
  }

  private renderSelectField(container: HTMLElement, field: ElementFieldDescriptor): void {
    const options: SelectOption[] = field.options ?? [];

    const row = document.createElement("div");
    row.className = "element-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const select = document.createElement("select");
    select.className = "param-input";
    const currentValue = this.element.fieldValues[field.key] ?? field.default;
    for (const option of options) {
      const opt = document.createElement("option");
      opt.value = String(option.value);
      opt.textContent = option.label;
      if (String(option.value) === String(currentValue)) {
        opt.selected = true;
      }
      select.appendChild(opt);
    }
    select.addEventListener("change", () => {
      const raw = select.value;
      const matched = options.find((o) => String(o.value) === raw);
      const value =
        matched !== undefined && typeof matched.value === "number" ? matched.value : raw;
      this.element.fieldValues[field.key] = value;
      this.callbacks.onFieldChange(this.element.id, field.key, value);
    });

    row.appendChild(label);
    row.appendChild(select);
    container.appendChild(row);
  }

  private renderColorField(container: HTMLElement, field: ElementFieldDescriptor): void {
    const currentHex =
      (this.element.fieldValues[field.key] as string | undefined) ??
      (field.default as string | undefined) ??
      "#ffffffff";

    const row = document.createElement("div");
    row.className = "element-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const controls = document.createElement("div");
    controls.className = "color-field-controls";

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.className = "color-field-rgb";
    colorInput.value = currentHex.slice(0, 7);
    controls.appendChild(colorInput);

    const alphaControl = new ENumberControl(controls, {
      value: parseFloat(hexRGBAtoAlpha(currentHex).toFixed(2)),
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.numberControls.push(alphaControl);

    const onColorChange = (): void => {
      const hex = buildHexRGBA(colorInput.value, alphaControl.value);
      this.element.fieldValues[field.key] = hex;
      if (field.key === "color") {
        this.callbacks.onColorFieldChange(this.element.id, hex);
      } else {
        this.callbacks.onFieldChange(this.element.id, field.key, hex);
      }
    };

    colorInput.addEventListener("input", onColorChange);
    alphaControl.signalValueChanged.on(onColorChange);

    row.appendChild(label);
    row.appendChild(controls);
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
    this.callbacks.onImageTextureChange(this.element.id, fieldKey, newId, newAsset.dataURL);
  }
}

function hexRGBAtoAlpha(hex: string): number {
  return parseInt(hex.slice(7, 9), 16) / 255;
}

function buildHexRGBA(rgb: string, alpha: number): string {
  const clamped = Math.max(0, Math.min(1, isNaN(alpha) ? 1 : alpha));
  const aa = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0");
  return rgb + aa;
}
