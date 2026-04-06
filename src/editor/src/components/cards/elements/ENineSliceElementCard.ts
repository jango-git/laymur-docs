import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { EVec2Control } from "../../../controls/EVec2Control/EVec2Control";
import type { EStoreDeltaElement } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { ENineSliceElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EElementUuid } from "../../../document/types.misc";
import { ENineSliceRegionMode } from "../../../document/types.misc";
import { makeRow } from "../../../utils/rows";
import { REGION_MODE_OPTIONS } from "./ENineSliceElementCard.Internal";

export class ENineSliceElementCard {
  private readonly colorControl: EColorControl;
  private readonly textureControl: EAssetControl<EImageAsset>;
  private readonly bordersControl: EVec2Control;
  private readonly regionsControl: EVec2Control;
  private readonly regionModeControl: ESelectControl<ENineSliceRegionMode>;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EElementUuid,
  ) {
    const root = document.createElement("div");
    root.className = "element-card";

    this.colorControl = new EColorControl(makeRow(root, "Color"));
    this.colorControl.signalValueChanged.on(this.onColorChanged);

    this.textureControl = new EAssetControl<EImageAsset>(
      makeRow(root, "Texture"),
      () => STORE.selectors.assets.selectAllImages(),
      { nullable: false },
    );
    this.textureControl.signalValueChanged.on(this.onTextureChanged);

    this.bordersControl = new EVec2Control(makeRow(root, "Borders"), {
      labels: ["H", "V"],
      min: 0,
      max: 9999,
      step: 1,
      precision: 1,
    });
    this.bordersControl.signalValueChanged.on(this.onBordersChanged);

    this.regionsControl = new EVec2Control(makeRow(root, "Regions"), {
      labels: ["H", "V"],
      min: 0,
      max: 9999,
      step: 1,
      precision: 1,
    });
    this.regionsControl.signalValueChanged.on(this.onRegionsChanged);

    this.regionModeControl = new ESelectControl<ENineSliceRegionMode>(
      makeRow(root, "Region Mode"),
      {
        options: REGION_MODE_OPTIONS,
        value: ENineSliceRegionMode.NORMALIZED,
      },
    );
    this.regionModeControl.signalValueChanged.on(this.onRegionModeChanged);

    this.container.appendChild(root);

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type !== EElementType.NINE_SLICE) {
      throw new Error("ENineSliceElementCard: initial element is not a nine-slice element");
    }

    this.refresh(initial);
    STORE.signals.elements.item.on(this.onElementItemChanged);
  }

  private refresh(element: ENineSliceElement): void {
    this.colorControl.value = element.color;
    this.textureControl.value = STORE.selectors.assets.selectImage(element.texture);
    this.bordersControl.value = [element.sliceBorders[0], element.sliceBorders[1]];
    this.regionsControl.value = [element.sliceRegions[0], element.sliceRegions[1]];
    this.regionModeControl.value = element.regionMode;
  }

  private readonly onColorChanged = (color: string): void => {
    STORE.commands.elements.writeNineSlice({ uuid: this.uuid, color });
  };

  private readonly onTextureChanged = (next: EImageAsset | undefined): void => {
    if (next !== undefined) {
      STORE.commands.elements.writeNineSlice({ uuid: this.uuid, texture: next.uuid });
    }
  };

  private readonly onBordersChanged = ([h, v]: [number, number]): void => {
    STORE.commands.elements.writeNineSlice({ uuid: this.uuid, sliceBorders: [h, v, h, v] });
  };

  private readonly onRegionsChanged = ([h, v]: [number, number]): void => {
    STORE.commands.elements.writeNineSlice({ uuid: this.uuid, sliceRegions: [h, v, h, v] });
  };

  private readonly onRegionModeChanged = (regionMode: ENineSliceRegionMode): void => {
    STORE.commands.elements.writeNineSlice({ uuid: this.uuid, regionMode });
  };

  private readonly onElementItemChanged = (delta: EStoreDeltaElement): void => {
    if (delta.element.uuid === this.uuid && delta.element.type === EElementType.NINE_SLICE) {
      this.refresh(delta.element);
    }
  };
}
