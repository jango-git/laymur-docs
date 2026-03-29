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
      const option = document.createElement("option");
      option.value = descriptor.type;
      option.textContent = descriptor.label;
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

  /** Re-render fields preserving current element selections and number values. */
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

    const descriptor = CONSTRAINT_REGISTRY.get(this.typeSelect.value);
    if (descriptor === undefined) {
      return;
    }

    let firstElementFieldKey: string | null = null;
    const renderedGroups = new Set<string>();

    for (const field of descriptor.fields) {
      if (field.fieldType === "element") {
        let getExcludeId: (() => string | null) | null = null;
        if (field.excludeSelf === true && firstElementFieldKey !== null) {
          const capturedKey = firstElementFieldKey;
          getExcludeId = (): string | null => {
            const value = this.fieldValues[capturedKey] as string;
            return value.length > 0 ? value : null;
          };
        }
        this.renderElementField(field, getExcludeId);
        firstElementFieldKey ??= field.key;
      } else {
        if (field.group !== undefined) {
          if (renderedGroups.has(field.group)) {
            continue;
          }
          renderedGroups.add(field.group);
          const groupFields = descriptor.fields.filter((f) => f.group === field.group);
          this.renderPairedRow(groupFields);
        } else {
          this.renderNumberRow(field);
        }
      }
    }
  }

  private renderElementField(
    field: ConstraintFieldDescriptor,
    getExcludeId: (() => string | null) | null,
  ): void {
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
    const rawValue = this.fieldValues[field.key] as string;
    updateElementPickerButton(
      display,
      rawValue.length > 0 ? rawValue : null,
      this.context.getElements(),
      this.context.getAssetUrl,
    );

    pickerButton.addEventListener("click", () => {
      void this.openElementFieldPicker(field, getExcludeId, display);
    });

    row.appendChild(label);
    row.appendChild(pickerButton);
    this.fieldsContainer.appendChild(row);
  }

  private async openElementFieldPicker(
    field: ConstraintFieldDescriptor,
    getExcludeId: (() => string | null) | null,
    display: HTMLElement,
  ): Promise<void> {
    const items = buildElementPickerItems(this.context.getElements(), field.noLayer);
    const excludeId = getExcludeId !== null ? (getExcludeId() ?? undefined) : undefined;
    const rawCurrentId = this.fieldValues[field.key] as string;
    const currentId = rawCurrentId.length > 0 ? rawCurrentId : null;

    const picker = new EUIElementPicker<ElementPickerItem>({
      items,
      getId: (item): string => item.id,
      renderItem: (item): HTMLElement => renderElementPickerItem(item, this.context.getAssetUrl),
      filterItem: (item, query): boolean => item.name.toLowerCase().includes(query),
      currentId,
      excludeId,
    });

    const selectedId = await picker.open();
    if (selectedId === null) {
      return;
    }

    console.debug("[EUIConstraintAddForm] field %s → %s", field.key, selectedId);
    this.fieldValues[field.key] = selectedId;
    updateElementPickerButton(
      display,
      selectedId,
      this.context.getElements(),
      this.context.getAssetUrl,
    );
    this.syncButton();
  }

  private renderNumberRow(field: ConstraintFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "add-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;
    row.appendChild(label);

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

    control.signalValueChanged.on((newValue) => {
      this.fieldValues[field.key] = newValue;
    });

    this.numberControls.push(control);
    this.fieldsContainer.appendChild(row);
  }

  private renderPairedRow(groupFields: ConstraintFieldDescriptor[]): void {
    const row = document.createElement("div");
    row.className = "add-paired-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = formatGroupLabel(groupFields[0].group ?? "");
    row.appendChild(label);

    for (const field of groupFields) {
      const cell = document.createElement("div");
      cell.className = "paired-cell";

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

      control.signalValueChanged.on((newValue) => {
        this.fieldValues[field.key] = newValue;
      });

      this.numberControls.push(control);
      row.appendChild(cell);
    }

    this.fieldsContainer.appendChild(row);
  }

  private handleAdd(): void {
    const descriptor = CONSTRAINT_REGISTRY.get(this.typeSelect.value);
    if (descriptor === undefined) {
      return;
    }

    for (const field of descriptor.fields) {
      if (field.required === true && !this.isFieldValueSet(this.fieldValues[field.key])) {
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
    const name = nameRaw.length > 0 ? nameRaw : undefined;
    if (name !== undefined && !this.context.isNameAvailable(name)) {
      return;
    }

    console.debug("[EUIConstraintAddForm] add type=%s name=%s", this.typeSelect.value, name);
    this.callbacks.onAdd({
      constraintType: this.typeSelect.value,
      name,
      fieldValues: { ...this.fieldValues },
    });

    this.nameInput.value = "";
    this.fieldValues = {};
    this.renderFields();
    this.syncButton();
  }

  private syncButton(): void {
    const descriptor = CONSTRAINT_REGISTRY.get(this.typeSelect.value);
    if (descriptor === undefined) {
      this.addButton.disabled = true;
      return;
    }

    for (const field of descriptor.fields) {
      if (field.required === true && !this.isFieldValueSet(this.fieldValues[field.key])) {
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
    if (nameRaw.length > 0 && !this.context.isNameAvailable(nameRaw)) {
      this.addButton.disabled = true;
      return;
    }

    this.addButton.disabled = false;
  }

  private isFieldValueSet(value: string | number): boolean {
    if (typeof value === "string") {
      return value.length > 0;
    }
    return true;
  }

  private destroyNumberControls(): void {
    for (const control of this.numberControls) {
      control.destroy();
    }
    this.numberControls = [];
  }
}
