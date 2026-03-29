import type { ElementFieldDescriptor } from "../../registry/element-registry";
import { ELEMENT_REGISTRY } from "../../registry/element-registry";
import type { AssetMeta } from "../../types";
import { EUIElementPicker } from "../EUIElementPicker/EUIElementPicker";
import { EUINumberControl } from "../EUINumberControl/EUINumberControl";

interface AssetPickerItem {
  id: string;
  name: string;
  url: string;
}

export interface ElementAddFormContext {
  getAssets: () => Record<string, AssetMeta>;
  isNameAvailable: (name: string) => boolean;
}

export interface ElementAddFormCallbacks {
  onAdd: (data: { type: string; name: string; fieldValues: Record<string, unknown> }) => void;
}

export class EUIElementAddForm {
  private readonly typeSelect: HTMLSelectElement;
  private readonly nameInput: HTMLInputElement;
  private readonly fieldsContainer: HTMLElement;
  private readonly addButton: HTMLButtonElement;
  private readonly context: ElementAddFormContext;
  private readonly callbacks: ElementAddFormCallbacks;
  private numberControls: EUINumberControl[] = [];
  private fieldValues: Record<string, unknown> = {};

  constructor(context: ElementAddFormContext, callbacks: ElementAddFormCallbacks) {
    this.typeSelect = document.getElementById("element-type-select") as HTMLSelectElement;
    this.nameInput = document.getElementById("element-name-input") as HTMLInputElement;
    this.fieldsContainer = document.getElementById("add-element-fields") as HTMLElement;
    this.addButton = document.getElementById("add-element-button") as HTMLButtonElement;
    this.context = context;
    this.callbacks = callbacks;

    for (const descriptor of ELEMENT_REGISTRY.all()) {
      const option = document.createElement("option");
      option.value = descriptor.type;
      option.textContent = descriptor.type;
      this.typeSelect.appendChild(option);
    }

    this.typeSelect.addEventListener("change", () => {
      this.fieldValues = {};
      this.renderFields();
      this.syncButton();
    });

    this.nameInput.addEventListener("input", () => {
      this.syncButton();
    });
    this.addButton.addEventListener("click", () => {
      this.handleAdd();
    });

    this.renderFields();
    this.syncButton();
  }

  /** Re-render fields preserving current values (e.g. when assets change). */
  public refresh(): void {
    this.renderFields();
    this.syncButton();
  }

  public destroy(): void {
    this.destroyNumberControls();
  }

  private renderFields(): void {
    this.destroyNumberControls();
    this.fieldsContainer.innerHTML = "";

    const descriptor = ELEMENT_REGISTRY.get(this.typeSelect.value);
    if (descriptor === undefined) {
      return;
    }

    for (const field of descriptor.fields) {
      switch (field.fieldType) {
        case "asset":
          this.renderAssetField(field);
          break;
        case "number":
          this.renderNumberField(field);
          break;
        case "text":
          this.renderTextField(field);
          break;
      }
    }
  }

  private renderAssetField(field: ElementFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "add-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const pickerButton = document.createElement("div");
    pickerButton.className = "picker-btn";

    const display = document.createElement("div");
    display.className = "picker-btn-display";
    pickerButton.appendChild(display);

    if (!(field.key in this.fieldValues)) {
      this.fieldValues[field.key] = "";
    }
    this.updateAssetDisplay(display, this.fieldValues[field.key] as string);

    pickerButton.addEventListener("click", () => {
      void this.openAssetFieldPicker(field, display);
    });

    row.appendChild(label);
    row.appendChild(pickerButton);
    this.fieldsContainer.appendChild(row);
  }

