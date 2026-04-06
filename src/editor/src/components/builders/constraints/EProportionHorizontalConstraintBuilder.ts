import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import { EConstraintType } from "../../../document/types.constraints";
import { UI_STATE } from "../../../ui-state/ui-state";
import type { EConstraintTarget } from "../../../utils/constraint-targets";
import { getConstraintTargets } from "../../../utils/constraint-targets";
import { makeRow } from "../../../utils/rows";

export class EProportionHorizontalConstraintBuilder {
  private readonly elementAControl: EAssetControl<EConstraintTarget>;
  private readonly elementBControl: EAssetControl<EConstraintTarget>;
  private readonly errorMessage: HTMLElement;

  private readonly signalBuildAvailabilityInternal = new Ferrsign1<boolean>();

  constructor(private readonly container: HTMLElement) {
    this.elementAControl = new EAssetControl<EConstraintTarget>(
      makeRow(container, "Element A"),
      getConstraintTargets,
    );
    this.elementAControl.signalValueChanged.on(this.handleDataUpdate);

    this.elementBControl = new EAssetControl<EConstraintTarget>(
      makeRow(container, "Element B"),
      getConstraintTargets,
    );
    this.elementBControl.signalValueChanged.on(this.handleDataUpdate);

    this.errorMessage = document.createElement("div");
    this.errorMessage.className = "element-card__error";
    this.container.appendChild(this.errorMessage);

    UI_STATE.signalActiveLayerChanged.on(this.handleDataUpdate);
    this.handleDataUpdate();
  }

  public get buildAvailabilitySignal(): FerrsignView1<boolean> {
    return this.signalBuildAvailabilityInternal;
  }

  public build(): void {
    STORE.commands.constraints.add(UI_STATE.forceActiveLayerUuid, {
      uuid: crypto.randomUUID(),
      type: EConstraintType.PROPORTION_HORIZONTAL,
      name: "",
      elementA: this.elementAControl.forceValue.uuid,
      elementB: this.elementBControl.forceValue.uuid,
      proportion: 1,
    });

    this.elementAControl.value = undefined;
    this.elementBControl.value = undefined;
    this.handleDataUpdate();
  }

  private readonly handleDataUpdate = (): void => {
    const error = STORE.validators.constraints.validateDualElementConstraintBuilder(
      UI_STATE.activeLayerUuid,
      this.elementAControl.value?.uuid,
      this.elementBControl.value?.uuid,
    );
    const isAvailable = error === undefined;
    this.signalBuildAvailabilityInternal.emit(isAvailable);

    this.errorMessage.textContent = error?.message ?? "";
    this.errorMessage.style.display = isAvailable ? "block" : "none";

    if (error?.field === "elementA") {
      this.elementAControl.flash();
    } else if (error?.field === "elementB") {
      this.elementBControl.flash();
    }
  };
}
