import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { ENineSliceElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import { ENineSliceRegionMode } from "../../../document/types.misc";
import { UI_STATE } from "../../../ui-state/ui-state";
import { makeRow } from "../../../utils/rows";
import { TOAST } from "../../toast/EToast";

export class ENineSliceElementBuilder {
  private readonly nameControl: EStringControl;
  private readonly textureControl: EAssetControl<EImageAsset>;

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });

    this.textureControl = new EAssetControl<EImageAsset>(
      makeRow(container, "Texture"),
      () => STORE.selectors.assets.selectAllImages(),
      { nullable: true },
    );
  }

  public build(): void {
    const data: ENineSliceElement = {
      uuid: crypto.randomUUID(),
      type: EElementType.NINE_SLICE,
      name: this.nameControl.value,
      color: { color: "#ffffff", alpha: 1 },
      texture: this.textureControl.value?.uuid ?? "",
      sliceBorders: [0, 0, 0, 0],
      sliceRegions: [0, 0, 0, 0],
      regionMode: ENineSliceRegionMode.NORMALIZED,
    };

    const error = STORE.validators.elements.nineSlice(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.elements.add(UI_STATE.forceActiveLayerUuid, data);
      this.nameControl.value = "";
      this.textureControl.value = undefined;
      return;
    }

    TOAST.warning(`**[ENineSliceElementBuilder]** ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    } else if (error.field === "texture") {
      this.textureControl.flash();
    }
  }
}
