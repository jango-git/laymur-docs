import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import type { EStoreDeltaConstraint } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EVerticalSizeConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { EConstraintUuid } from "../../../document/types.misc";
import type { EConstraintTarget } from "../../../utils/constraint-targets";
import { getConstraintElements } from "../../../utils/constraint-targets";
import { makeRow } from "../../../utils/rows";

export class EVerticalSizeConstraintCard {
  private readonly elementControl: EAssetControl<EConstraintTarget>;
  private readonly sizeControl: ENumberControl;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EConstraintUuid,
  ) {
    const root = document.createElement("div");
    root.className = "element-card";

    this.elementControl = new EAssetControl<EConstraintTarget>(
      makeRow(root, "Element"),
      getConstraintElements,
      { nullable: false },
    );
    this.elementControl.signalValueChanged.on(this.onElementChanged);

    this.sizeControl = new ENumberControl(makeRow(root, "Size"), {
      value: 100,
      min: 0,
      max: 99999,
      step: 1,
      precision: 1,
    });
    this.sizeControl.signalValueChanged.on(this.onSizeChanged);

    this.container.appendChild(root);

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
    this.elementControl.value = getConstraintElements().find((e) => e.uuid === constraint.element);
    this.sizeControl.value = constraint.size;
  }

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
