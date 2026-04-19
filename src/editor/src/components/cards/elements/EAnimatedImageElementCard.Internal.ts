import type {
  EArrayControlItem,
  EArrayControlTemplate,
} from "../../../controls/EArrayControl/EArrayControl";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import type { ESelectControlOption } from "../../../controls/ESelectControl/ESelectControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { EAssetUUID } from "../../../document/types.misc";
import { EAnimatedImageLoopMode } from "../../../document/types.misc";
import { generateAssetUUID } from "../../../miscellaneous/generate-uuid";

export const LOOP_MODE_OPTIONS: ESelectControlOption<EAnimatedImageLoopMode>[] = [
  { label: "None", value: EAnimatedImageLoopMode.NONE },
  { label: "Loop", value: EAnimatedImageLoopMode.LOOP },
  { label: "Ping-Pong", value: EAnimatedImageLoopMode.PING_PONG },
];

export const sequenceTemplate: EArrayControlTemplate<EAssetUUID> = {
  createDefault: () => generateAssetUUID(),
  buildItem(container, value, onChange): EArrayControlItem<EAssetUUID> {
    const assetControl = new EAssetControl<EImageAsset>(
      container,
      () => STORE.selectors.assets.selectAllImages(),
      { value: STORE.selectors.assets.selectImage(value), nullable: false },
    );
    assetControl.signalValueChanged.on(() => onChange());
    return {
      getValue: () => assetControl.value?.uuid ?? generateAssetUUID(),
      destroy: () => assetControl.destroy(),
    };
  },
};
