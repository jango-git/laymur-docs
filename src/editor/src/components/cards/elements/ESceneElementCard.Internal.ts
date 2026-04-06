import type { ESelectControlOption } from "../../../controls/ESelectControl/ESelectControl";
import { ESceneUpdateMode } from "../../../document/types.misc";

export const UPDATE_MODE_OPTIONS: ESelectControlOption<ESceneUpdateMode>[] = [
  { label: "Every Frame", value: ESceneUpdateMode.EVERY_FRAME },
  { label: "Every 2nd Frame", value: ESceneUpdateMode.EVERY_SECOND_FRAME },
  { label: "On Props Change", value: ESceneUpdateMode.ON_PROPERTIES_CHANGE },
  { label: "On Dim Change", value: ESceneUpdateMode.ON_DIMENSIONS_CHANGE },
  { label: "Manual", value: ESceneUpdateMode.MANUAL },
];
