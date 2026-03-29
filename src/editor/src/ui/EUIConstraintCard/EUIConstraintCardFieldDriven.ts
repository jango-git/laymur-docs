import type {
  ConstraintDescriptor,
  ConstraintFieldDescriptor,
} from "../../registry/constraint-registry";
import type { ConstraintState } from "../../types";
import { EUIElementPicker } from "../EUIElementPicker/EUIElementPicker";
import { EUINumberControl } from "../EUINumberControl/EUINumberControl";
import type { ElementPickerItem } from "../elementPickerItem";
import {
  buildElementPickerItems,
  renderElementPickerItem,
  updateElementPickerButton,
} from "../elementPickerItem";
import type { ConstraintCardCallbacks, ConstraintCardContext } from "./EUIConstraintCard";
import { EUIConstraintCard } from "./EUIConstraintCard";

function formatGroupLabel(groupKey: string): string {
  return groupKey.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export class EUIConstraintCardFieldDriven extends EUIConstraintCard {
  private readonly numberControls: EUINumberControl[] = [];

  constructor(
    container: HTMLElement,
    constraint: ConstraintState,
    descriptor: ConstraintDescriptor,
    callbacks: ConstraintCardCallbacks,
    context: ConstraintCardContext,
  ) {
    super(container, constraint, descriptor, callbacks, context);
    this.renderFields(this.fieldsContainer);
  }

  protected renderFields(container: HTMLElement): void {
    let firstElementFieldKey: string | null = null;

    for (const field of this.descriptor.fields) {
      if (field.fieldType !== "element") {
        continue;
      }

      const getExcludeId =
        field.excludeSelf && firstElementFieldKey !== null
          ? () => (this.constraint.fieldValues[firstElementFieldKey!] as string) || null
          : null;

      this.renderElementField(container, field, getExcludeId);

      if (firstElementFieldKey === null) {
        firstElementFieldKey = field.key;
      }
    }

    const renderedGroups = new Set<string>();

    for (const field of this.descriptor.fields) {
      if (field.fieldType !== "number") {
        continue;
      }

      if (field.group) {
        if (renderedGroups.has(field.group)) {
          continue;
        }
        renderedGroups.add(field.group);
        const groupFields = this.descriptor.fields.filter(
          (f) => f.fieldType === "number" && f.group === field.group,
        );
        this.renderPairedRow(container, groupFields);
      } else {
        this.renderNumberRow(container, field);
      }
    }
  }

  public override destroy(): void {
    for (const control of this.numberControls) {
      control.destroy();
    }
    this.numberControls.length = 0;
    super.destroy();
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

    const button = document.createElement("div");
    button.className = "picker-btn";

    const display = document.createElement("div");
    display.className = "picker-btn-display";
    button.appendChild(display);

    const currentValue = (this.constraint.fieldValues[field.key] as string) || null;
    updateElementPickerButton(
      display,
      currentValue,
      this.context.getElements(),
      this.context.getAssetUrl,
    );

    button.addEventListener("click", async () => {
      const items = buildElementPickerItems(this.context.getElements(), field.noLayer);
      const excludeId = getExcludeId ? (getExcludeId() ?? undefined) : undefined;
      const currentId = (this.constraint.fieldValues[field.key] as string) || null;

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

      this.constraint.fieldValues[field.key] = selectedId;
      updateElementPickerButton(
        display,
        selectedId,
        this.context.getElements(),
        this.context.getAssetUrl,
      );
      this.updateSubtitle();
      this.callbacks.onFieldsUpdate(this.constraint);
    });

    row.appendChild(label);
    row.appendChild(button);
    container.appendChild(row);
  }

  private renderNumberRow(container: HTMLElement, field: ConstraintFieldDescriptor): void {
    const row = document.createElement("div");
    row.className = "constraint-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = field.label;

    const control = new EUINumberControl(row, {
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

    row.insertBefore(label, row.firstChild);
    container.appendChild(row);
  }

  private renderPairedRow(container: HTMLElement, groupFields: ConstraintFieldDescriptor[]): void {
    const row = document.createElement("div");
    row.className = "constraint-paired-row";

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

      const control = new EUINumberControl(cell, {
        value: this.constraint.fieldValues[field.key] as number,
        min: field.min,
        max: field.max,
        step: field.step ?? 0.05,
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
}
