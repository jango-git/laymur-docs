import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";
import { clone } from "../../document/types";
import type { EColor } from "../../document/types.misc";
import { ENumberControl } from "../ENumberControl/ENumberControl";

export interface EColorControlOptions {
  value: EColor;
}

export class EColorControl {
  private readonly container: HTMLElement;
  private currentValue: EColor;

  private readonly root: HTMLDivElement;
  private readonly colorInput: HTMLInputElement;
  private readonly alphaContainer: HTMLDivElement;
  private readonly alphaControl: ENumberControl;

  private readonly signalValueChangedInternal = new Ferrsign2<EColor, EColor>();

  constructor(container: HTMLElement, options: Partial<EColorControlOptions> = {}) {
    this.container = container;
    this.currentValue = {
      color: options.value?.color ?? "#ffffff",
      alpha: options.value?.alpha ?? 1,
    };

    this.root = document.createElement("div");
    this.root.className = "color-control";

    this.colorInput = document.createElement("input");
    this.colorInput.type = "color";
    this.colorInput.className = "color-control__input";
    this.colorInput.setAttribute("aria-label", "Color");

    this.alphaContainer = document.createElement("div");
    this.alphaContainer.className = "color-control__alpha";

    this.alphaControl = new ENumberControl(this.alphaContainer, {
      value: 1,
      min: 0,
      max: 1,
      step: 1 / 255,
      precision: 3,
    });

    this.root.appendChild(this.colorInput);
    this.root.appendChild(this.alphaContainer);
    this.container.appendChild(this.root);

    this.colorInput.addEventListener("input", this.handleColorInput);
    this.alphaControl.signalValueChanged.on(this.handleAlphaChanged);

    this.syncDOMFromValue(this.currentValue);
  }

  public get signalValueChanged(): FerrsignView2<EColor, EColor> {
    return this.signalValueChangedInternal;
  }

  public get value(): Readonly<EColor> {
    return clone(this.currentValue);
  }

  public set value(value: EColor) {
    this.currentValue = clone(value);
    this.syncDOMFromValue(this.currentValue);
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
    const alpha = this.alphaControl.value;
    if (color === this.currentValue.color && alpha === this.currentValue.alpha) {
      return;
    }
    const previousValue = this.currentValue;
    this.currentValue = { color, alpha };
    console.debug("[EColorControl] value: %o → %o", previousValue, this.currentValue);
    this.signalValueChangedInternal.emit(this.currentValue, previousValue);
  }

  private syncDOMFromValue(value: EColor): void {
    this.colorInput.value = value.color;
    this.alphaControl.value = value.alpha;
  }
}
