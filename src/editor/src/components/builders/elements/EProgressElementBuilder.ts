import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { EProgressElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import { EProgressMaskFunction } from "../../../document/types.misc";
import { DEFAULT_ECOLOR } from "../../../miscellaneous/defaults";
import { makeRow } from "../../../miscellaneous/rows";
import { UI_STATE } from "../../../ui-state/EUIState";
import { TOAST } from "../../toast/EToast";

export class EProgressElementBuilder {
  private readonly nameControl: EStringControl;
  private readonly textureControl: EAssetControl<EImageAsset>;

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });

    this.textureControl = new EAssetControl<EImageAsset>(makeRow(container, "Texture"), () =>
      STORE.selectors.assets.selectAllImages(),
    );
  }

  public build(): void {
    const data: EProgressElement = {
      uuid: crypto.randomUUID(),
      type: EElementType.PROGRESS,
      name: this.nameControl.value,
      color: DEFAULT_ECOLOR,
      texture: this.textureControl.value?.uuid ?? "",
      maskFunction: EProgressMaskFunction.CIRCULAR,
      progress: 0,
    };

    const error = STORE.validators.elements.progress(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.elements.add(UI_STATE.forceActiveLayerUuid, data);
      this.nameControl.value = "";
      this.textureControl.value = undefined;
      return;
    }

    TOAST.warning(`**[EProgressElementBuilder]** ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    } else if (error.field === "texture") {
      this.textureControl.flash();
    }
  }
}
