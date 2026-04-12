import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import { EConstraintType } from "../../../document/types.constraints";
import type { EProportionConstraintError } from "../../../document/validators/constraints";
import { UI_STATE } from "../../../ui-state/ui-state";
import type { EConstraintTarget } from "../../../utils/constraint-targets";
import { getConstraintTargets } from "../../../utils/constraint-targets";
import { makeRow } from "../../../utils/rows";
import { TOAST } from "../../toast/EToast";

export class EProportionVerticalConstraintBuilder {
  private readonly elementAControl: EAssetControl<EConstraintTarget>;
  private readonly elementBControl: EAssetControl<EConstraintTarget>;
  private readonly signalBuildAvailabilityInternal = new Ferrsign1<boolean>();

  constructor(private readonly container: HTMLElement) {
    this.elementAControl = new EAssetControl<EConstraintTarget>(
      makeRow(this.container, "Element A"),
      getConstraintTargets,
    );
    this.elementAControl.signalValueChanged.on(this.handleDataUpdate);

    this.elementBControl = new EAssetControl<EConstraintTarget>(
      makeRow(this.container, "Element B"),
      getConstraintTargets,
    );
    this.elementBControl.signalValueChanged.on(this.handleDataUpdate);

    UI_STATE.signalActiveLayerChanged.on(this.handleDataUpdate);
    this.tryUpdateData();
  }

  public get buildAvailabilitySignal(): FerrsignView1<boolean> {
    return this.signalBuildAvailabilityInternal;
  }

  public build(): void {
    STORE.commands.constraints.add(UI_STATE.forceActiveLayerUuid, {
      uuid: crypto.randomUUID(),
      type: EConstraintType.PROPORTION_VERTICAL,
      name: "",
      elementA: this.elementAControl.forceValue.uuid,
      elementB: this.elementBControl.forceValue.uuid,
      proportion: 1,
    });

    this.elementAControl.value = undefined;
    this.elementBControl.value = undefined;
    this.tryUpdateData();
  }

  private readonly handleDataUpdate = (): void => {
    const error = this.tryUpdateData();
    if (error === undefined) {
      return;
    }

    TOAST.warning(`[EProportionVerticalConstraintBuilder] ${error.message}`);

    if (error.field === "elementA") {
      this.elementAControl.flash();
    } else if (error.field === "elementB") {
      this.elementBControl.flash();
    }
  };

  private tryUpdateData(): EProportionConstraintError | undefined {
    const error = STORE.validators.constraints.proportionVertical(
      UI_STATE.activeLayerUuid,
      {
        elementA: this.elementAControl.value?.uuid,
        elementB: this.elementBControl.value?.uuid,
      },
      false,
    );
    this.signalBuildAvailabilityInternal.emit(error === undefined);
    return error;
  }
}
