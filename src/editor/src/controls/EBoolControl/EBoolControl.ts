import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";

interface EBoolControlOptions {
  value: boolean;
}

export class EBoolControl {
  private readonly container: HTMLElement;
  private currentValue: boolean;

  private readonly root: HTMLDivElement;
  private readonly checkbox: HTMLInputElement;

  private readonly signalValueChangedInternal = new Ferrsign2<boolean, boolean>();

  constructor(container: HTMLElement, options: Partial<EBoolControlOptions> = {}) {
    this.container = container;
    this.currentValue = options.value ?? false;

    this.root = document.createElement("div");
    this.root.className = "bool-control";
    this.root.dataset.checked = String(this.currentValue);

    this.checkbox = document.createElement("input");
    this.checkbox.className = "bool-control__checkbox";
    this.checkbox.type = "checkbox";
    this.checkbox.checked = this.currentValue;
    this.checkbox.tabIndex = 0;
    this.checkbox.setAttribute("aria-label", "Toggle");

    const track = document.createElement("span");
    track.className = "bool-control__track";

    const thumb = document.createElement("span");
    thumb.className = "bool-control__thumb";

    track.appendChild(thumb);
    this.root.appendChild(this.checkbox);
    this.root.appendChild(track);
    this.container.appendChild(this.root);

    this.checkbox.addEventListener("change", this.handleChange);
  }

  public get signalValueChanged(): FerrsignView2<boolean, boolean> {
    return this.signalValueChangedInternal;
  }

  public get value(): boolean {
    return this.currentValue;
  }

  public set value(value: boolean) {
    this.currentValue = value;
    this.checkbox.checked = value;
    this.root.dataset.checked = String(value);
  }

  public flash(): void {
    this.root.classList.remove("bool-control--flash");
    void this.root.offsetWidth;
    this.root.classList.add("bool-control--flash");
    this.root.addEventListener(
      "animationend",
      () => {
        this.root.classList.remove("bool-control--flash");
      },
      { once: true },
    );
  }

  public destroy(): void {
    this.checkbox.removeEventListener("change", this.handleChange);
    this.root.remove();
  }

  private readonly handleChange = (): void => {
    this.applyValue(this.checkbox.checked);
  };

  private applyValue(value: boolean): void {
    if (value === this.currentValue) {
      return;
    }
    const previousValue = this.currentValue;
    this.currentValue = value;
    this.checkbox.checked = value;
    this.root.dataset.checked = String(value);
    console.debug("[EBoolControl] value: %o → %o", previousValue, this.currentValue);
    this.signalValueChangedInternal.emit(this.currentValue, previousValue);
  }
}
