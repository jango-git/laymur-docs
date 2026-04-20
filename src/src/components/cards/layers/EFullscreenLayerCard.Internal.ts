import { EResizePolicyType } from "../../../document/types.misc";

export const RESIZE_POLICY_OPTIONS = [
  { label: "None", value: EResizePolicyType.NONE },
  { label: "Cover", value: EResizePolicyType.COVER },
  { label: "Fit", value: EResizePolicyType.FIT },
  { label: "Cross", value: EResizePolicyType.CROSS },
  { label: "Cross Inverted", value: EResizePolicyType.CROSS_INVERTED },
  { label: "Fixed Width", value: EResizePolicyType.FIXED_WIDTH },
  { label: "Fixed Height", value: EResizePolicyType.FIXED_HEIGHT },
];