  private async openAssetFieldPicker(
    field: ElementFieldDescriptor,
    display: HTMLElement,
  ): Promise<void> {
    const assets = this.context.getAssets();
    const items: AssetPickerItem[] = Object.entries(assets).map(([id, assetMeta]) => ({
      id,
      name: assetMeta.name,
      url: assetMeta.url,
    }));
    if (items.length === 0) {
      return;
    }

    const currentAssetId = this.fieldValues[field.key] as string;
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
      currentId: currentAssetId.length > 0 ? currentAssetId : null,
    });

    const newId = await picker.open();
    if (newId === null) {
      return;
    }

    this.fieldValues[field.key] = newId;
    this.updateAssetDisplay(display, newId);
    this.syncButton();
  }

  private renderNumberField(field: ElementFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "add-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;
    row.appendChild(label);

    const initialValue =
      field.key in this.fieldValues
        ? (this.fieldValues[field.key] as number)
        : typeof field.default === "number"
          ? field.default
          : 0;
    this.fieldValues[field.key] = initialValue;

    const control = new EUINumberControl(row, { value: initialValue });
    control.signalValueChanged.on((newValue) => {
      this.fieldValues[field.key] = newValue;
    });

    this.numberControls.push(control);
    this.fieldsContainer.appendChild(row);
  }

  private renderTextField(field: ElementFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "add-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "param-input";
    if (field.default !== undefined) {
      input.value = String(field.default);
      this.fieldValues[field.key] = input.value;
    } else if (!(field.key in this.fieldValues)) {
      this.fieldValues[field.key] = "";
    } else {
      input.value = this.fieldValues[field.key] as string;
    }

    input.addEventListener("input", () => {
      this.fieldValues[field.key] = input.value;
      this.syncButton();
    });

    row.appendChild(label);
    row.appendChild(input);
    this.fieldsContainer.appendChild(row);
  }

  private handleAdd(): void {
    const descriptor = ELEMENT_REGISTRY.get(this.typeSelect.value);
    if (descriptor === undefined) {
      return;
    }

    const name = this.nameInput.value.trim();
    if (name.length === 0 || !this.context.isNameAvailable(name)) {
      return;
    }

    for (const field of descriptor.fields) {
      if (field.required === true && !this.isFieldValueSet(this.fieldValues[field.key])) {
        return;
      }
    }

    this.callbacks.onAdd({
      type: this.typeSelect.value,
      name,
      fieldValues: { ...this.fieldValues },
    });

    this.nameInput.value = "";
    this.fieldValues = {};
    this.renderFields();
    this.syncButton();
  }

  private syncButton(): void {
    const descriptor = ELEMENT_REGISTRY.get(this.typeSelect.value);
    if (descriptor === undefined) {
      this.addButton.disabled = true;
      return;
    }

    const name = this.nameInput.value.trim();
    if (name.length === 0 || !this.context.isNameAvailable(name)) {
      this.addButton.disabled = true;
      return;
    }

    for (const field of descriptor.fields) {
      if (field.required === true && !this.isFieldValueSet(this.fieldValues[field.key])) {
        this.addButton.disabled = true;
        return;
      }
    }

    this.addButton.disabled = false;
  }

  private isFieldValueSet(value: unknown): boolean {
    if (typeof value === "string") {
      return value.length > 0;
    }
    if (typeof value === "number") {
      return true;
    }
    return false;
  }

  private updateAssetDisplay(display: HTMLElement, assetId: string): void {
    display.innerHTML = "";
    const assetMeta = assetId.length > 0 ? this.context.getAssets()[assetId] : undefined;
    if (assetMeta !== undefined) {
      const img = document.createElement("img");
      img.src = assetMeta.url;
      img.className = "picker-btn-thumb";
      display.appendChild(img);
      const nameElement = document.createElement("span");
      nameElement.className = "picker-btn-name";
      nameElement.textContent = assetMeta.name;
      display.appendChild(nameElement);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "picker-btn-placeholder";
      placeholder.textContent = "Click to select texture…";
      display.appendChild(placeholder);
    }
  }

  private destroyNumberControls(): void {
    for (const control of this.numberControls) {
      control.destroy();
    }
    this.numberControls = [];
  }
}
