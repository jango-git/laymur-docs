import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import { EElementType } from "../../../document/types.elements";
import type { EImageElementError } from "../../../document/validators/elements";
import { UI_STATE } from "../../../ui-state/ui-state";
import { makeRow } from "../../../utils/rows";
import { TOAST } from "../../toast/EToast";

export class EImageElementBuilder {
  private readonly nameControl: EStringControl;
  private readonly textureControl: EAssetControl<EImageAsset>;
  private readonly signalBuildAvailabilityInternal = new Ferrsign1<boolean>();

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });
    this.nameControl.signalValueChanged.on(this.handleDataUpdate);

    this.textureControl = new EAssetControl<EImageAsset>(makeRow(container, "Texture"), () =>
      STORE.selectors.assets.selectAllImages(),
    );
    this.textureControl.signalValueChanged.on(this.handleDataUpdate);

    UI_STATE.signalActiveLayerChanged.on(this.handleDataUpdate);
    this.tryUpdateData();
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

    this.tryUpdateData();
  }

  private readonly handleDataUpdate = (): void => {
    const error = this.tryUpdateData();
    if (error === undefined) {
      return;
    }

    TOAST.warning(`[EImageElementBuilder] ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    } else if (error.field === "texture") {
      this.textureControl.flash();
    }
  };

  private tryUpdateData(): EImageElementError | undefined {
    const error = STORE.validators.elements.image(
      UI_STATE.activeLayerUuid,
      { name: this.nameControl.value, texture: this.textureControl.value?.uuid },
      false,
    );
    this.signalBuildAvailabilityInternal.emit(error === undefined);
    return error;
  }
}
