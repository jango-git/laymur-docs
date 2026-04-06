import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import { EElementType } from "../../../document/types.elements";
import { ETextResizeMode } from "../../../document/types.misc";
import { UI_STATE } from "../../../ui-state/ui-state";
import { makeRow } from "../../../utils/rows";

export class ETextElementBuilder {
  private readonly nameControl: EStringControl;
  private readonly errorMessage: HTMLElement;

  private readonly signalBuildAvailabilityInternal = new Ferrsign1<boolean>();

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });
    this.nameControl.signalValueChanged.on(this.handleDataUpdate);

    this.errorMessage = document.createElement("div");
    this.errorMessage.className = "element-card__error";
    container.appendChild(this.errorMessage);

    UI_STATE.signalActiveLayerChanged.on(this.handleDataUpdate);
    this.handleDataUpdate();
  }

  public get buildAvailabilitySignal(): FerrsignView1<boolean> {
    return this.signalBuildAvailabilityInternal;
  }

  public build(): void {
    STORE.commands.elements.add(UI_STATE.forceActiveLayerUuid, {
      uuid: crypto.randomUUID(),
      type: EElementType.TEXT,
      name: this.nameControl.value,
      color: "#ffffffff",
      content: [],
      resizeMode: ETextResizeMode.SCALE,
      maxLineWidth: 0,
    });

    this.nameControl.value = "";
    this.handleDataUpdate();
  }

  private readonly handleDataUpdate = (): void => {
    const error = STORE.validators.elements.validateTextBuilder(
      UI_STATE.activeLayerUuid,
      this.nameControl.value,
    );
    const isAvailable = error === undefined;
    this.signalBuildAvailabilityInternal.emit(isAvailable);

    this.errorMessage.textContent = error?.message ?? "";
    this.errorMessage.style.display = !isAvailable ? "block" : "none";

    if (error?.field === "name") {
      this.nameControl.flash();
    }
  };
}
