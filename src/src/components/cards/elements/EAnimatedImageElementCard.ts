import { EArrayControl } from "../../../controls/EArrayControl/EArrayControl";
import { EBoolControl } from "../../../controls/EBoolControl/EBoolControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import type { EStoreDeltaElement } from "../../../document/signals/elements";
import { STORE } from "../../../document/store";
import type { EAnimatedImageElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EAssetUUID, EColor, EElementUUID, ELayerUUID } from "../../../document/types.misc";
import { EAnimatedImageLoopMode } from "../../../document/types.misc";
import { makeRow } from "../../../miscellaneous/rows";
import { LOOP_MODE_OPTIONS, sequenceTemplate } from "./EAnimatedImageElementCard.Internal";
import { EElementCard } from "./EElementCard";

export class EAnimatedImageElementCard extends EElementCard {
  private readonly sequenceControl: EArrayControl<EAssetUUID>;
  private readonly frameRateControl: ENumberControl;
  private readonly timeScaleControl: ENumberControl;
  private readonly loopModeControl: ESelectControl<EAnimatedImageLoopMode>;
  private readonly playByDefaultControl: EBoolControl;

  constructor(container: HTMLElement, uuid: EElementUUID, layerUuid: ELayerUUID) {
    super(container, uuid, layerUuid, "Animated Image");

    this.frameRateControl = new ENumberControl(makeRow(this.bodyRoot, "Frame Rate"), {
      value: 24,
      min: 1,
      max: 240,
      step: 1,
      precision: 0,
    });

    this.timeScaleControl = new ENumberControl(makeRow(this.bodyRoot, "Time Scale"), {
      value: 1,
      min: 0,
      max: 10,
      step: 0.01,
      precision: 2,
    });

    this.loopModeControl = new ESelectControl<EAnimatedImageLoopMode>(
      makeRow(this.bodyRoot, "Loop Mode"),
      {
        options: LOOP_MODE_OPTIONS,
        value: EAnimatedImageLoopMode.LOOP,
      },
    );

    this.playByDefaultControl = new EBoolControl(makeRow(this.bodyRoot, "Auto Play"), {
      value: true,
    });

    this.sequenceControl = new EArrayControl<EAssetUUID>(
      makeRow(this.bodyRoot, "Sequence"),
      sequenceTemplate,
    );

    this.nameControl.signalValueChanged.on(this.onNameChanged);
    this.colorControl.signalValueChanged.on(this.onColorChanged);
    this.frameRateControl.signalValueChanged.on(this.onFrameRateChanged);
    this.timeScaleControl.signalValueChanged.on(this.onTimeScaleChanged);
    this.loopModeControl.signalValueChanged.on(this.onLoopModeChanged);
    this.playByDefaultControl.signalValueChanged.on(this.onPlayByDefaultChanged);
    this.sequenceControl.signalValueChanged.on(this.onSequenceChanged);

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
    this.nameControl.value = element.name;
    this.colorControl.value = element.color;
    this.frameRateControl.value = element.frameRate;
    this.timeScaleControl.value = element.timeScale;
    this.loopModeControl.value = element.loopMode;
    this.playByDefaultControl.value = element.playByDefault;
    this.sequenceControl.value = element.sequence;
  }

  private readonly onNameChanged = (name: string): void => {
    STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, name });
  };

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

  private readonly onSequenceChanged = (sequence: EAssetUUID[]): void => {
    STORE.commands.elements.writeAnimatedImage({ uuid: this.uuid, sequence });
  };

  private readonly onElementItemChanged = (delta: EStoreDeltaElement): void => {
    if (delta.element.uuid === this.uuid && delta.element.type === EElementType.ANIMATED_IMAGE) {
      this.refresh(delta.element);
    }
  };
}
