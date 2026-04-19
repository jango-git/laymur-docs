import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EAspectConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { EElementConstraintTarget } from "../../../miscellaneous/constraint-targets";
import { getElementConstraintTargets } from "../../../miscellaneous/constraint-targets";
import { generateConstraintUUID, generateElementUUID } from "../../../miscellaneous/generate-uuid";
import { makeRow } from "../../../miscellaneous/rows";
import { UI_STATE } from "../../../ui-state/EUIState";
import { TOAST } from "../../toast/EToast";

export class EAspectConstraintBuilder {
  private readonly elementControl: EAssetControl<EElementConstraintTarget>;

  constructor(container: HTMLElement) {
    this.elementControl = new EAssetControl<EElementConstraintTarget>(
      makeRow(container, "Element"),
      getElementConstraintTargets,
    );
  }

  public build(): void {
    const data: EAspectConstraint = {
      uuid: generateConstraintUUID(),
      type: EConstraintType.ASPECT,
      name: "",
      element: this.elementControl.value?.uuid ?? generateElementUUID(),
      aspect: 1,
    };

    const error = STORE.validators.constraints.aspect(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.constraints.add(UI_STATE.forceActiveLayerUuid, data);
      this.elementControl.value = undefined;
      return;
    }

    TOAST.warning(`**[EAspectConstraintBuilder]** ${error.message}`);

    if (error.field === "element") {
      this.elementControl.flash();
    }
  }
}
