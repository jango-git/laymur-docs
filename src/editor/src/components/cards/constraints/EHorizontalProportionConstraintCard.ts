import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import type { EStoreDeltaConstraint } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EHorizontalProportionConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { EConstraintUuid } from "../../../document/types.misc";
import type { EConstraintTarget } from "../../../utils/constraint-targets";
import { getConstraintTargets } from "../../../utils/constraint-targets";
import { makeRow } from "../../../utils/rows";

export class EHorizontalProportionConstraintCard {
  private readonly elementAControl: EAssetControl<EConstraintTarget>;
  private readonly elementBControl: EAssetControl<EConstraintTarget>;
  private readonly proportionControl: ENumberControl;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EConstraintUuid,
  ) {
    const root = document.createElement("div");
    root.className = "element-card";

    this.elementAControl = new EAssetControl<EConstraintTarget>(
      makeRow(root, "Element A"),
      getConstraintTargets,
      { nullable: false },
    );
    this.elementAControl.signalValueChanged.on(this.onElementAChanged);

    this.elementBControl = new EAssetControl<EConstraintTarget>(
      makeRow(root, "Element B"),
      getConstraintTargets,
      { nullable: false },
    );
    this.elementBControl.signalValueChanged.on(this.onElementBChanged);

    this.proportionControl = new ENumberControl(makeRow(root, "Proportion"), {
      value: 1,
      min: 0.01,
      max: 100,
      step: 0.01,
      precision: 2,
    });
    this.proportionControl.signalValueChanged.on(this.onProportionChanged);

    this.container.appendChild(root);

    const initial = STORE.selectors.constraints.select(uuid);
    if (initial?.type !== EConstraintType.PROPORTION_HORIZONTAL) {
      throw new Error(
        "EHorizontalProportionConstraintCard: initial constraint is not a horizontal proportion constraint",
      );
    }

    this.refresh(initial);
    STORE.signals.constraints.item.on(this.onConstraintItemChanged);
  }

  private refresh(constraint: EHorizontalProportionConstraint): void {
    const targets = getConstraintTargets();
    this.elementAControl.value = targets.find((e) => e.uuid === constraint.elementA);
    this.elementBControl.value = targets.find((e) => e.uuid === constraint.elementB);
    this.proportionControl.value = constraint.proportion;
  }

  private readonly onElementAChanged = (next: EConstraintTarget | undefined): void => {
    if (next !== undefined) {
      STORE.commands.constraints.writeHorizontalProportion({
        uuid: this.uuid,
        elementA: next.uuid,
      });
    }
  };

  private readonly onElementBChanged = (next: EConstraintTarget | undefined): void => {
    if (next !== undefined) {
      STORE.commands.constraints.writeHorizontalProportion({
        uuid: this.uuid,
        elementB: next.uuid,
      });
    }
  };

  private readonly onProportionChanged = (proportion: number): void => {
    STORE.commands.constraints.writeHorizontalProportion({ uuid: this.uuid, proportion });
  };

  private readonly onConstraintItemChanged = (delta: EStoreDeltaConstraint): void => {
    if (
      delta.constraint.uuid === this.uuid &&
      delta.constraint.type === EConstraintType.PROPORTION_HORIZONTAL
    ) {
      this.refresh(delta.constraint);
    }
  };
}
