import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { EGraphicsElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import { UI_STATE } from "../../../ui-state/ui-state";
import { makeRow } from "../../../utils/rows";
import { TOAST } from "../../toast/EToast";

export class EGraphicsElementBuilder {
  private readonly nameControl: EStringControl;

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });
  }

  public build(): void {
    const data: EGraphicsElement = {
      uuid: crypto.randomUUID(),
      type: EElementType.GRAPHICS,
      name: this.nameControl.value,
      color: { color: "#ffffff", alpha: 1 },
      resolution: [512, 512],
      drawSequence: [],
    };

    const error = STORE.validators.elements.graphics(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.elements.add(UI_STATE.forceActiveLayerUuid, data);
      this.nameControl.value = "";
      return;
    }

    TOAST.warning(`**[EGraphicsElementBuilder]** ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    }
  }
}
