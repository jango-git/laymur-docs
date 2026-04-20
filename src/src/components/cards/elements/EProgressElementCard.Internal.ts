import type { ESelectControlOption } from "../../../controls/ESelectControl/ESelectControl";
import { EProgressMaskFunction } from "../../../document/types.misc";

export const MASK_FUNCTION_OPTIONS: ESelectControlOption<EProgressMaskFunction>[] = [
  { label: "Circular", value: EProgressMaskFunction.CIRCULAR },
  { label: "Directional", value: EProgressMaskFunction.DIRECTIONAL },
];
