import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EVerticalSizeConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { EElementConstraintTarget } from "../../../miscellaneous/constraint-targets";
import { getElementConstraintTargets } from "../../../miscellaneous/constraint-targets";
import { generateConstraintUUID, generateElementUUID } from "../../../miscellaneous/generate-uuid";
import { makeRow } from "../../../miscellaneous/rows";
import { UI_STATE } from "../../../ui-state/EUIState";
import { TOAST } from "../../toast/EToast";

export class ESizeVerticalConstraintBuilder {
  private readonly elementControl: EAssetControl<EElementConstraintTarget>;

  constructor(private readonly container: HTMLElement) {
    this.elementControl = new EAssetControl<EElementConstraintTarget>(
      makeRow(this.container, "Element"),
      getElementConstraintTargets,
    );
  }

  public build(): void {
    const data: EVerticalSizeConstraint = {
      uuid: generateConstraintUUID(),
      type: EConstraintType.SIZE_VERTICAL,
      name: "",
      element: this.elementControl.value?.uuid ?? generateElementUUID(),
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
