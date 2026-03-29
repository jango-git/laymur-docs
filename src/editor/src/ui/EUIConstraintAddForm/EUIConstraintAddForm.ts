/**
 * EUIConstraintAddForm
 *
 * Encapsulates the "Add Constraint" footer form.
 * Drives fields from CONSTRAINT_REGISTRY using EUIElementPicker for element
 * fields and EUINumberControl for numeric fields.
 */

import type { ConstraintFieldDescriptor } from "../../registry/constraint-registry";
import { CONSTRAINT_REGISTRY } from "../../registry/constraint-registry";
import type { ElementState } from "../../types";
import { EUIElementPicker } from "../EUIElementPicker/EUIElementPicker";
import { EUINumberControl } from "../EUINumberControl/EUINumberControl";
import type { ElementPickerItem } from "../elementPickerItem";
import {
  buildElementPickerItems,
  renderElementPickerItem,
  updateElementPickerButton,
} from "../elementPickerItem";

function formatGroupLabel(groupKey: string): string {
  return groupKey.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export interface ConstraintAddFormContext {
  getElements: () => ElementState[];
  getAssetUrl: (assetId: string) => string | undefined;
  isNameAvailable: (name: string) => boolean;
}

export interface ConstraintAddFormCallbacks {
  onAdd: (data: {
    constraintType: string;
    name: string | undefined;
    fieldValues: Record<string, string | number>;
  }) => void;
}

export class EUIConstraintAddForm {
  private readonly typeSelect: HTMLSelectElement;
  private readonly nameInput: HTMLInputElement;
  private readonly fieldsContainer: HTMLElement;
  private readonly addButton: HTMLButtonElement;
  private readonly context: ConstraintAddFormContext;
  private readonly callbacks: ConstraintAddFormCallbacks;
  private numberControls: EUINumberControl[] = [];
  private fieldValues: Record<string, string | number> = {};

  constructor(context: ConstraintAddFormContext, callbacks: ConstraintAddFormCallbacks) {
    this.typeSelect = document.getElementById("constraint-type-select") as HTMLSelectElement;
    this.nameInput = document.getElementById("constraint-name-input") as HTMLInputElement;
    this.fieldsContainer = document.getElementById("add-constraint-fields") as HTMLElement;
    this.addButton = document.getElementById("add-constraint-button") as HTMLButtonElement;
    this.context = context;
    this.callbacks = callbacks;

    for (const descriptor of CONSTRAINT_REGISTRY.all()) {
      const opt = document.createElement("option");
      opt.value = descriptor.type;
      opt.textContent = descriptor.label;
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

  /** Re-render fields preserving current element selections and number values. */
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

    const descriptor = CONSTRAINT_REGISTRY.get(this.typeSelect.value);
    if (!descriptor) {
      return;
    }

    let firstElementFieldKey: string | null = null;
    const renderedGroups = new Set<string>();

    for (const field of descriptor.fields) {
      if (field.fieldType === "element") {
        const getExcludeId =
          field.excludeSelf && firstElementFieldKey !== null
            ? () => (this.fieldValues[firstElementFieldKey!] as string) || null
            : null;
        this._renderElementField(field, getExcludeId);
        if (firstElementFieldKey === null) {
          firstElementFieldKey = field.key;
        }
      } else if (field.fieldType === "number") {
        if (field.group) {
          if (renderedGroups.has(field.group)) {
            continue;
          }
          renderedGroups.add(field.group);
          const groupFields = descriptor.fields.filter(
            (f) => f.fieldType === "number" && f.group === field.group,
          );
          this._renderPairedRow(groupFields);
        } else {
          this._renderNumberRow(field);
        }
      }
    }
  }

  private _renderElementField(
    field: ConstraintFieldDescriptor,
    getExcludeId: (() => string | null) | null,
  ): void {
    const row = document.createElement("div");
    row.className = "add-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const button = document.createElement("div");
    button.className = "picker-btn";

    const display = document.createElement("div");
    display.className = "picker-btn-display";
    button.appendChild(display);

    if (!(field.key in this.fieldValues)) {
      this.fieldValues[field.key] = "";
    }
    updateElementPickerButton(
      display,
      (this.fieldValues[field.key] as string) || null,
      this.context.getElements(),
      this.context.getAssetUrl,
    );

    button.addEventListener("click", async () => {
      const items = buildElementPickerItems(this.context.getElements(), field.noLayer);
      const excludeId = getExcludeId ? (getExcludeId() ?? undefined) : undefined;
      const currentId = (this.fieldValues[field.key] as string) || null;

      const picker = new EUIElementPicker<ElementPickerItem>({
        items,
        getId: (item) => item.id,
        renderItem: (item) => renderElementPickerItem(item, this.context.getAssetUrl),
        filterItem: (item, query) => item.name.toLowerCase().includes(query),
        currentId,
        excludeId,
      });

      const selectedId = await picker.open();
      if (selectedId === null) {
        return;
      }

      this.fieldValues[field.key] = selectedId;
      updateElementPickerButton(
        display,
        selectedId,
        this.context.getElements(),
        this.context.getAssetUrl,
      );
      this._syncButton();
    });

    row.appendChild(label);
    row.appendChild(button);
    this.fieldsContainer.appendChild(row);
  }

  private _renderNumberRow(field: ConstraintFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "add-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const initialValue =
      field.key in this.fieldValues
        ? (this.fieldValues[field.key] as number)
        : (field.default ?? 0);
    this.fieldValues[field.key] = initialValue;

    const control = new EUINumberControl(row, {
      value: initialValue,
      min: field.min,
      max: field.max,
      step: field.step ?? 1,
    });

    control.signalValueChanged.on((v) => {
      this.fieldValues[field.key] = v;
    });

    this.numberControls.push(control);
    row.insertBefore(label, row.firstChild);
    this.fieldsContainer.appendChild(row);
  }

  private _renderPairedRow(groupFields: ConstraintFieldDescriptor[]): void {
    const row = document.createElement("div");
    row.className = "add-paired-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = formatGroupLabel(groupFields[0].group!);
    row.appendChild(label);

    for (const field of groupFields) {
      const cell = document.createElement("div");
      cell.className = "constraint-paired-cell";

      const roleLabel = document.createElement("span");
      roleLabel.className = "paired-role-label";
      roleLabel.textContent = field.groupRole === "h" ? "H:" : "V:";
      cell.appendChild(roleLabel);

      const initialValue =
        field.key in this.fieldValues
          ? (this.fieldValues[field.key] as number)
          : (field.default ?? 0);
      this.fieldValues[field.key] = initialValue;

      const control = new EUINumberControl(cell, {
        value: initialValue,
        min: field.min,
        max: field.max,
        step: field.step ?? 0.05,
      });

      control.signalValueChanged.on((v) => {
        this.fieldValues[field.key] = v;
      });

      this.numberControls.push(control);
      row.appendChild(cell);
    }

    this.fieldsContainer.appendChild(row);
  }

  private _handleAdd(): void {
    const descriptor = CONSTRAINT_REGISTRY.get(this.typeSelect.value);
    if (!descriptor) {
      return;
    }

    for (const field of descriptor.fields) {
      if (field.required && !this.fieldValues[field.key]) {
        return;
      }
    }

    const elementFields = descriptor.fields.filter((f) => f.fieldType === "element");
    if (
      elementFields.length >= 2 &&
      this.fieldValues[elementFields[0].key] === this.fieldValues[elementFields[1].key]
    ) {
      return;
    }

    const nameRaw = this.nameInput.value.trim();
    const name = nameRaw || undefined;
    if (name && !this.context.isNameAvailable(name)) {
      return;
    }

    this.callbacks.onAdd({
      constraintType: this.typeSelect.value,
      name,
      fieldValues: { ...this.fieldValues },
    });

    this.nameInput.value = "";
    this.fieldValues = {};
    this._renderFields();
    this._syncButton();
  }

  private _syncButton(): void {
    const descriptor = CONSTRAINT_REGISTRY.get(this.typeSelect.value);
    if (!descriptor) {
      this.addButton.disabled = true;
      return;
    }

    for (const field of descriptor.fields) {
      if (field.required && !this.fieldValues[field.key]) {
        this.addButton.disabled = true;
        return;
      }
    }

    const elementFields = descriptor.fields.filter((f) => f.fieldType === "element");
    if (
      elementFields.length >= 2 &&
      this.fieldValues[elementFields[0].key] === this.fieldValues[elementFields[1].key]
    ) {
      this.addButton.disabled = true;
      return;
    }

    const nameRaw = this.nameInput.value.trim();
    if (nameRaw && !this.context.isNameAvailable(nameRaw)) {
      this.addButton.disabled = true;
      return;
    }

    this.addButton.disabled = false;
  }

  private _destroyNumberControls(): void {
    for (const control of this.numberControls) {
      control.destroy();
    }
    this.numberControls = [];
  }
}
