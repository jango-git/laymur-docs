import { EBoolControl } from "../../../controls/EBoolControl/EBoolControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import type { EStoreDeltaElement } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { ESceneElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EColor, UUID } from "../../../document/types.misc";
import { ESceneUpdateMode } from "../../../document/types.misc";
import { makeRow } from "../../../utils/rows";
import { EElementCard } from "./EElementCard";
import { UPDATE_MODE_OPTIONS } from "./ESceneElementCard.Internal";

export class ESceneElementCard extends EElementCard {
  private readonly updateModeControl: ESelectControl<ESceneUpdateMode>;
  private readonly resolutionFactorControl: ENumberControl;
  private readonly clearColorControl: EColorControl;
  private readonly enableDepthBufferControl: EBoolControl;

  constructor(container: HTMLElement, uuid: UUID, layerUuid: UUID) {
    super(container, uuid, layerUuid, "Scene");

    this.nameControl.signalValueChanged.on(this.onNameChanged);
    this.colorControl.signalValueChanged.on(this.onColorChanged);

    this.updateModeControl = new ESelectControl<ESceneUpdateMode>(
      makeRow(this.bodyRoot, "Update Mode"),
      {
        options: UPDATE_MODE_OPTIONS,
        value: ESceneUpdateMode.EVERY_FRAME,
      },
    );
    this.updateModeControl.signalValueChanged.on(this.onUpdateModeChanged);

    this.resolutionFactorControl = new ENumberControl(makeRow(this.bodyRoot, "Resolution Factor"), {
      value: 1,
      min: 0.1,
      max: 4,
      step: 0.1,
      precision: 2,
    });
    this.resolutionFactorControl.signalValueChanged.on(this.onResolutionFactorChanged);

    this.clearColorControl = new EColorControl(makeRow(this.bodyRoot, "Clear Color"));
    this.clearColorControl.signalValueChanged.on(this.onClearColorChanged);

    this.enableDepthBufferControl = new EBoolControl(makeRow(this.bodyRoot, "Depth Buffer"));
    this.enableDepthBufferControl.signalValueChanged.on(this.onEnableDepthBufferChanged);

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type !== EElementType.SCENE) {
      throw new Error("ESceneElementCard: initial element is not a scene element");
    }

    this.refresh(initial);
    STORE.signals.elements.item.on(this.onElementItemChanged);
  }

  private refresh(element: ESceneElement): void {
    this.nameControl.value = element.name;
    this.colorControl.value = element.color;
    this.updateModeControl.value = element.updateMode;
    this.resolutionFactorControl.value = element.resolutionFactor;
    this.clearColorControl.value = element.clearColor;
    this.enableDepthBufferControl.value = element.enableDepthBuffer;
  }

  private readonly onNameChanged = (name: string): void => {
    STORE.commands.elements.writeScene({ uuid: this.uuid, name });
  };

  private readonly onColorChanged = (color: EColor): void => {
    STORE.commands.elements.writeScene({ uuid: this.uuid, color });
  };

  private readonly onUpdateModeChanged = (updateMode: ESceneUpdateMode): void => {
    STORE.commands.elements.writeScene({ uuid: this.uuid, updateMode });
  };

  private readonly onResolutionFactorChanged = (resolutionFactor: number): void => {
    STORE.commands.elements.writeScene({ uuid: this.uuid, resolutionFactor });
  };

  private readonly onClearColorChanged = (clearColor: EColor): void => {
    STORE.commands.elements.writeScene({ uuid: this.uuid, clearColor });
  };

  private readonly onEnableDepthBufferChanged = (enableDepthBuffer: boolean): void => {
    STORE.commands.elements.writeScene({ uuid: this.uuid, enableDepthBuffer });
  };

  private readonly onElementItemChanged = (delta: EStoreDeltaElement): void => {
    if (delta.element.uuid === this.uuid && delta.element.type === EElementType.SCENE) {
      this.refresh(delta.element);
    }
  };
}
