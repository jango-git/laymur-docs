import { Registry } from "./Registry";

export interface PolicyParamDescriptor {
  key: string;
  label: string;
  default: number;
}

export interface PolicyDescriptor {
  type: string;
  label: string;
  params: PolicyParamDescriptor[];
}

export const POLICY_REGISTRY = new Registry<PolicyDescriptor>([
  { type: "none", label: "None", params: [] },
  {
    type: "cover",
    label: "Cover",
    params: [
      { key: "rectWidth", label: "Rect Width", default: 1920 },
      { key: "rectHeight", label: "Rect Height", default: 1080 },
    ],
  },
  {
    type: "fit",
    label: "Fit",
    params: [
      { key: "rectWidth", label: "Rect Width", default: 1920 },
      { key: "rectHeight", label: "Rect Height", default: 1080 },
    ],
  },
  {
    type: "cross",
    label: "Cross",
    params: [
      { key: "fixedWidthLandscape", label: "Landscape W", default: 1920 },
      { key: "fixedHeightPortrait", label: "Portrait H", default: 1920 },
    ],
  },
  {
    type: "crossInverted",
    label: "Cross Inverted",
    params: [
      { key: "fixedWidthLandscape", label: "Landscape W", default: 1920 },
      { key: "fixedHeightPortrait", label: "Portrait H", default: 1920 },
    ],
  },
  {
    type: "fixedWidth",
    label: "Fixed Width",
    params: [
      { key: "fixedWidthLandscape", label: "Landscape W", default: 1920 },
      { key: "fixedWidthPortrait", label: "Portrait W", default: 1080 },
    ],
  },
  {
    type: "fixedHeight",
    label: "Fixed Height",
    params: [
      { key: "fixedHeightLandscape", label: "Landscape H", default: 1080 },
      { key: "fixedHeightPortrait", label: "Portrait H", default: 1920 },
    ],
  },
]);

export function defaultPolicyParams(policyType: string): Record<string, number> {
  return Object.fromEntries(
    (POLICY_REGISTRY.get(policyType)?.params ?? []).map((p) => [p.key, p.default]),
  );
}
