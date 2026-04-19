import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EHorizontalSizeConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { EElementConstraintTarget } from "../../../miscellaneous/constraint-targets";
import { getElementConstraintTargets } from "../../../miscellaneous/constraint-targets";
import { generateConstraintUUID, generateElementUUID } from "../../../miscellaneous/generate-uuid";
import { makeRow } from "../../../miscellaneous/rows";
import { UI_STATE } from "../../../ui-state/EUIState";
import { TOAST } from "../../toast/EToast";

export class ESizeHorizontalConstraintBuilder {
  private readonly elementControl: EAssetControl<EElementConstraintTarget>;

  constructor(private readonly container: HTMLElement) {
    this.elementControl = new EAssetControl<EElementConstraintTarget>(
      makeRow(this.container, "Element"),
      getElementConstraintTargets,
    );
  }

  public build(): void {
    const data: EHorizontalSizeConstraint = {
      uuid: generateConstraintUUID(),
      type: EConstraintType.SIZE_HORIZONTAL,
      name: "",
      element: this.elementControl.value?.uuid ?? generateElementUUID(),
      size: 100,
    };

    const error = STORE.validators.constraints.sizeHorizontal(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.constraints.add(UI_STATE.forceActiveLayerUuid, data);
      this.elementControl.value = undefined;
      return;
    }

    TOAST.warning(`**[ESizeHorizontalConstraintBuilder]** ${error.message}`);

    if (error.field === "element") {
      this.elementControl.flash();
    }
  }
}
