import type { ESelectControlOption } from "../../../controls/ESelectControl/ESelectControl";
import { ENineSliceRegionMode } from "../../../document/types.misc";

export const REGION_MODE_OPTIONS: ESelectControlOption<ENineSliceRegionMode>[] = [
  { label: "Normalized", value: ENineSliceRegionMode.NORMALIZED },
  { label: "World", value: ENineSliceRegionMode.WORLD },
];
