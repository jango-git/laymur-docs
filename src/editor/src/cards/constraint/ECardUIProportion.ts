import type { FerrsignView2 } from "ferrsign";
import { ENumberControl } from "../../controls/ENumberControl/ENumberControl";
import type { EConstraintCardContext } from "./EConstraintCard";
import { EConstraintCard } from "./EConstraintCard";

export interface ECardUIProportionModel {
  name: string;
  elementA: string;
  elementB: string;
  anchorA: number;
  anchorB: number;
  proportion: number;
}

abstract class ECardUIProportionBase extends EConstraintCard<ECardUIProportionModel> {
  private readonly anchorAControl: ENumberControl;
  private readonly anchorBControl: ENumberControl;
  private readonly proportionControl: ENumberControl;

  constructor(
    container: HTMLElement,
    model: ECardUIProportionModel,
    typeLabel: string,
    context: EConstraintCardContext = {},
  ) {
    super(container, model, typeLabel, context);
    this.setElements([model.elementA, model.elementB]);

    this.anchorAControl = new ENumberControl(this.addRow("Anchor A"), {
      value: model.anchorA,
      min: 0,
      max: 1,
      step: 0.01,
    });

    this.anchorBControl = new ENumberControl(this.addRow("Anchor B"), {
      value: model.anchorB,
      min: 0,
      max: 1,
      step: 0.01,
    });

    this.proportionControl = new ENumberControl(this.addRow("Proportion"), {
      value: model.proportion,
      min: 0.025,
      max: 10,
      step: 0.025,
    });

    this.anchorAControl.signalValueChanged.on((anchorA) => {
      const previous = { ...this.model };
      this.model = { ...this.model, anchorA };
      this.signalModelChangedInternal.emit(this.model, previous);
    });

    this.anchorBControl.signalValueChanged.on((anchorB) => {
      const previous = { ...this.model };
      this.model = { ...this.model, anchorB };
      this.signalModelChangedInternal.emit(this.model, previous);
    });

    this.proportionControl.signalValueChanged.on((proportion) => {
      const previous = { ...this.model };
      this.model = { ...this.model, proportion };
      this.signalModelChangedInternal.emit(this.model, previous);
    });
  }

  public get signalModelChanged(): FerrsignView2<ECardUIProportionModel, ECardUIProportionModel> {
    return this.signalModelChangedInternal;
  }

  public override destroy(): void {
    this.anchorAControl.destroy();
    this.anchorBControl.destroy();
    this.proportionControl.destroy();
    super.destroy();
  }
}

export class ECardUIHorizontalProportion extends ECardUIProportionBase {
  constructor(
    container: HTMLElement,
    model: ECardUIProportionModel,
    context: EConstraintCardContext = {},
  ) {
    super(container, model, "H. Proportion", context);
  }
}

export class ECardUIVerticalProportion extends ECardUIProportionBase {
  constructor(
    container: HTMLElement,
    model: ECardUIProportionModel,
    context: EConstraintCardContext = {},
  ) {
    super(container, model, "V. Proportion", context);
  }
}
