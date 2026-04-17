import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";
import type { ENumberControlOptions } from "../ENumberControl/ENumberControl";
import { ENumberControl } from "../ENumberControl/ENumberControl";

export interface EVec2ControlOptions {
  labels?: [string, string];
  value?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

export class EVec2Control {
  private readonly xControl: ENumberControl;
  private readonly yControl: ENumberControl;

  private readonly signalValueChangedInternal = new Ferrsign2<[number, number], [number, number]>();

  constructor(container: HTMLElement, options: EVec2ControlOptions = {}) {
    const [labelX, labelY] = options.labels ?? ["X", "Y"];
    const shared: Partial<ENumberControlOptions> = {
      min: options.min,
      max: options.max,
      step: options.step,
      precision: options.precision,
    };

    const root = document.createElement("div");
    root.className = "vec2-control";

    const spanX = document.createElement("span");
    spanX.className = "vec2-control__label";
    spanX.textContent = labelX;
    root.appendChild(spanX);

    this.xControl = new ENumberControl(root, { ...shared, value: options.value?.[0] ?? 0 });

    const spanY = document.createElement("span");
    spanY.className = "vec2-control__label";
    spanY.textContent = labelY;
    root.appendChild(spanY);

    this.yControl = new ENumberControl(root, { ...shared, value: options.value?.[1] ?? 0 });

    container.appendChild(root);

    this.xControl.signalValueChanged.on(this.handleXChanged);
    this.yControl.signalValueChanged.on(this.handleYChanged);
  }

  public get signalValueChanged(): FerrsignView2<[number, number], [number, number]> {
    return this.signalValueChangedInternal;
  }

  public get value(): [number, number] {
    return [this.xControl.value, this.yControl.value];
  }

  public set value(next: [number, number]) {
    this.xControl.value = next[0];
    this.yControl.value = next[1];
  }

  public set min(min: number) {
    this.xControl.min = min;
    this.yControl.min = min;
  }

  public set max(max: number) {
    this.xControl.max = max;
    this.yControl.max = max;
  }

  public set step(step: number) {
    this.xControl.step = step;
    this.yControl.step = step;
  }

  public set precision(precision: number) {
    this.xControl.precision = precision;
    this.yControl.precision = precision;
  }

  private readonly handleXChanged = (next: number, prev: number): void => {
    this.signalValueChangedInternal.emit([next, this.yControl.value], [prev, this.yControl.value]);
  };

  private readonly handleYChanged = (next: number, prev: number): void => {
    this.signalValueChangedInternal.emit([this.xControl.value, next], [this.xControl.value, prev]);
  };
}
