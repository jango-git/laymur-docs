import type { FerrsignView2 } from "ferrsign";
import { ENumberControl } from "../../controls/ENumberControl/ENumberControl";
import type { EConstraintCardContext } from "./EConstraintCard";
import { EConstraintCard } from "./EConstraintCard";

export interface ECardUISizeModel {
  name: string;
  element: string;
  value: number;
}

abstract class ECardUISizeBase extends EConstraintCard<ECardUISizeModel> {
  private readonly valueControl: ENumberControl;

  constructor(
    container: HTMLElement,
    model: ECardUISizeModel,
    typeLabel: string,
    context: EConstraintCardContext = {},
  ) {
    super(container, model, typeLabel, context);
    this.setElements([model.element]);

    this.valueControl = new ENumberControl(this.addRow("Value"), {
      value: model.value,
      step: 1,
    });

    this.valueControl.signalValueChanged.on((value) => {
      const previous = { ...this.model };
      this.model = { ...this.model, value };
      this.signalModelChangedInternal.emit(this.model, previous);
    });
  }

  public get signalModelChanged(): FerrsignView2<ECardUISizeModel, ECardUISizeModel> {
    return this.signalModelChangedInternal;
  }

  public override destroy(): void {
    this.valueControl.destroy();
    super.destroy();
  }
}

export class ECardUIHorizontalSize extends ECardUISizeBase {
  constructor(
    container: HTMLElement,
    model: ECardUISizeModel,
    context: EConstraintCardContext = {},
  ) {
    super(container, model, "H. Size", context);
  }
}

export class ECardUIVerticalSize extends ECardUISizeBase {
  constructor(
    container: HTMLElement,
    model: ECardUISizeModel,
    context: EConstraintCardContext = {},
  ) {
    super(container, model, "V. Size", context);
  }
}
