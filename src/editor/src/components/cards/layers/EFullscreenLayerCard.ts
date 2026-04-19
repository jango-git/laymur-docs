import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import type { EStoreDeltaLayer } from "../../../document/signals/layers";
import { STORE } from "../../../document/store";
import type { ELayerFullscreen } from "../../../document/types.layers";
import { ELayerType } from "../../../document/types.layers";
import type { ELayerUUID } from "../../../document/types.misc";
import { EResizePolicyType } from "../../../document/types.misc";
import { LARGE } from "../../../miscellaneous/math";
import { makeRow } from "../../../miscellaneous/rows";
import { RESIZE_POLICY_OPTIONS } from "./EFullscreenLayerCard.Internal";
import { ELayerCard } from "./ELayerCard";

export class EFullscreenLayerCard extends ELayerCard {
  private readonly resizePolicyControl: ESelectControl<EResizePolicyType>;
  private readonly horizontalControl: ENumberControl;
  private readonly verticalControl: ENumberControl;
  private readonly horizontalRow: HTMLElement;
  private readonly verticalRow: HTMLElement;

  constructor(container: HTMLElement, uuid: ELayerUUID) {
    super(container, uuid, "Fullscreen");

    this.nameControl.signalValueChanged.on(this.onNameChanged);

    this.resizePolicyControl = new ESelectControl<EResizePolicyType>(
      makeRow(this.bodyRoot, "Resize Policy"),
      {
        options: RESIZE_POLICY_OPTIONS,
        value: EResizePolicyType.NONE,
      },
    );
    this.resizePolicyControl.signalValueChanged.on(this.onResizePolicyChanged);

    this.horizontalRow = makeRow(this.bodyRoot, "Horizontal");
    this.horizontalControl = new ENumberControl(this.horizontalRow, {
      value: 1920,
      min: 2,
      max: LARGE,
      step: 1,
      precision: 0,
    });
    this.horizontalControl.signalValueChanged.on(this.onHorizontalChanged);

    this.verticalRow = makeRow(this.bodyRoot, "Vertical");
    this.verticalControl = new ENumberControl(this.verticalRow, {
      value: 1920,
      min: 2,
      max: LARGE,
      step: 1,
      precision: 0,
    });
    this.verticalControl.signalValueChanged.on(this.onVerticalChanged);

    const initial = STORE.selectors.layers.select(uuid);
    if (initial?.type === ELayerType.FULLSCREEN) {
      this.refresh(initial);
    }

    STORE.signals.layers.item.on(this.onLayerItemChanged);
  }

  private refresh(layer: ELayerFullscreen): void {
    this.nameControl.value = layer.name;
    this.resizePolicyControl.value = layer.resizePolicy;
    this.horizontalControl.value = layer.resizePolicyParameters[0];
    this.verticalControl.value = layer.resizePolicyParameters[1];
    const showParams = layer.resizePolicy !== EResizePolicyType.NONE;
    this.horizontalRow.style.display = showParams ? "" : "none";
    this.verticalRow.style.display = showParams ? "" : "none";
  }

  private readonly onNameChanged = (name: string): void => {
    STORE.commands.layers.writeFullscreen({ uuid: this.uuid, name });
  };

  private readonly onResizePolicyChanged = (resizePolicy: EResizePolicyType): void => {
    STORE.commands.layers.writeFullscreen({ uuid: this.uuid, resizePolicy });
  };

  private readonly onHorizontalChanged = (horizontal: number): void => {
    STORE.commands.layers.writeFullscreen({
      uuid: this.uuid,
      resizePolicyParameters: [horizontal, this.verticalControl.value],
    });
  };

  private readonly onVerticalChanged = (vertical: number): void => {
    STORE.commands.layers.writeFullscreen({
      uuid: this.uuid,
      resizePolicyParameters: [this.horizontalControl.value, vertical],
    });
  };

  private readonly onLayerItemChanged = (delta: EStoreDeltaLayer): void => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (delta.layer.uuid === this.uuid && delta.layer.type === ELayerType.FULLSCREEN) {
      this.refresh(delta.layer);
    }
  };
}
