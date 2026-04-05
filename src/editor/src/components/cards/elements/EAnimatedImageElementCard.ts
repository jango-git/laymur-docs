import type {
  EArrayControlItem,
  EArrayControlTemplate,
} from "../../../controls/EArrayControl/EArrayControl";
import { EArrayControl } from "../../../controls/EArrayControl/EArrayControl";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EBoolControl } from "../../../controls/EBoolControl/EBoolControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import type { ESelectControlOption } from "../../../controls/ESelectControl/ESelectControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { EAnimatedImageElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EAssetUUID, EElementUUID } from "../../../document/types.misc";
import { EAnimatedImageLoopMode } from "../../../document/types.misc";
import { makeRow } from "./helpers";

const LOOP_MODE_OPTIONS: ESelectControlOption<EAnimatedImageLoopMode>[] = [
  { label: "None", value: EAnimatedImageLoopMode.NONE },
  { label: "Loop", value: EAnimatedImageLoopMode.LOOP },
  { label: "Ping-Pong", value: EAnimatedImageLoopMode.PING_PONG },
];

const sequenceTemplate: EArrayControlTemplate<EAssetUUID> = {
  createDefault: () => "",
  buildItem(container, value, onChange): EArrayControlItem<EAssetUUID> {
    const ctrl = new EAssetControl<EImageAsset>(container, STORE.selectors.assets.selectAllImages, {
      value: STORE.selectors.assets.selectImage(value),
      nullable: false,
    });
    ctrl.signalValueChanged.on(() => onChange());
    return {
      getValue: () => ctrl.value?.uuid ?? "",
      destroy: () => ctrl.destroy(),
    };
  },
};

export class EAnimatedImageElementCard {
  private readonly colorControl: EColorControl;
  private readonly sequenceControl: EArrayControl<EAssetUUID>;
  private readonly frameRateControl: ENumberControl;
  private readonly timeScaleControl: ENumberControl;
  private readonly loopModeControl: ESelectControl<EAnimatedImageLoopMode>;
  private readonly playByDefaultControl: EBoolControl;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EElementUUID,
  ) {
    const root = document.createElement("div");
    root.className = "element-card";

    const colorRow = makeRow(root, "Color");
    this.colorControl = new EColorControl(colorRow);

    const sequenceRow = makeRow(root, "Sequence");
    this.sequenceControl = new EArrayControl<EAssetUUID>(sequenceRow, sequenceTemplate);

    const frameRateRow = makeRow(root, "Frame Rate");
    this.frameRateControl = new ENumberControl(frameRateRow, {
      value: 24,
      min: 1,
      max: 240,
      step: 1,
      precision: 0,
    });

    const timeScaleRow = makeRow(root, "Time Scale");
    this.timeScaleControl = new ENumberControl(timeScaleRow, {
      value: 1,
      min: 0,
      max: 10,
      step: 0.01,
      precision: 2,
    });

    const loopModeRow = makeRow(root, "Loop Mode");
    this.loopModeControl = new ESelectControl<EAnimatedImageLoopMode>(loopModeRow, {
      options: LOOP_MODE_OPTIONS,
      value: EAnimatedImageLoopMode.LOOP,
    });

    const playRow = makeRow(root, "Auto Play");
    this.playByDefaultControl = new EBoolControl(playRow, { value: true });

    this.container.appendChild(root);

    this.colorControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, color: next });
    });
    this.sequenceControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, sequence: next });
    });
    this.frameRateControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, frameRate: next });
    });
    this.timeScaleControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, timeScale: next });
    });
    this.loopModeControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, loopMode: next });
    });
    this.playByDefaultControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, playByDefault: next });
    });

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type === EElementType.ANIMATED_IMAGE) {
      this.refresh(initial);
    }

    STORE.signals.elements.item.on((delta) => {
      if (delta.element.uuid === this.uuid && delta.element.type === EElementType.ANIMATED_IMAGE) {
        this.refresh(delta.element);
      }
    });
  }

  private refresh(element: EAnimatedImageElement): void {
    this.colorControl.value = element.color;
    this.sequenceControl.value = element.sequence;
    this.frameRateControl.value = element.frameRate;
    this.timeScaleControl.value = element.timeScale;
    this.loopModeControl.value = element.loopMode;
    this.playByDefaultControl.value = element.playByDefault;
  }
}
