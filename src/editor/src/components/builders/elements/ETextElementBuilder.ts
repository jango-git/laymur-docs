import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { ETextElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import { ETextResizeMode } from "../../../document/types.misc";
import { DEFAULT_ECOLOR } from "../../../miscellaneous/defaults";
import { makeRow } from "../../../miscellaneous/rows";
import { UI_STATE } from "../../../ui-state/EUIState";
import { TOAST } from "../../toast/EToast";

export class ETextElementBuilder {
  private readonly nameControl: EStringControl;

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });
  }

  public build(): void {
    const data: ETextElement = {
      uuid: crypto.randomUUID(),
      type: EElementType.TEXT,
      name: this.nameControl.value,
      color: DEFAULT_ECOLOR,
      content: [],
      resizeMode: ETextResizeMode.SCALE,
      maxLineWidth: 0,
    };

    const error = STORE.validators.elements.text(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.elements.add(UI_STATE.forceActiveLayerUuid, data);
      this.nameControl.value = "";
      return;
    }

    TOAST.warning(`**[ETextElementBuilder]** ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    }
  }
}
