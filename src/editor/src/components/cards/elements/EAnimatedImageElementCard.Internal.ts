import type {
  EArrayControlItem,
  EArrayControlTemplate,
} from "../../../controls/EArrayControl/EArrayControl";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import type { ESelectControlOption } from "../../../controls/ESelectControl/ESelectControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { UUID } from "../../../document/types.misc";
import { EAnimatedImageLoopMode } from "../../../document/types.misc";

export const LOOP_MODE_OPTIONS: ESelectControlOption<EAnimatedImageLoopMode>[] = [
  { label: "None", value: EAnimatedImageLoopMode.NONE },
  { label: "Loop", value: EAnimatedImageLoopMode.LOOP },
  { label: "Ping-Pong", value: EAnimatedImageLoopMode.PING_PONG },
];

export const sequenceTemplate: EArrayControlTemplate<UUID> = {
  createDefault: () => "",
  buildItem(container, value, onChange): EArrayControlItem<UUID> {
    const assetControl = new EAssetControl<EImageAsset>(
      container,
      () => STORE.selectors.assets.selectAllImages(),
      { value: STORE.selectors.assets.selectImage(value), nullable: false },
    );
    assetControl.signalValueChanged.on(() => onChange());
    return {
      getValue: () => assetControl.value?.uuid ?? "",
      destroy: () => assetControl.destroy(),
    };
  },
};
