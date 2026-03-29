/**
 * EUIElementAddForm
 *
 * Encapsulates the "Add Element" footer form.
 * Drives fields from ELEMENT_REGISTRY: "asset" via EUIElementPicker,
 * "number" via EUINumberControl, "text" via plain input.
 */

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
      const opt = document.createElement("option");
      opt.value = descriptor.type;
      opt.textContent = descriptor.type;
      this.typeSelect.appendChild(opt);
    }

    this.typeSelect.addEventListener("change", () => {
      this.fieldValues = {};
      this._renderFields();
      this._syncButton();
    });

    this.nameInput.addEventListener("input", () => this._syncButton());
    this.addButton.addEventListener("click", () => this._handleAdd());

    this._renderFields();
    this._syncButton();
  }

  /** Re-render fields preserving current values (e.g. when assets change). */
  public refresh(): void {
    this._renderFields();
    this._syncButton();
  }

  public destroy(): void {
    this._destroyNumberControls();
  }

  private _renderFields(): void {
    this._destroyNumberControls();
    this.fieldsContainer.innerHTML = "";

    const descriptor = ELEMENT_REGISTRY.get(this.typeSelect.value);
    if (!descriptor) {
      return;
    }

    for (const field of descriptor.fields) {
      if (field.fieldType === "asset") {
        this._renderAssetField(field);
      } else if (field.fieldType === "number") {
        this._renderNumberField(field);
      } else if (field.fieldType === "text") {
        this._renderTextField(field);
      }
    }
  }

  private _renderAssetField(field: ElementFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "add-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const btn = document.createElement("div");
    btn.className = "picker-btn";

    const display = document.createElement("div");
    display.className = "picker-btn-display";
    btn.appendChild(display);

    if (!(field.key in this.fieldValues)) {
      this.fieldValues[field.key] = "";
    }
    this._updateAssetDisplay(display, (this.fieldValues[field.key] as string) || null);

    btn.addEventListener("click", async () => {
      const assets = this.context.getAssets();
      const items: AssetPickerItem[] = Object.entries(assets).map(([id, meta]) => ({
        id,
        name: meta.name,
        url: meta.url,
      }));
      if (items.length === 0) {
        return;
      }

      const picker = new EUIElementPicker<AssetPickerItem>({
        items,
        getId: (item) => item.id,
        renderItem: (item) => {
          const wrapper = document.createElement("div");
          wrapper.className = "picker-item-content";
          const img = document.createElement("img");
          img.src = item.url;
          img.className = "picker-btn-thumb";
          const name = document.createElement("span");
          name.className = "picker-btn-name";
          name.textContent = item.name;
          wrapper.appendChild(img);
          wrapper.appendChild(name);
          return wrapper;
        },
        filterItem: (item, query) => item.name.toLowerCase().includes(query),
        currentId: (this.fieldValues[field.key] as string) || null,
      });

      const newId = await picker.open();
      if (!newId) {
        return;
      }

      this.fieldValues[field.key] = newId;
      this._updateAssetDisplay(display, newId);
      this._syncButton();
    });

    row.appendChild(label);
    row.appendChild(btn);
    this.fieldsContainer.appendChild(row);
  }

  private _renderNumberField(field: ElementFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "add-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const initialValue =
      field.key in this.fieldValues
        ? (this.fieldValues[field.key] as number)
        : ((field.default as number) ?? 0);
    this.fieldValues[field.key] = initialValue;

    const control = new EUINumberControl(row, { value: initialValue });
    control.signalValueChanged.on((v) => {
      this.fieldValues[field.key] = v;
    });

    this.numberControls.push(control);
    row.insertBefore(label, row.firstChild);
    this.fieldsContainer.appendChild(row);
  }

  private _renderTextField(field: ElementFieldDescriptor): void {
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
      this._syncButton();
    });

    row.appendChild(label);
    row.appendChild(input);
    this.fieldsContainer.appendChild(row);
  }

  private _handleAdd(): void {
    const descriptor = ELEMENT_REGISTRY.get(this.typeSelect.value);
    if (!descriptor) {
      return;
    }

    const name = this.nameInput.value.trim();
    if (!name || !this.context.isNameAvailable(name)) {
      return;
    }

    for (const field of descriptor.fields) {
      if (field.required && !this.fieldValues[field.key]) {
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
    this._renderFields();
    this._syncButton();
  }

  private _syncButton(): void {
    const descriptor = ELEMENT_REGISTRY.get(this.typeSelect.value);
    if (!descriptor) {
      this.addButton.disabled = true;
      return;
    }

    const name = this.nameInput.value.trim();
    if (!name || !this.context.isNameAvailable(name)) {
      this.addButton.disabled = true;
      return;
    }

    for (const field of descriptor.fields) {
      if (field.required && !this.fieldValues[field.key]) {
        this.addButton.disabled = true;
        return;
      }
    }

    this.addButton.disabled = false;
  }

  private _updateAssetDisplay(display: HTMLElement, assetId: string | null): void {
    display.innerHTML = "";
    const meta = assetId ? this.context.getAssets()[assetId] : null;
    if (meta?.url) {
      const img = document.createElement("img");
      img.src = meta.url;
      img.className = "picker-btn-thumb";
      display.appendChild(img);
      const name = document.createElement("span");
      name.className = "picker-btn-name";
      name.textContent = meta.name;
      display.appendChild(name);
    } else {
      const ph = document.createElement("span");
      ph.className = "picker-btn-placeholder";
      ph.textContent = "Click to select texture…";
      display.appendChild(ph);
    }
  }

  private _destroyNumberControls(): void {
    for (const control of this.numberControls) {
      control.destroy();
    }
    this.numberControls = [];
  }
}
