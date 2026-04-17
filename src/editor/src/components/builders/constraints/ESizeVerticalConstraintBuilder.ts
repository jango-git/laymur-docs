import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EVerticalSizeConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { EConstraintTarget } from "../../../miscellaneous/constraint-targets";
import { getConstraintTargets } from "../../../miscellaneous/constraint-targets";
import { makeRow } from "../../../miscellaneous/rows";
import { UI_STATE } from "../../../ui-state/EUIState";
import { TOAST } from "../../toast/EToast";

export class ESizeVerticalConstraintBuilder {
  private readonly elementControl: EAssetControl<EConstraintTarget>;

  constructor(private readonly container: HTMLElement) {
    this.elementControl = new EAssetControl<EConstraintTarget>(
      makeRow(this.container, "Element"),
      getConstraintTargets,
    );
  }

  public build(): void {
    const data: EVerticalSizeConstraint = {
      uuid: crypto.randomUUID(),
      type: EConstraintType.SIZE_VERTICAL,
      name: "",
      element: this.elementControl.value?.uuid ?? "",
      size: 100,
    };

    const error = STORE.validators.constraints.sizeVertical(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.constraints.add(UI_STATE.forceActiveLayerUuid, data);
      this.elementControl.value = undefined;
      return;
    }

    TOAST.warning(`**[ESizeVerticalConstraintBuilder]** ${error.message}`);

    if (error.field === "element") {
      this.elementControl.flash();
    }
  }
}
