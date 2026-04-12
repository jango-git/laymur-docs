import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { ESceneElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import { ESceneUpdateMode } from "../../../document/types.misc";
import { UI_STATE } from "../../../ui-state/ui-state";
import { makeRow } from "../../../utils/rows";
import { TOAST } from "../../toast/EToast";

export class ESceneElementBuilder {
  private readonly nameControl: EStringControl;

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });
  }

  public build(): void {
    const data: ESceneElement = {
      uuid: crypto.randomUUID(),
      type: EElementType.SCENE,
      name: this.nameControl.value,
      color: { color: "#ffffff", alpha: 1 },
      updateMode: ESceneUpdateMode.EVERY_FRAME,
      resolutionFactor: 1,
      clearColor: { color: "#000000", alpha: 1 },
      enableDepthBuffer: true,
    };

    const error = STORE.validators.elements.scene(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.elements.add(UI_STATE.forceActiveLayerUuid, data);
      this.nameControl.value = "";
      return;
    }

    TOAST.warning(`**[ESceneElementBuilder]** ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    }
  }
}
