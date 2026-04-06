import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import { EConstraintType } from "../../../document/types.constraints";
import { UI_STATE } from "../../../ui-state/ui-state";
import type { EConstraintTarget } from "../../../utils/constraint-targets";
import { getConstraintTargets } from "../../../utils/constraint-targets";
import { makeRow } from "../../../utils/rows";

export class ESizeHorizontalConstraintBuilder {
  private readonly elementControl: EAssetControl<EConstraintTarget>;
  private readonly errorMessage: HTMLElement;

  private readonly signalBuildAvailabilityInternal = new Ferrsign1<boolean>();

  constructor(private readonly container: HTMLElement) {
    this.elementControl = new EAssetControl<EConstraintTarget>(
      makeRow(container, "Element"),
      getConstraintTargets,
    );
    this.elementControl.signalValueChanged.on(this.handleDataUpdate);

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
      type: EConstraintType.SIZE_HORIZONTAL,
      name: "",
      element: this.elementControl.forceValue.uuid,
      size: 100,
    });

    this.elementControl.value = undefined;
    this.handleDataUpdate();
  }

  private readonly handleDataUpdate = (): void => {
    const error = STORE.validators.constraints.validateSingleElementConstraintBuilder(
      UI_STATE.activeLayerUuid,
      this.elementControl.value?.uuid,
    );
    const isAvailable = error === undefined;
    this.signalBuildAvailabilityInternal.emit(isAvailable);

    this.errorMessage.textContent = error?.message ?? "";
    this.errorMessage.style.display = !isAvailable ? "block" : "none";

    if (error?.field === "element") {
      this.elementControl.flash();
    }
  };
}
