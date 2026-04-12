import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EHorizontalSizeConstraint } from "../../../document/types.constraints";
import { EConstraintType } from "../../../document/types.constraints";
import type { ESizeConstraintError } from "../../../document/validators/constraints";
import { UI_STATE } from "../../../ui-state/ui-state";
import type { EConstraintTarget } from "../../../utils/constraint-targets";
import { getConstraintTargets } from "../../../utils/constraint-targets";
import { makeRow } from "../../../utils/rows";
import { TOAST } from "../../toast/EToast";

export class ESizeHorizontalConstraintBuilder {
  private readonly elementControl: EAssetControl<EConstraintTarget>;
  private readonly signalBuildAvailabilityInternal = new Ferrsign1<boolean>();

  constructor(private readonly container: HTMLElement) {
    this.elementControl = new EAssetControl<EConstraintTarget>(
      makeRow(this.container, "Element"),
      getConstraintTargets,
    );
    this.elementControl.signalValueChanged.on(this.handleDataUpdate);

    UI_STATE.signalActiveLayerChanged.on(this.handleDataUpdate);
    this.handleAvailability();
  }

  public get buildAvailabilitySignal(): FerrsignView1<boolean> {
    return this.signalBuildAvailabilityInternal;
  }

  public build(): void {
    STORE.commands.constraints.add(UI_STATE.forceActiveLayerUuid, this.buildData());
    this.elementControl.value = undefined;
    this.handleAvailability();
  }

  private readonly handleDataUpdate = (): void => {
    const error = this.handleAvailability();
    if (error === undefined) {
      return;
    }

    TOAST.warning(`**[ESizeHorizontalConstraintBuilder]** ${error.message}`);

    if (error.field === "element") {
      this.elementControl.flash();
    }
  };

  private handleAvailability(): ESizeConstraintError | undefined {
    const error = STORE.validators.constraints.sizeHorizontal(
      UI_STATE.activeLayerUuid,
      this.buildData(),
      true,
    );
    this.signalBuildAvailabilityInternal.emit(error === undefined);
    return error;
  }

  private buildData(): EHorizontalSizeConstraint {
    return {
      uuid: crypto.randomUUID(),
      type: EConstraintType.SIZE_HORIZONTAL,
      name: "",
      element: this.elementControl.value?.uuid ?? "",
      size: 100,
    };
  }
}
