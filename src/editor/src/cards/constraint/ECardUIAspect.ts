import type { FerrsignView2 } from "ferrsign";
import { ENumberControl } from "../../controls/ENumberControl/ENumberControl";
import type { EConstraintCardContext } from "./EConstraintCard";
import { EConstraintCard } from "./EConstraintCard";

export interface ECardUIAspectModel {
  name: string;
  element: string;
  value: number;
}

export class ECardUIAspect extends EConstraintCard<ECardUIAspectModel> {
  private readonly valueControl: ENumberControl;

  constructor(
    container: HTMLElement,
    model: ECardUIAspectModel,
    context: EConstraintCardContext = {},
  ) {
    super(container, model, "Aspect", context);
    this.setElements([model.element]);

    this.valueControl = new ENumberControl(this.addRow("Value"), {
      value: model.value,
      min: 0.025,
      max: 10,
      step: 0.025,
    });

    this.valueControl.signalValueChanged.on((value) => {
      const previous = { ...this.model };
      this.model = { ...this.model, value };
      this.signalModelChangedInternal.emit(this.model, previous);
    });
  }

  public get signalModelChanged(): FerrsignView2<ECardUIAspectModel, ECardUIAspectModel> {
    return this.signalModelChangedInternal;
  }

  public override destroy(): void {
    this.valueControl.destroy();
    super.destroy();
  }
}
