import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EHorizontalSizeConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import { UI_STATE } from "../../../ui-state/ui-state";
import type { EConstraintTarget } from "../../../utils/constraint-targets";
import { getConstraintTargets } from "../../../utils/constraint-targets";
import { makeRow } from "../../../utils/rows";
import { TOAST } from "../../toast/EToast";

export class ESizeHorizontalConstraintBuilder {
  private readonly elementControl: EAssetControl<EConstraintTarget>;

  constructor(private readonly container: HTMLElement) {
    this.elementControl = new EAssetControl<EConstraintTarget>(
      makeRow(this.container, "Element"),
      getConstraintTargets,
    );
  }

  public build(): void {
    const data: EHorizontalSizeConstraint = {
      uuid: crypto.randomUUID(),
      type: EConstraintType.SIZE_HORIZONTAL,
      name: "",
      element: this.elementControl.value?.uuid ?? "",
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
