import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EAspectConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { EConstraintTarget } from "../../../miscellaneous/constraint-targets";
import { getConstraintTargets } from "../../../miscellaneous/constraint-targets";
import { makeRow } from "../../../miscellaneous/rows";
import { UI_STATE } from "../../../ui-state/ui-state";
import { TOAST } from "../../toast/EToast";

export class EAspectConstraintBuilder {
  private readonly elementControl: EAssetControl<EConstraintTarget>;

  constructor(container: HTMLElement) {
    this.elementControl = new EAssetControl<EConstraintTarget>(
      makeRow(container, "Element"),
      getConstraintTargets,
    );
  }

  public build(): void {
    const data: EAspectConstraint = {
      uuid: crypto.randomUUID(),
      type: EConstraintType.ASPECT,
      name: "",
      element: this.elementControl.value?.uuid ?? "",
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
