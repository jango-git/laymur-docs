import { EArrayControl } from "../../../controls/EArrayControl/EArrayControl";
import { EBoolControl } from "../../../controls/EBoolControl/EBoolControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import type { EStoreDeltaElement } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EAnimatedImageElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EAssetUuid, EColor, EElementUuid } from "../../../document/types.misc";
import { EAnimatedImageLoopMode } from "../../../document/types.misc";
import { makeRow } from "../../../utils/rows";
import { LOOP_MODE_OPTIONS, sequenceTemplate } from "./EAnimatedImageElementCard.Internal";

export class EAnimatedImageElementCard {
  private readonly colorControl: EColorControl;
  private readonly sequenceControl: EArrayControl<EAssetUuid>;
  private readonly frameRateControl: ENumberControl;
  private readonly timeScaleControl: ENumberControl;
  private readonly loopModeControl: ESelectControl<EAnimatedImageLoopMode>;
  private readonly playByDefaultControl: EBoolControl;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EElementUuid,
  ) {
    const root = document.createElement("div");
    root.className = "element-card";

    this.colorControl = new EColorControl(makeRow(root, "Color"));
    this.colorControl.signalValueChanged.on(this.onColorChanged);

    this.frameRateControl = new ENumberControl(makeRow(root, "Frame Rate"), {
      value: 24,
      min: 1,
      max: 240,
      step: 1,
      precision: 0,
    });
    this.frameRateControl.signalValueChanged.on(this.onFrameRateChanged);

    this.timeScaleControl = new ENumberControl(makeRow(root, "Time Scale"), {
      value: 1,
      min: 0,
      max: 10,
      step: 0.01,
      precision: 2,
    });
    this.timeScaleControl.signalValueChanged.on(this.onTimeScaleChanged);

    this.loopModeControl = new ESelectControl<EAnimatedImageLoopMode>(makeRow(root, "Loop Mode"), {
      options: LOOP_MODE_OPTIONS,
      value: EAnimatedImageLoopMode.LOOP,
    });
    this.loopModeControl.signalValueChanged.on(this.onLoopModeChanged);

    this.playByDefaultControl = new EBoolControl(makeRow(root, "Auto Play"), { value: true });
    this.playByDefaultControl.signalValueChanged.on(this.onPlayByDefaultChanged);

    this.sequenceControl = new EArrayControl<EAssetUuid>(
      makeRow(root, "Sequence"),
      sequenceTemplate,
    );
    this.sequenceControl.signalValueChanged.on(this.onSequenceChanged);

    this.container.appendChild(root);

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type !== EElementType.ANIMATED_IMAGE) {
      throw new Error(
        "EAnimatedImageElementCard: initial element is not an animated image element",
      );
    }

    this.refresh(initial);
    STORE.signals.elements.item.on(this.onElementItemChanged);
  }

  private refresh(element: EAnimatedImageElement): void {
    this.colorControl.value = element.color;
    this.frameRateControl.value = element.frameRate;
    this.timeScaleControl.value = element.timeScale;
    this.loopModeControl.value = element.loopMode;
    this.playByDefaultControl.value = element.playByDefault;
    this.sequenceControl.value = element.sequence;
  }

  private readonly onColorChanged = (color: EColor): void => {
    STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, color });
  };

  private readonly onFrameRateChanged = (frameRate: number): void => {
    STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, frameRate });
  };

  private readonly onTimeScaleChanged = (timeScale: number): void => {
    STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, timeScale });
  };

  private readonly onLoopModeChanged = (loopMode: EAnimatedImageLoopMode): void => {
    STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, loopMode });
  };

  private readonly onPlayByDefaultChanged = (playByDefault: boolean): void => {
    STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, playByDefault });
  };

  private readonly onSequenceChanged = (sequence: EAssetUuid[]): void => {
    STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, sequence });
  };

  private readonly onElementItemChanged = (delta: EStoreDeltaElement): void => {
    if (delta.element.uuid === this.uuid && delta.element.type === EElementType.ANIMATED_IMAGE) {
      this.refresh(delta.element);
    }
  };
}
