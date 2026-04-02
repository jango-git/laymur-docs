import type { FerrsignView2 } from "ferrsign";
import { ENumberControl } from "../../controls/ENumberControl/ENumberControl";
import type { EConstraintCardContext } from "./EConstraintCard";
import { EConstraintCard } from "./EConstraintCard";

export interface ECardUIDistanceModel {
  name: string;
  elementA: string;
  elementB: string;
  anchorA: number;
  anchorB: number;
  distance: number;
}

abstract class ECardUIDistanceBase extends EConstraintCard<ECardUIDistanceModel> {
  private readonly anchorAControl: ENumberControl;
  private readonly anchorBControl: ENumberControl;
  private readonly distanceControl: ENumberControl;

  constructor(
    container: HTMLElement,
    model: ECardUIDistanceModel,
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

    this.distanceControl = new ENumberControl(this.addRow("Distance"), {
      value: model.distance,
      step: 5,
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

    this.distanceControl.signalValueChanged.on((distance) => {
      const previous = { ...this.model };
      this.model = { ...this.model, distance };
      this.signalModelChangedInternal.emit(this.model, previous);
    });
  }

  public get signalModelChanged(): FerrsignView2<ECardUIDistanceModel, ECardUIDistanceModel> {
    return this.signalModelChangedInternal;
  }

  public override destroy(): void {
    this.anchorAControl.destroy();
    this.anchorBControl.destroy();
    this.distanceControl.destroy();
    super.destroy();
  }
}

export class ECardUIHorizontalDistance extends ECardUIDistanceBase {
  constructor(
    container: HTMLElement,
    model: ECardUIDistanceModel,
    context: EConstraintCardContext = {},
  ) {
    super(container, model, "H. Distance", context);
  }
}

export class ECardUIVerticalDistance extends ECardUIDistanceBase {
  constructor(
    container: HTMLElement,
    model: ECardUIDistanceModel,
    context: EConstraintCardContext = {},
  ) {
    super(container, model, "V. Distance", context);
  }
}
