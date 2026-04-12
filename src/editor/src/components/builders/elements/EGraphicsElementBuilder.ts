import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import { EElementType } from "../../../document/types.elements";
import type { EGraphicsElementError } from "../../../document/validators/elements";
import { UI_STATE } from "../../../ui-state/ui-state";
import { makeRow } from "../../../utils/rows";
import { TOAST } from "../../toast/EToast";

export class EGraphicsElementBuilder {
  private readonly nameControl: EStringControl;
  private readonly signalBuildAvailabilityInternal = new Ferrsign1<boolean>();

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });
    this.nameControl.signalValueChanged.on(this.handleDataUpdate);

    UI_STATE.signalActiveLayerChanged.on(this.handleDataUpdate);
    this.tryUpdateData();
  }

  public get buildAvailabilitySignal(): FerrsignView1<boolean> {
    return this.signalBuildAvailabilityInternal;
  }

  public build(): void {
    STORE.commands.elements.add(UI_STATE.forceActiveLayerUuid, {
      uuid: crypto.randomUUID(),
      type: EElementType.GRAPHICS,
      name: this.nameControl.value,
      color: { color: "#ffffff", alpha: 255 },
      resolution: [512, 512],
      drawSequence: [],
    });

    this.nameControl.value = "";
    this.tryUpdateData();
  }

  private readonly handleDataUpdate = (): void => {
    const error = this.tryUpdateData();
    if (error === undefined) {
      return;
    }

    TOAST.warning(`[EGraphicsElementBuilder] ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    }
  };

  private tryUpdateData(): EGraphicsElementError | undefined {
    const error = STORE.validators.elements.graphics(
      UI_STATE.activeLayerUuid,
      { name: this.nameControl.value },
      false,
    );
    this.signalBuildAvailabilityInternal.emit(error === undefined);
    return error;
  }
}
