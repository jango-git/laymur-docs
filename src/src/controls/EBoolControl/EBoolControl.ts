import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";

export interface EBoolControlOptions {
  value: boolean;
}

export class EBoolControl {
  private readonly container: HTMLElement;
  private currentValue: boolean;

  private readonly root: HTMLDivElement;

  private readonly signalValueChangedInternal = new Ferrsign2<boolean, boolean>();

  constructor(container: HTMLElement, options: Partial<EBoolControlOptions> = {}) {
    this.container = container;
    this.currentValue = options.value ?? false;

    this.root = document.createElement("div");
    this.root.className = "bool-control";
    this.root.dataset.checked = String(this.currentValue);
    this.root.tabIndex = 0;
    this.root.setAttribute("role", "switch");
    this.root.setAttribute("aria-checked", String(this.currentValue));

    const track = document.createElement("span");
    track.className = "bool-control__track";

    const thumb = document.createElement("span");
    thumb.className = "bool-control__thumb";

    track.appendChild(thumb);
    this.root.appendChild(track);
    this.container.appendChild(this.root);

    this.root.addEventListener("click", this.handleClick);
    this.root.addEventListener("keydown", this.handleKeydown);
  }

  public get signalValueChanged(): FerrsignView2<boolean, boolean> {
    return this.signalValueChangedInternal;
  }

  public get value(): boolean {
    return this.currentValue;
  }

  public set value(value: boolean) {
    this.currentValue = value;
    this.root.dataset.checked = String(value);
    this.root.setAttribute("aria-checked", String(value));
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
    this.root.removeEventListener("click", this.handleClick);
    this.root.removeEventListener("keydown", this.handleKeydown);
    this.root.remove();
  }

  private readonly handleClick = (): void => {
    this.applyValue(!this.currentValue);
  };

  private readonly handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this.applyValue(!this.currentValue);
    }
  };

  private applyValue(value: boolean): void {
    if (value === this.currentValue) {
      return;
    }
    const previousValue = this.currentValue;
    this.currentValue = value;
    this.root.dataset.checked = String(value);
    this.root.setAttribute("aria-checked", String(value));
    this.signalValueChangedInternal.emit(this.currentValue, previousValue);
  }
}
