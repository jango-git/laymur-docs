import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EVerticalDistanceConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { EConstraintTarget } from "../../../miscellaneous/constraint-targets";
import { getConstraintTargets } from "../../../miscellaneous/constraint-targets";
import { makeRow } from "../../../miscellaneous/rows";
import { UI_STATE } from "../../../ui-state/ui-state";
import { TOAST } from "../../toast/EToast";

export class EDistanceVerticalConstraintBuilder {
  private readonly elementAControl: EAssetControl<EConstraintTarget>;
  private readonly elementBControl: EAssetControl<EConstraintTarget>;

  constructor(container: HTMLElement) {
    this.elementAControl = new EAssetControl<EConstraintTarget>(
      makeRow(container, "Element A"),
      getConstraintTargets,
    );

    this.elementBControl = new EAssetControl<EConstraintTarget>(
      makeRow(container, "Element B"),
      getConstraintTargets,
    );
  }

  public build(): void {
    const data: EVerticalDistanceConstraint = {
      uuid: crypto.randomUUID(),
      type: EConstraintType.DISTANCE_VERTICAL,
      name: "",
      elementA: this.elementAControl.value?.uuid ?? "",
      elementB: this.elementBControl.value?.uuid ?? "",
      anchorA: 0,
      anchorB: 0,
      distance: 0,
    };

    const error = STORE.validators.constraints.distanceVertical(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.constraints.add(UI_STATE.forceActiveLayerUuid, data);
      this.elementAControl.value = undefined;
      this.elementBControl.value = undefined;
      return;
    }

    TOAST.warning(`**[EDistanceVerticalConstraintBuilder]** ${error.message}`);

    if (error.field === "elementA") {
      this.elementAControl.flash();
    } else if (error.field === "elementB") {
      this.elementBControl.flash();
    }
  }
}
