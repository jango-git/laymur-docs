import type { EAssetControlItem } from "../controls/EAssetControl/EAssetControl";
import { EAssetControl } from "../controls/EAssetControl/EAssetControl";
import { EStringControl } from "../controls/EStringControl/EStringControl";

export interface FormRowHandle<T> {
  getValue(): T;
  reset(): void;
  destroy(): void;
}

function makeRow(container: HTMLElement, label: string): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "builder__form-row";

  const labelEl = document.createElement("span");
  labelEl.className = "builder__form-label";
  labelEl.textContent = label;
  row.appendChild(labelEl);

  const controlWrap = document.createElement("div");
  controlWrap.className = "builder__form-control";
  row.appendChild(controlWrap);

  container.appendChild(row);
  return controlWrap;
}

export function buildStringRow(
  container: HTMLElement,
  label: string,
  onChange: () => void,
  options: { placeholder?: string } = {},
): FormRowHandle<string> {
  const wrap = makeRow(container, label);
  const control = new EStringControl(wrap, { placeholder: options.placeholder });
  control.signalValueChanged.on(onChange);
  return {
    getValue: () => control.value,
    reset: () => { control.value = ""; },
    destroy: () => { control.destroy(); },
  };
}

export function buildAssetRow<T extends EAssetControlItem>(
  container: HTMLElement,
  label: string,
  onChange: () => void,
  fetchItems: () => T[],
): FormRowHandle<T | null> {
  const wrap = makeRow(container, label);
  const control = new EAssetControl<T>(wrap, fetchItems, { nullable: false });
  control.signalValueChanged.on(onChange);
  return {
    getValue: () => control.value,
    reset: () => { control.value = null; },
    destroy: () => { control.destroy(); },
  };
}
