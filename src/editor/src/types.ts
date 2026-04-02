export interface AssetMeta {
  assetType: "image" | "font";
  name: string;
  url: string;
  dataURL: string;
  fontFamily?: string;
}

export interface ElementState {
  id: string;
  type: string;
  name: string;
  fieldValues: Record<string, unknown>;
}

export interface ConstraintState {
  id: string;
  constraintType: string;
  name?: string;
  fieldValues: Record<string, string | number>;
}

export interface LayerState {
  id: string;
  name: string;
  policyType: string;
  policyParams: Record<string, number>;
  elements: ElementState[];
  constraints: ConstraintState[];
}

export interface UITextStyleConfig {
  color: string;
  align: "left" | "center" | "right";
  fontFamily: string;
  fontSize: number;
  fontStyle: "normal" | "italic" | "oblique";
  fontWeight: "normal" | "bold" | "bolder" | "lighter";
  lineHeight: number;
  enableShadow: boolean;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowColor: string;
  enableStroke: boolean;
  strokeColor: string;
  strokeThickness: number;
}

export const TEXT_STYLE_DEFAULTS: UITextStyleConfig = {
  color: "#000000ff",
  align: "left",
  fontFamily: "Arial",
  fontSize: 16,
  fontStyle: "normal",
  fontWeight: "normal",
  lineHeight: 1.2,
  enableShadow: false,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: "#00000000",
  enableStroke: false,
  strokeColor: "#000000ff",
  strokeThickness: 0,
};
