import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { ESceneElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import { ESceneUpdateMode } from "../../../document/types.misc";
import type { ESceneElementError } from "../../../document/validators/elements";
import { UI_STATE } from "../../../ui-state/ui-state";
import { makeRow } from "../../../utils/rows";
import { TOAST } from "../../toast/EToast";

export class ESceneElementBuilder {
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

    TOAST.warning(`**[ESceneElementBuilder]** ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    }
  };

  private handleAvailability(): ESceneElementError | undefined {
    const error = STORE.validators.elements.scene(UI_STATE.activeLayerUuid, this.buildData(), true);
    this.signalBuildAvailabilityInternal.emit(error === undefined);
    return error;
  }

  private buildData(): ESceneElement {
    return {
      uuid: crypto.randomUUID(),
      type: EElementType.SCENE,
      name: this.nameControl.value,
      color: { color: "#ffffff", alpha: 1 },
      updateMode: ESceneUpdateMode.EVERY_FRAME,
      resolutionFactor: 1,
      clearColor: { color: "#000000", alpha: 1 },
      enableDepthBuffer: true,
    };
  }
}
