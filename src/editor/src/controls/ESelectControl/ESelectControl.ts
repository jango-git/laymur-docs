import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";

export interface ESelectControlOption<T> {
  label: string;
  value: T;
}

export interface ESelectControlOptions<T> {
  value: T;
  options: ESelectControlOption<T>[];
}

export class ESelectControl<T> {
  private readonly container: HTMLElement;
  private currentValue: T;
  private readonly options: ESelectControlOption<T>[];

  private readonly root: HTMLDivElement;
  private readonly select: HTMLSelectElement;

  private readonly signalValueChangedInternal = new Ferrsign2<T, T>();

  constructor(container: HTMLElement, options: Partial<ESelectControlOptions<T>> = {}) {
    this.container = container;
    this.options = options.options ?? [];

    const initialIndex = this.options.findIndex((o) => o.value === options.value);
    this.currentValue =
      initialIndex !== -1 ? this.options[initialIndex].value : this.options[0]?.value;

    this.root = document.createElement("div");
    this.root.className = "select-control";

    this.select = document.createElement("select");
    this.select.className = "select-control__select";

    for (const option of this.options) {
      const el = document.createElement("option");
      el.textContent = option.label;
      this.select.appendChild(el);
    }

    this.select.selectedIndex = initialIndex !== -1 ? initialIndex : 0;

    this.root.appendChild(this.select);
    this.container.appendChild(this.root);

    this.select.addEventListener("change", this.handleChange);
  }

  public get signalValueChanged(): FerrsignView2<T, T> {
    return this.signalValueChangedInternal;
  }

  public get value(): T {
    return this.currentValue;
  }

  public set value(value: T) {
    const index = this.options.findIndex((o) => o.value === value);
    if (index === -1) {
      return;
    }
    this.select.selectedIndex = index;
    this.currentValue = this.options[index].value;
  }

  public flash(): void {
    this.root.classList.remove("select-control--flash");
    void this.root.offsetWidth;
    this.root.classList.add("select-control--flash");
    this.root.addEventListener(
      "animationend",
      () => {
        this.root.classList.remove("select-control--flash");
      },
      { once: true },
    );
  }

  public destroy(): void {
    this.select.removeEventListener("change", this.handleChange);
    this.root.remove();
  }

  private readonly handleChange = (): void => {
    this.applyValue(this.options[this.select.selectedIndex].value);
  };

  private applyValue(value: T): void {
    if (value === this.currentValue) {
      return;
    }
    const previousValue = this.currentValue;
    this.currentValue = value;
    console.debug("[ESelectControl] value: %o → %o", previousValue, this.currentValue);
    this.signalValueChangedInternal.emit(this.currentValue, previousValue);
  }
}
