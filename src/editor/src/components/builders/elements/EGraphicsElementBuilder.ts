import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { EGraphicsElement } from "../../../document/types.elements";
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
    this.handleAvailability();
  }

  public get buildAvailabilitySignal(): FerrsignView1<boolean> {
    return this.signalBuildAvailabilityInternal;
  }

  public build(): void {
    STORE.commands.elements.add(UI_STATE.forceActiveLayerUuid, this.buildData());
    this.nameControl.value = "";
    this.handleAvailability();
  }

  private readonly handleDataUpdate = (): void => {
    const error = this.handleAvailability();
    if (error === undefined) {
      return;
    }

    TOAST.warning(`**[EGraphicsElementBuilder]** ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    }
  };

  private handleAvailability(): EGraphicsElementError | undefined {
    const error = STORE.validators.elements.graphics(
      UI_STATE.activeLayerUuid,
      this.buildData(),
      true,
    );
    this.signalBuildAvailabilityInternal.emit(error === undefined);
    return error;
  }

  private buildData(): EGraphicsElement {
    return {
      uuid: crypto.randomUUID(),
      type: EElementType.GRAPHICS,
      name: this.nameControl.value,
      color: { color: "#ffffff", alpha: 1 },
      resolution: [512, 512],
      drawSequence: [],
    };
  }
}
