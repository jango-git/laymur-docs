import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EVerticalProportionConstraint } from "../../../document/types.constraints";
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

export class EProportionVerticalConstraintBuilder {
  private readonly elementAControl: EAssetControl<EUniversalConstraintTarget>;
  private readonly elementBControl: EAssetControl<EElementConstraintTarget>;

  constructor(private readonly container: HTMLElement) {
    this.elementAControl = new EAssetControl<EUniversalConstraintTarget>(
      makeRow(this.container, "Element A"),
      getUniversalConstraintTargets,
    );

    this.elementBControl = new EAssetControl<EElementConstraintTarget>(
      makeRow(this.container, "Element B"),
      getElementConstraintTargets,
    );
  }

  public build(): void {
    const data: EVerticalProportionConstraint = {
      uuid: generateConstraintUUID(),
      type: EConstraintType.PROPORTION_VERTICAL,
      name: "",
      elementA: this.elementAControl.value?.uuid ?? generateLayerUUID(),
      elementB: this.elementBControl.value?.uuid ?? generateElementUUID(),
      proportion: 1,
    };

    const error = STORE.validators.constraints.proportionVertical(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.constraints.add(UI_STATE.forceActiveLayerUuid, data);
      this.elementAControl.value = undefined;
      this.elementBControl.value = undefined;
      return;
    }

    TOAST.warning(`**[EProportionVerticalConstraintBuilder]** ${error.message}`);

    if (error.field === "elementA") {
      this.elementAControl.flash();
    } else if (error.field === "elementB") {
      this.elementBControl.flash();
    }
  }
}
