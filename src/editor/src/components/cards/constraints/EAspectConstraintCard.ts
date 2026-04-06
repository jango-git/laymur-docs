import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import type { EStoreDeltaConstraint } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EAspectConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { EConstraintUuid } from "../../../document/types.misc";
import type { EConstraintTarget } from "../../../utils/constraint-targets";
import { getConstraintElements } from "../../../utils/constraint-targets";
import { makeRow } from "../../../utils/rows";

export class EAspectConstraintCard {
  private readonly elementControl: EAssetControl<EConstraintTarget>;
  private readonly aspectControl: ENumberControl;

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

    this.aspectControl = new ENumberControl(makeRow(root, "Aspect"), {
      value: 1,
      min: 0.01,
      max: 100,
      step: 0.01,
      precision: 2,
    });
    this.aspectControl.signalValueChanged.on(this.onAspectChanged);

    this.container.appendChild(root);

    const initial = STORE.selectors.constraints.select(uuid);
    if (initial?.type !== EConstraintType.ASPECT) {
      throw new Error("EAspectConstraintCard: initial constraint is not an aspect constraint");
    }

    this.refresh(initial);
    STORE.signals.constraints.item.on(this.onConstraintItemChanged);
  }

  private refresh(constraint: EAspectConstraint): void {
    const elements = getConstraintElements();
    this.elementControl.value = elements.find((e) => e.uuid === constraint.element);
    this.aspectControl.value = constraint.aspect;
  }

  private readonly onElementChanged = (next: EConstraintTarget | undefined): void => {
    if (next !== undefined) {
      STORE.commands.constraints.writeAspect({ uuid: this.uuid, element: next.uuid });
    }
  };

  private readonly onAspectChanged = (aspect: number): void => {
    STORE.commands.constraints.writeAspect({ uuid: this.uuid, aspect });
  };

  private readonly onConstraintItemChanged = (delta: EStoreDeltaConstraint): void => {
    if (delta.constraint.uuid === this.uuid && delta.constraint.type === EConstraintType.ASPECT) {
      this.refresh(delta.constraint);
    }
  };
}
