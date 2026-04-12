import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import type { EStoreDeltaConstraint } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EVerticalSizeConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { UUID } from "../../../document/types.misc";
import type { EConstraintTarget } from "../../../utils/constraint-targets";
import { getConstraintElements } from "../../../utils/constraint-targets";
import { makeRow } from "../../../utils/rows";
import { EConstraintCard } from "./EConstraintCard";

export class EVerticalSizeConstraintCard extends EConstraintCard {
  private readonly elementControl: EAssetControl<EConstraintTarget>;
  private readonly sizeControl: ENumberControl;

  constructor(container: HTMLElement, uuid: UUID, layerUuid: UUID) {
    super(container, uuid, layerUuid, "Size Vertical");

    this.nameControl.signalValueChanged.on(this.onNameChanged);

    this.elementControl = new EAssetControl<EConstraintTarget>(
      makeRow(this.bodyRoot, "Element"),
      getConstraintElements,
      { nullable: false },
    );
    this.elementControl.signalValueChanged.on(this.onElementChanged);

    this.sizeControl = new ENumberControl(makeRow(this.bodyRoot, "Size"), {
      value: 100,
      min: 0,
      max: 99999,
      step: 1,
      precision: 1,
    });
    this.sizeControl.signalValueChanged.on(this.onSizeChanged);

    const initial = STORE.selectors.constraints.select(uuid);
    if (initial?.type !== EConstraintType.SIZE_VERTICAL) {
      throw new Error(
        "EVerticalSizeConstraintCard: initial constraint is not a vertical size constraint",
      );
    }

    this.refresh(initial);
    STORE.signals.constraints.item.on(this.onConstraintItemChanged);
  }

  private refresh(constraint: EVerticalSizeConstraint): void {
    this.nameControl.value = constraint.name;
    this.elementControl.value = getConstraintElements().find((e) => e.uuid === constraint.element);
    this.sizeControl.value = constraint.size;
  }

  private readonly onNameChanged = (name: string): void => {
    STORE.commands.constraints.writeVerticalSize({ uuid: this.uuid, name });
  };

  private readonly onElementChanged = (next: EConstraintTarget | undefined): void => {
    if (next !== undefined) {
      STORE.commands.constraints.writeVerticalSize({ uuid: this.uuid, element: next.uuid });
    }
  };

  private readonly onSizeChanged = (size: number): void => {
    STORE.commands.constraints.writeVerticalSize({ uuid: this.uuid, size });
  };

  private readonly onConstraintItemChanged = (delta: EStoreDeltaConstraint): void => {
    if (
      delta.constraint.uuid === this.uuid &&
      delta.constraint.type === EConstraintType.SIZE_VERTICAL
    ) {
      this.refresh(delta.constraint);
    }
  };
}
