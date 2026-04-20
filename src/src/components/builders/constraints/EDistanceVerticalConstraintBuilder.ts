import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EVerticalDistanceConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type {
  EElementConstraintTarget,
  EUniversalConstraintTarget,
} from "../../../miscellaneous/constraint-targets";
import {
  getElementConstraintTargets,
  getUniversalConstraintTargets,
} from "../../../miscellaneous/constraint-targets";
import {
  generateConstraintUUID,
  generateElementUUID,
  generateLayerUUID,
} from "../../../miscellaneous/generate-uuid";
import { makeRow } from "../../../miscellaneous/rows";
import { UI_STATE } from "../../../ui-state/EUIState";
import { TOAST } from "../../toast/EToast";

export class EDistanceVerticalConstraintBuilder {
  private readonly elementAControl: EAssetControl<EUniversalConstraintTarget>;
  private readonly elementBControl: EAssetControl<EElementConstraintTarget>;

  constructor(container: HTMLElement) {
    this.elementAControl = new EAssetControl<EUniversalConstraintTarget>(
      makeRow(container, "Element A"),
      getUniversalConstraintTargets,
    );

    this.elementBControl = new EAssetControl<EElementConstraintTarget>(
      makeRow(container, "Element B"),
      getElementConstraintTargets,
    );
  }

  public build(): void {
    const data: EVerticalDistanceConstraint = {
      uuid: generateConstraintUUID(),
      type: EConstraintType.DISTANCE_VERTICAL,
      name: "",
      elementA: this.elementAControl.value?.uuid ?? generateLayerUUID(),
      elementB: this.elementBControl.value?.uuid ?? generateElementUUID(),
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
