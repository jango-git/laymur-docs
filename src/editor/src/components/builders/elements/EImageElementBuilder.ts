import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import { EElementType } from "../../../document/types.elements";
import { UI_STATE } from "../../../ui-state/ui-state";
import { makeRow } from "../../../utils/rows";

export class EImageElementBuilder {
  private readonly nameControl: EStringControl;
  private readonly textureControl: EAssetControl<EImageAsset>;
  private readonly errorMessage: HTMLElement;

  private readonly signalBuildAvailabilityInternal = new Ferrsign1<boolean>();

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });
    this.nameControl.signalValueChanged.on(this.handleDataUpdate);

    this.textureControl = new EAssetControl<EImageAsset>(makeRow(container, "Texture"), () =>
      STORE.selectors.assets.selectAllImages(),
    );
    this.textureControl.signalValueChanged.on(this.handleDataUpdate);

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
      type: EElementType.IMAGE,
      name: this.nameControl.value,
      color: { color: "#ffffff", alpha: 255 },
      texture: this.textureControl.forceValue.uuid,
    });

    this.nameControl.value = "";
    this.textureControl.value = undefined;

    this.handleDataUpdate();
  }

  private readonly handleDataUpdate = (): void => {
    const error = STORE.validators.elements.validateImageBuilder(
      UI_STATE.activeLayerUuid,
      this.nameControl.value,
      this.textureControl.value?.uuid,
    );
    const isAvailable = error === undefined;
    this.signalBuildAvailabilityInternal.emit(isAvailable);

    this.errorMessage.textContent = error?.message ?? "";
    this.errorMessage.style.display = !isAvailable ? "block" : "none";

    if (error?.field === "name") {
      this.nameControl.flash();
    } else if (error?.field === "texture") {
      this.textureControl.flash();
    }
  };
}
