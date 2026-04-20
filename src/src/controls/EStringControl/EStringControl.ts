import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";

export interface EStringControlOptions {
  value: string;
  placeholder: string;
}

export class EStringControl {
  private readonly container: HTMLElement;
  private currentValue: string;

  private readonly root: HTMLDivElement;
  private readonly display: HTMLSpanElement;
  private readonly input: HTMLInputElement;

  private readonly signalValueChangedInternal = new Ferrsign2<string, string>();

  constructor(container: HTMLElement, options: Partial<EStringControlOptions> = {}) {
    this.container = container;
    this.currentValue = options.value ?? "";

    this.root = document.createElement("div");
    this.root.className = "string-control";
    this.root.dataset.state = "view";

    this.display = document.createElement("span");
    this.display.className = "string-control__display";

    this.input = document.createElement("input");
    this.input.className = "string-control__input";
    this.input.type = "text";
    if (options.placeholder !== undefined) {
      this.input.placeholder = options.placeholder;
    }

    this.root.appendChild(this.display);
    this.root.appendChild(this.input);
    this.container.appendChild(this.root);

    this.root.addEventListener("click", this.handleClick);
    this.input.addEventListener("keydown", this.handleInputKeyDown);
    this.input.addEventListener("blur", this.handleInputBlur);

    this.refreshDisplay();
  }

  public get signalValueChanged(): FerrsignView2<string, string> {
    return this.signalValueChangedInternal;
  }

  public get value(): string {
    return this.currentValue;
  }

  public set value(value: string) {
    this.currentValue = value;
    this.refreshDisplay();
  }

  public flash(): void {
    this.root.classList.remove("string-control--flash");
    void this.root.offsetWidth;
    this.root.classList.add("string-control--flash");
    this.root.addEventListener(
      "animationend",
      () => {
        this.root.classList.remove("string-control--flash");
      },
      { once: true },
    );
  }

  public destroy(): void {
    this.root.removeEventListener("click", this.handleClick);
    this.input.removeEventListener("keydown", this.handleInputKeyDown);
    this.input.removeEventListener("blur", this.handleInputBlur);
    this.root.remove();
  }

  private readonly handleClick = (): void => {
    if (this.root.dataset.state === "view") {
      this.transitionTo("edit");
    }
  };

  private readonly handleInputKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      this.commitEdit();
    } else if (event.key === "Escape") {
      this.transitionTo("view");
    }
  };

  private readonly handleInputBlur = (): void => {
    if (this.root.dataset.state === "edit") {
      this.commitEdit();
    }
  };

  private transitionTo(state: "view" | "edit"): void {
    this.root.dataset.state = state;
    if (state === "edit") {
      this.input.value = this.currentValue;
      requestAnimationFrame(() => {
        this.input.focus();
        this.input.select();
      });
    }
  }

  private commitEdit(): void {
    this.applyValue(this.input.value);
    this.transitionTo("view");
  }

  private applyValue(value: string): void {
    if (value === this.currentValue) {
      return;
    }
    const previousValue = this.currentValue;
    this.currentValue = value;
    this.refreshDisplay();
    this.signalValueChangedInternal.emit(this.currentValue, previousValue);
  }

  private refreshDisplay(): void {
    this.display.textContent = this.currentValue.length > 0 ? this.currentValue : "\u00A0";
  }
}
