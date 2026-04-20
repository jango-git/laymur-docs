import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import { EVec2Control } from "../../../controls/EVec2Control/EVec2Control";
import type { EStoreDeltaConstraint } from "../../../document/signals/constraints";
import { STORE } from "../../../document/store";
import type { EVerticalDistanceConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { EConstraintUUID, ELayerUUID } from "../../../document/types.misc";
import type {
  EElementConstraintTarget,
  EUniversalConstraintTarget,
} from "../../../miscellaneous/constraint-targets";
import {
  getElementConstraintTargets,
  getUniversalConstraintTargets,
} from "../../../miscellaneous/constraint-targets";
import { LARGE_VALUE } from "../../../miscellaneous/math";
import { makeRow } from "../../../miscellaneous/rows";
import { EConstraintCard } from "./EConstraintCard";

export class EVerticalDistanceConstraintCard extends EConstraintCard {
  private readonly elementAControl: EAssetControl<EUniversalConstraintTarget>;
  private readonly elementBControl: EAssetControl<EElementConstraintTarget>;
  private readonly anchorsControl: EVec2Control;
  private readonly distanceControl: ENumberControl;

  constructor(container: HTMLElement, uuid: EConstraintUUID, layerUuid: ELayerUUID) {
    super(container, uuid, layerUuid, "Distance Vertical");

    this.nameControl.signalValueChanged.on(this.onNameChanged);

    this.elementAControl = new EAssetControl<EUniversalConstraintTarget>(
      makeRow(this.bodyRoot, "Element A"),
      getUniversalConstraintTargets,
      { nullable: false },
    );
    this.elementAControl.signalValueChanged.on(this.onElementAChanged);

    this.elementBControl = new EAssetControl<EElementConstraintTarget>(
      makeRow(this.bodyRoot, "Element B"),
      getElementConstraintTargets,
      { nullable: false },
    );
    this.elementBControl.signalValueChanged.on(this.onElementBChanged);

    this.anchorsControl = new EVec2Control(makeRow(this.bodyRoot, "Anchors"), {
      labels: ["A", "B"],
      min: 0,
      max: 1,
      step: 0.01,
      precision: 2,
    });
    this.anchorsControl.signalValueChanged.on(this.onAnchorsChanged);

    this.distanceControl = new ENumberControl(makeRow(this.bodyRoot, "Distance"), {
      value: 0,
      min: -LARGE_VALUE,
      max: LARGE_VALUE,
      step: 1,
      precision: 1,
    });
    this.distanceControl.signalValueChanged.on(this.onDistanceChanged);

    const initial = STORE.selectors.constraints.select(uuid);
    if (initial?.type !== EConstraintType.DISTANCE_VERTICAL) {
      throw new Error(
        "EVerticalDistanceConstraintCard: initial constraint is not a vertical distance constraint",
      );
    }

    this.refresh(initial);
    STORE.signals.constraints.item.on(this.onConstraintItemChanged);
  }

  private refresh(constraint: EVerticalDistanceConstraint): void {
    this.nameControl.value = constraint.name;
    this.elementAControl.value = getUniversalConstraintTargets().find(
      (e) => e.uuid === constraint.elementA,
    );
    this.elementBControl.value = getElementConstraintTargets().find(
      (e) => e.uuid === constraint.elementB,
    );
    this.anchorsControl.value = [constraint.anchorA, constraint.anchorB];
    this.distanceControl.value = constraint.distance;
  }

  private readonly onNameChanged = (name: string): void => {
    STORE.commands.constraints.writeVerticalDistance({ uuid: this.uuid, name });
  };

  private readonly onElementAChanged = (next: EUniversalConstraintTarget | undefined): void => {
    if (next !== undefined) {
      STORE.commands.constraints.writeVerticalDistance({ uuid: this.uuid, elementA: next.uuid });
    }
  };

  private readonly onElementBChanged = (next: EElementConstraintTarget | undefined): void => {
    if (next !== undefined) {
      STORE.commands.constraints.writeVerticalDistance({ uuid: this.uuid, elementB: next.uuid });
    }
  };

  private readonly onAnchorsChanged = ([a, b]: [number, number]): void => {
    STORE.commands.constraints.writeVerticalDistance({ uuid: this.uuid, anchorA: a, anchorB: b });
  };

  private readonly onDistanceChanged = (distance: number): void => {
    STORE.commands.constraints.writeVerticalDistance({ uuid: this.uuid, distance });
  };

  private readonly onConstraintItemChanged = (delta: EStoreDeltaConstraint): void => {
    if (
      delta.constraint.uuid === this.uuid &&
      delta.constraint.type === EConstraintType.DISTANCE_VERTICAL
    ) {
      this.refresh(delta.constraint);
    }
  };
}
