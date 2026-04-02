import { ENumberControl } from "../../Controls/ENumberControl/ENumberControl";
import type {
  ConstraintDescriptor,
  ConstraintFieldDescriptor,
} from "../../registry/constraint-registry";
import type { ConstraintState, ElementState } from "../../types";
import { EUIElementPicker } from "../EUIElementPicker/EUIElementPicker";
import type { ElementPickerItem } from "../elementPickerItem";
import {
  buildElementPickerItems,
  renderElementPickerItem,
  updateElementPickerButton,
} from "../elementPickerItem";

export interface ConstraintCardCallbacks {
  onFieldsUpdate: (constraint: ConstraintState) => void;
  onDelete: (id: string) => void;
}

export interface ConstraintCardContext {
  getElements: () => ElementState[];
  getAssetUrl: (assetId: string) => string | undefined;
  isNameAvailable: (name: string, excludeConstraintId: string) => boolean;
}

function formatGroupLabel(groupKey: string): string {
  return groupKey.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export class EUIConstraintCard {
  private readonly constraint: ConstraintState;
  private readonly descriptor: ConstraintDescriptor;
  private readonly callbacks: ConstraintCardCallbacks;
  private readonly context: ConstraintCardContext;
  private readonly root: HTMLDivElement;
  private readonly fieldsContainer: HTMLDivElement;
  private readonly detailSpan: HTMLSpanElement;
  private readonly numberControls: ENumberControl[] = [];

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
    this.renderFields(this.fieldsContainer);
    this.root.appendChild(this.fieldsContainer);

    container.appendChild(this.root);
  }

  public destroy(): void {
    for (const control of this.numberControls) {
      control.destroy();
    }
    this.numberControls.length = 0;
    this.root.remove();
  }

  private buildHeader(): { header: HTMLElement; detailSpan: HTMLSpanElement } {
    const header = document.createElement("div");
    header.className = "constraint-card-header";

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "⠿";

    const info = document.createElement("div");
    info.className = "constraint-card-info";

    const typeSpan = document.createElement("span");
    typeSpan.className = "constraint-card-type";
    typeSpan.textContent = this.descriptor.label;

    const detailSpan = document.createElement("span");
    detailSpan.className = "constraint-card-detail";
    detailSpan.textContent = this.descriptor.cardDetail(this.constraint, (id) =>
      this.elementLabel(id),
    );

    info.appendChild(typeSpan);
    info.appendChild(detailSpan);

    const deleteButton = document.createElement("button");
    deleteButton.className = "button-icon button-delete";
    deleteButton.textContent = "✕";
    deleteButton.title = "Remove constraint";
    deleteButton.addEventListener("click", () => {
      this.callbacks.onDelete(this.constraint.id);
    });

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

      if (newName.length === 0) {
        this.constraint.name = undefined;
        return;
      }

      if (!this.context.isNameAvailable(newName, this.constraint.id)) {
        input.value = this.constraint.name ?? "";
        return;
      }

      console.debug(
        "[EUIConstraintCard] name: %s → %s (id=%s)",
        this.constraint.name,
        newName,
        this.constraint.id,
      );
      this.constraint.name = newName;
    });

    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  }

  private renderFields(container: HTMLElement): void {
    let firstElementFieldKey: string | null = null;

    for (const field of this.descriptor.fields) {
      if (field.fieldType !== "element") {
        continue;
      }

      let getExcludeId: (() => string | null) | null = null;
      if (field.excludeSelf === true && firstElementFieldKey !== null) {
        const capturedKey = firstElementFieldKey;
        getExcludeId = (): string | null => {
          const value = this.constraint.fieldValues[capturedKey] as string;
          return value.length > 0 ? value : null;
        };
      }

      this.renderElementField(container, field, getExcludeId);

      firstElementFieldKey ??= field.key;
    }

    const renderedGroups = new Set<string>();

    for (const field of this.descriptor.fields) {
      if (field.fieldType !== "number") {
        continue;
      }

      if (field.group !== undefined) {
        if (renderedGroups.has(field.group)) {
          continue;
        }
        renderedGroups.add(field.group);
        const groupFields = this.descriptor.fields.filter((f) => f.group === field.group);
        this.renderPairedRow(container, groupFields);
      } else {
        this.renderNumberRow(container, field);
      }
    }
  }

  private renderElementField(
    container: HTMLElement,
    field: ConstraintFieldDescriptor,
    getExcludeId: (() => string | null) | null,
  ): void {
    const row = document.createElement("div");
    row.className = "constraint-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const pickerButton = document.createElement("div");
    pickerButton.className = "picker-btn";

    const display = document.createElement("div");
    display.className = "picker-btn-display";
    pickerButton.appendChild(display);

    const rawValue = this.constraint.fieldValues[field.key] as string;
    const currentValue = rawValue.length > 0 ? rawValue : null;
    updateElementPickerButton(
      display,
      currentValue,
      this.context.getElements(),
      this.context.getAssetUrl,
    );

    pickerButton.addEventListener("click", () => {
      void this.openElementFieldPicker(field, getExcludeId, display);
    });

    row.appendChild(label);
    row.appendChild(pickerButton);
    container.appendChild(row);
  }

  private async openElementFieldPicker(
    field: ConstraintFieldDescriptor,
    getExcludeId: (() => string | null) | null,
    display: HTMLElement,
  ): Promise<void> {
    const items = buildElementPickerItems(this.context.getElements(), field.noLayer);
    const excludeId = getExcludeId !== null ? (getExcludeId() ?? undefined) : undefined;
    const rawCurrentId = this.constraint.fieldValues[field.key] as string;
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

    console.debug(
      "[EUIConstraintCard] field %s → %s (id=%s)",
      field.key,
      selectedId,
      this.constraint.id,
    );
    this.constraint.fieldValues[field.key] = selectedId;
    updateElementPickerButton(
      display,
      selectedId,
      this.context.getElements(),
      this.context.getAssetUrl,
    );
    this.updateDetailSpan();
    this.callbacks.onFieldsUpdate(this.constraint);
  }

  private renderNumberRow(container: HTMLElement, field: ConstraintFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "constraint-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;
    row.appendChild(label);

    const control = new ENumberControl(row, {
      value: this.constraint.fieldValues[field.key] as number,
      min: field.min,
      max: field.max,
      step: field.step ?? 1,
    });

    control.signalValueChanged.on((newValue) => {
      this.constraint.fieldValues[field.key] = newValue;
      this.callbacks.onFieldsUpdate(this.constraint);
    });

    this.numberControls.push(control);
    container.appendChild(row);
  }

  private renderPairedRow(container: HTMLElement, groupFields: ConstraintFieldDescriptor[]): void {
    const row = document.createElement("div");
    row.className = "constraint-paired-row";

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

      const control = new ENumberControl(cell, {
        value: this.constraint.fieldValues[field.key] as number,
        min: field.min,
        max: field.max,
        step: field.step ?? 0.01,
      });

      control.signalValueChanged.on((newValue) => {
        this.constraint.fieldValues[field.key] = newValue;
        this.callbacks.onFieldsUpdate(this.constraint);
      });

      this.numberControls.push(control);
      row.appendChild(cell);
    }

    container.appendChild(row);
  }

  private updateDetailSpan(): void {
    this.detailSpan.textContent = this.descriptor.cardDetail(this.constraint, (id) =>
      this.elementLabel(id),
    );
  }

  private elementLabel(id: string): string {
    if (id === "layer") {
      return "Layer";
    }
    const element = this.context.getElements().find((e) => e.id === id);
    return element?.name ?? id;
  }
}
