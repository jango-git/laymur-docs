import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import type { EStoreDeltaConstraint } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EAspectConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { UUID } from "../../../document/types.misc";
import type { EConstraintTarget } from "../../../miscellaneous/constraint-targets";
import { getConstraintElements } from "../../../miscellaneous/constraint-targets";
import { makeRow } from "../../../miscellaneous/rows";
import { EConstraintCard } from "./EConstraintCard";

export class EAspectConstraintCard extends EConstraintCard {
  private readonly elementControl: EAssetControl<EConstraintTarget>;
  private readonly aspectControl: ENumberControl;

  constructor(container: HTMLElement, uuid: UUID, layerUuid: UUID) {
    super(container, uuid, layerUuid, "Aspect");

    this.nameControl.signalValueChanged.on(this.onNameChanged);

    this.elementControl = new EAssetControl<EConstraintTarget>(
      makeRow(this.bodyRoot, "Element"),
      getConstraintElements,
      { nullable: false },
    );
    this.elementControl.signalValueChanged.on(this.onElementChanged);

    this.aspectControl = new ENumberControl(makeRow(this.bodyRoot, "Aspect"), {
      value: 1,
      min: 0.01,
      max: 100,
      step: 0.01,
      precision: 2,
    });
    this.aspectControl.signalValueChanged.on(this.onAspectChanged);

    const initial = STORE.selectors.constraints.select(uuid);
    if (initial?.type !== EConstraintType.ASPECT) {
      throw new Error("EAspectConstraintCard: initial constraint is not an aspect constraint");
    }

    this.refresh(initial);
    STORE.signals.constraints.item.on(this.onConstraintItemChanged);
  }

  private refresh(constraint: EAspectConstraint): void {
    this.nameControl.value = constraint.name;
    const elements = getConstraintElements();
    this.elementControl.value = elements.find((e) => e.uuid === constraint.element);
    this.aspectControl.value = constraint.aspect;
  }

  private readonly onNameChanged = (name: string): void => {
    STORE.commands.constraints.writeAspect({ uuid: this.uuid, name });
  };

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
