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
import type { UUID } from "../../../document/types.misc";
import { EAnimatedImageLoopMode } from "../../../document/types.misc";
import { UI_STATE } from "../../../ui-state/ui-state";
import { makeRow } from "../../../utils/rows";
import { TOAST } from "../../toast/EToast";

const sequenceTemplate: EArrayControlTemplate<UUID> = {
  createDefault: () => "",
  buildItem(container, value, onChange): EArrayControlItem<UUID> {
    const control = new EAssetControl<EImageAsset>(
      container,
      () => STORE.selectors.assets.selectAllImages(),
      { value: STORE.selectors.assets.selectImage(value), nullable: false },
    );
    control.signalValueChanged.on(() => onChange());
    return {
      getValue: () => control.value?.uuid ?? "",
      destroy: () => control.destroy(),
    };
  },
};

export class EAnimatedImageElementBuilder {
  private readonly nameControl: EStringControl;
  private readonly sequenceControl: EArrayControl<UUID>;

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });

    this.sequenceControl = new EArrayControl<UUID>(
      makeRow(container, "Sequence"),
      sequenceTemplate,
    );
  }

  public build(): void {
    const data: EAnimatedImageElement = {
      uuid: crypto.randomUUID(),
      type: EElementType.ANIMATED_IMAGE,
      name: this.nameControl.value,
      color: { color: "#ffffff", alpha: 1 },
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
