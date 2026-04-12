import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { EVec2Control } from "../../../controls/EVec2Control/EVec2Control";
import type { EStoreDeltaElement } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { ENineSliceElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EColor, EElementUuid, ELayerUuid } from "../../../document/types.misc";
import { ENineSliceRegionMode } from "../../../document/types.misc";
import { makeRow } from "../../../utils/rows";
import { EElementCard } from "./EElementCard";
import { REGION_MODE_OPTIONS } from "./ENineSliceElementCard.Internal";

export class ENineSliceElementCard extends EElementCard {
  private readonly textureControl: EAssetControl<EImageAsset>;
  private readonly bordersControl: EVec2Control;
  private readonly regionsControl: EVec2Control;
  private readonly regionModeControl: ESelectControl<ENineSliceRegionMode>;

  constructor(container: HTMLElement, uuid: EElementUuid, layerUuid: ELayerUuid) {
    super(container, uuid, layerUuid, "Nine Slice");

    this.nameControl.signalValueChanged.on(this.onNameChanged);
    this.colorControl.signalValueChanged.on(this.onColorChanged);

    this.textureControl = new EAssetControl<EImageAsset>(
      makeRow(this.bodyRoot, "Texture"),
      () => STORE.selectors.assets.selectAllImages(),
      { nullable: false },
    );
    this.textureControl.signalValueChanged.on(this.onTextureChanged);

    this.bordersControl = new EVec2Control(makeRow(this.bodyRoot, "Borders"), {
      labels: ["H", "V"],
      min: 0,
      max: 9999,
      step: 1,
      precision: 1,
    });
    this.bordersControl.signalValueChanged.on(this.onBordersChanged);

    this.regionsControl = new EVec2Control(makeRow(this.bodyRoot, "Regions"), {
      labels: ["H", "V"],
      min: 0,
      max: 9999,
      step: 1,
      precision: 1,
    });
    this.regionsControl.signalValueChanged.on(this.onRegionsChanged);

    this.regionModeControl = new ESelectControl<ENineSliceRegionMode>(
      makeRow(this.bodyRoot, "Region Mode"),
      {
        options: REGION_MODE_OPTIONS,
        value: ENineSliceRegionMode.NORMALIZED,
      },
    );
    this.regionModeControl.signalValueChanged.on(this.onRegionModeChanged);

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type !== EElementType.NINE_SLICE) {
      throw new Error("ENineSliceElementCard: initial element is not a nine-slice element");
    }

    this.refresh(initial);
    STORE.signals.elements.item.on(this.onElementItemChanged);
  }

  private refresh(element: ENineSliceElement): void {
    this.nameControl.value = element.name;
    this.colorControl.value = element.color;
    this.textureControl.value = STORE.selectors.assets.selectImage(element.texture);
    this.bordersControl.value = [element.sliceBorders[0], element.sliceBorders[1]];
    this.regionsControl.value = [element.sliceRegions[0], element.sliceRegions[1]];
    this.regionModeControl.value = element.regionMode;
  }

  private readonly onNameChanged = (name: string): void => {
    STORE.commands.elements.writeNineSlice({ uuid: this.uuid, name });
  };

  private readonly onColorChanged = (color: EColor): void => {
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
