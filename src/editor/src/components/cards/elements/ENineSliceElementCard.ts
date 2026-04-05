import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import type { ESelectControlOption } from "../../../controls/ESelectControl/ESelectControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import type { ENineSliceElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EElementUUID } from "../../../document/types.misc";
import { ENineSliceRegionMode } from "../../../document/types.misc";
import { makeRow } from "./helpers";

const REGION_MODE_OPTIONS: ESelectControlOption<ENineSliceRegionMode>[] = [
  { label: "Normalized", value: ENineSliceRegionMode.NORMALIZED },
  { label: "World", value: ENineSliceRegionMode.WORLD },
];

export class ENineSliceElementCard {
  private readonly colorControl: EColorControl;
  private readonly textureControl: EAssetControl<EImageAsset>;
  private readonly bordersHControl: ENumberControl;
  private readonly bordersVControl: ENumberControl;
  private readonly regionsHControl: ENumberControl;
  private readonly regionsVControl: ENumberControl;
  private readonly regionModeControl: ESelectControl<ENineSliceRegionMode>;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EElementUUID,
  ) {
    const root = document.createElement("div");
    root.className = "element-card";

    const colorRow = makeRow(root, "Color");
    this.colorControl = new EColorControl(colorRow);

    const textureRow = makeRow(root, "Texture");
    this.textureControl = new EAssetControl<EImageAsset>(
      textureRow,
      STORE.selectors.assets.selectAllImages,
      { nullable: false },
    );

    const bordersRow = makeRow(root, "Borders");
    const bHLabel = document.createElement("span");
    bHLabel.className = "element-card__label";
    bHLabel.textContent = "H";
    bordersRow.appendChild(bHLabel);
    this.bordersHControl = new ENumberControl(bordersRow, {
      value: 0,
      min: 0,
      max: 9999,
      step: 1,
      precision: 1,
    });
    const bVLabel = document.createElement("span");
    bVLabel.className = "element-card__label";
    bVLabel.textContent = "V";
    bordersRow.appendChild(bVLabel);
    this.bordersVControl = new ENumberControl(bordersRow, {
      value: 0,
      min: 0,
      max: 9999,
      step: 1,
      precision: 1,
    });

    const regionsRow = makeRow(root, "Regions");
    const rHLabel = document.createElement("span");
    rHLabel.className = "element-card__label";
    rHLabel.textContent = "H";
    regionsRow.appendChild(rHLabel);
    this.regionsHControl = new ENumberControl(regionsRow, {
      value: 0,
      min: 0,
      max: 9999,
      step: 1,
      precision: 1,
    });
    const rVLabel = document.createElement("span");
    rVLabel.className = "element-card__label";
    rVLabel.textContent = "V";
    regionsRow.appendChild(rVLabel);
    this.regionsVControl = new ENumberControl(regionsRow, {
      value: 0,
      min: 0,
      max: 9999,
      step: 1,
      precision: 1,
    });

    const regionModeRow = makeRow(root, "Region Mode");
    this.regionModeControl = new ESelectControl<ENineSliceRegionMode>(regionModeRow, {
      options: REGION_MODE_OPTIONS,
      value: ENineSliceRegionMode.NORMALIZED,
    });

    this.container.appendChild(root);

    this.colorControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeNineSlice({ uuid: this.uuid, color: next });
    });
    this.textureControl.signalValueChanged.on((next) => {
      if (next !== undefined) {
        STORE.commands.elements.writeNineSlice({ uuid: this.uuid, texture: next.uuid });
      }
    });
    this.bordersHControl.signalValueChanged.on((next) => {
      const v = this.bordersVControl.value;
      STORE.commands.elements.writeNineSlice({
        uuid: this.uuid,
        sliceBorders: [next, v, next, v],
      });
    });
    this.bordersVControl.signalValueChanged.on((next) => {
      const h = this.bordersHControl.value;
      STORE.commands.elements.writeNineSlice({
        uuid: this.uuid,
        sliceBorders: [h, next, h, next],
      });
    });
    this.regionsHControl.signalValueChanged.on((next) => {
      const v = this.regionsVControl.value;
      STORE.commands.elements.writeNineSlice({
        uuid: this.uuid,
        sliceRegions: [next, v, next, v],
      });
    });
    this.regionsVControl.signalValueChanged.on((next) => {
      const h = this.regionsHControl.value;
      STORE.commands.elements.writeNineSlice({
        uuid: this.uuid,
        sliceRegions: [h, next, h, next],
      });
    });
    this.regionModeControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeNineSlice({ uuid: this.uuid, regionMode: next });
    });

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type === EElementType.NINE_SLICE) {
      this.refresh(initial);
    }

    STORE.signals.elements.item.on((delta) => {
      if (delta.element.uuid === this.uuid && delta.element.type === EElementType.NINE_SLICE) {
        this.refresh(delta.element);
      }
    });
  }

  private refresh(element: ENineSliceElement): void {
    this.colorControl.value = element.color;
    this.textureControl.value = STORE.selectors.assets.selectImage(element.texture);
    this.bordersHControl.value = element.sliceBorders[0];
    this.bordersVControl.value = element.sliceBorders[1];
    this.regionsHControl.value = element.sliceRegions[0];
    this.regionsVControl.value = element.sliceRegions[1];
    this.regionModeControl.value = element.regionMode;
  }
}
