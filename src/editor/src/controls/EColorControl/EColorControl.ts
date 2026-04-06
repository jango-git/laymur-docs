import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";
import { ENumberControl } from "../ENumberControl/ENumberControl";

export interface EColorControlOptions {
  value: string; // #RRGGBBAA
}

export class EColorControl {
  private readonly container: HTMLElement;
  private currentValue: string;

  private readonly root: HTMLDivElement;
  private readonly colorInput: HTMLInputElement;
  private readonly alphaContainer: HTMLDivElement;
  private readonly alphaControl: ENumberControl;

  private readonly signalValueChangedInternal = new Ferrsign2<string, string>();

  constructor(container: HTMLElement, options: Partial<EColorControlOptions> = {}) {
    this.container = container;
    this.currentValue = options.value ?? "#000000FF";

    this.root = document.createElement("div");
    this.root.className = "color-control";

    this.colorInput = document.createElement("input");
    this.colorInput.type = "color";
    this.colorInput.className = "color-control__input";
    this.colorInput.setAttribute("aria-label", "Color");

    this.alphaContainer = document.createElement("div");
    this.alphaContainer.className = "color-control__alpha";

    this.alphaControl = new ENumberControl(this.alphaContainer, {
      value: 255,
      min: 0,
      max: 255,
      step: 1,
      precision: 0,
    });

    this.root.appendChild(this.colorInput);
    this.root.appendChild(this.alphaContainer);
    this.container.appendChild(this.root);

    this.colorInput.addEventListener("input", this.handleColorInput);
    this.alphaControl.signalValueChanged.on(this.handleAlphaChanged);

    this.syncDOMFromValue(this.currentValue);
  }

  public get signalValueChanged(): FerrsignView2<string, string> {
    return this.signalValueChangedInternal;
  }

  public get value(): string {
    return this.currentValue;
  }

  public set value(value: string) {
    this.currentValue = value;
    this.syncDOMFromValue(value);
  }

  public flash(): void {
    this.root.classList.remove("color-control--flash");
    void this.root.offsetWidth;
    this.root.classList.add("color-control--flash");
    this.root.addEventListener(
      "animationend",
      () => {
        this.root.classList.remove("color-control--flash");
      },
      { once: true },
    );
  }

  public destroy(): void {
    this.colorInput.removeEventListener("input", this.handleColorInput);
    this.alphaControl.destroy();
    this.root.remove();
  }

  private readonly handleColorInput = (): void => {
    this.emitCombined();
  };

  private readonly handleAlphaChanged = (): void => {
    this.emitCombined();
  };

  private emitCombined(): void {
    const color = this.colorInput.value; // #RRGGBB
    const alphaHex = Math.round(this.alphaControl.value)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
    const newValue = `${color.toUpperCase()}${alphaHex}`;
    if (newValue === this.currentValue) {
      return;
    }
    const previousValue = this.currentValue;
    this.currentValue = newValue;
    console.debug("[EColorControl] value: %o → %o", previousValue, this.currentValue);
    this.signalValueChangedInternal.emit(this.currentValue, previousValue);
  }

  private syncDOMFromValue(value: string): void {
    this.colorInput.value = value.slice(0, 7);
    const alphaHex = value.slice(7, 9);
    this.alphaControl.value = alphaHex.length === 2 ? parseInt(alphaHex, 16) : 255;
  }
}
