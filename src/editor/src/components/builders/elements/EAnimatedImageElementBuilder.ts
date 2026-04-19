import type {
  EArrayControlItem,
  EArrayControlTemplate,
} from "../../../controls/EArrayControl/EArrayControl";
import { EArrayControl } from "../../../controls/EArrayControl/EArrayControl";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { EAnimatedImageElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EAssetUUID } from "../../../document/types.misc";
import { EAnimatedImageLoopMode } from "../../../document/types.misc";
import { DEFAULT_ECOLOR } from "../../../miscellaneous/defaults";
import { generateAssetUUID, generateElementUUID } from "../../../miscellaneous/generate-uuid";
import { makeRow } from "../../../miscellaneous/rows";
import { UI_STATE } from "../../../ui-state/EUIState";
import { TOAST } from "../../toast/EToast";

const sequenceTemplate: EArrayControlTemplate<EAssetUUID> = {
  createDefault: () => generateAssetUUID(),
  buildItem(container, value, onChange): EArrayControlItem<EAssetUUID> {
    const control = new EAssetControl<EImageAsset>(
      container,
      () => STORE.selectors.assets.selectAllImages(),
      { value: STORE.selectors.assets.selectImage(value), nullable: false },
    );
    control.signalValueChanged.on(() => onChange());
    return {
      getValue: () => control.value?.uuid ?? generateAssetUUID(),
      destroy: () => control.destroy(),
    };
  },
};

export class EAnimatedImageElementBuilder {
  private readonly nameControl: EStringControl;
  private readonly sequenceControl: EArrayControl<EAssetUUID>;

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });

    this.sequenceControl = new EArrayControl<EAssetUUID>(
      makeRow(container, "Sequence"),
      sequenceTemplate,
    );
  }

  public build(): void {
    const data: EAnimatedImageElement = {
      uuid: generateElementUUID(),
      type: EElementType.ANIMATED_IMAGE,
      name: this.nameControl.value,
      color: DEFAULT_ECOLOR,
      sequence: this.sequenceControl.value,
      frameRate: 24,
      timeScale: 1,
      loopMode: EAnimatedImageLoopMode.LOOP,
      playByDefault: true,
    };

    const error = STORE.validators.elements.animatedImage(UI_STATE.activeLayerUuid, data);
    if (error === undefined) {
      STORE.commands.elements.add(UI_STATE.forceActiveLayerUuid, data);
      this.nameControl.value = "";
      this.sequenceControl.value = [];
      return;
    }

    TOAST.warning(`**[EAnimatedImageElementBuilder]** ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    } else if (error.field === "sequence") {
      this.sequenceControl.flash();
    }
  }
}
