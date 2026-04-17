import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EHorizontalProportionConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { EConstraintTarget } from "../../../miscellaneous/constraint-targets";
import { getConstraintTargets } from "../../../miscellaneous/constraint-targets";
import { makeRow } from "../../../miscellaneous/rows";
import { UI_STATE } from "../../../ui-state/EUIState";
import { TOAST } from "../../toast/EToast";

export class EProportionHorizontalConstraintBuilder {
  private readonly elementAControl: EAssetControl<EConstraintTarget>;
  private readonly elementBControl: EAssetControl<EConstraintTarget>;

  constructor(private readonly container: HTMLElement) {
    this.elementAControl = new EAssetControl<EConstraintTarget>(
      makeRow(this.container, "Element A"),
      getConstraintTargets,
    );

    this.elementBControl = new EAssetControl<EConstraintTarget>(
      makeRow(this.container, "Element B"),
      getConstraintTargets,
    );
  }

  public build(): void {
    const data: EHorizontalProportionConstraint = {
      uuid: crypto.randomUUID(),
      type: EConstraintType.PROPORTION_HORIZONTAL,
      name: "",
      elementA: this.elementAControl.value?.uuid ?? "",
      elementB: this.elementBControl.value?.uuid ?? "",
      proportion: 1,
    };

    const error = STORE.validators.constraints.proportionHorizontal(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.constraints.add(UI_STATE.forceActiveLayerUuid, data);
      this.elementAControl.value = undefined;
      this.elementBControl.value = undefined;
      return;
    }

    TOAST.warning(`**[EProportionHorizontalConstraintBuilder]** ${error.message}`);

    if (error.field === "elementA") {
      this.elementAControl.flash();
    } else if (error.field === "elementB") {
      this.elementBControl.flash();
    }
  }
}
