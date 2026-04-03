import type {
  UIAnimatedImageLoopMode,
  UINineSliceRegionMode,
  UISceneUpdateMode,
  UITextResizeMode,
} from "laymur";

export enum EResizePolicyType {
  COVER = "COVER",
  CROSS = "CROSS",
  CROSS_INVERTED = "CROSS_INVERTED",
  FIT = "FIT",
  FIXED_HEIGHT = "FIXED_HEIGHT",
  FIXED_WIDTH = "FIXED_WIDTH",
  NONE = "NONE",
}

export type EAnimatedImageLoopType = UIAnimatedImageLoopMode;

export type ENineSliceRegionMode = UINineSliceRegionMode;

export enum EProgressMaskFunction {
  CIRCULAR = "CIRCULAR",
  DIRECTIONAL = "DIRECTIONAL",
}

export type ESceneUpdateMode = UISceneUpdateMode;

export type ETextAlign = "left" | "center" | "right";

export type ETextFontStyle = "normal" | "italic" | "oblique";

export type ETextFontWeight = "normal" | "bold" | "bolder" | "lighter";

export type ETextResizeMode = UITextResizeMode;

export type EGraphicsDrawCommand =
  | { x: number; y: number; width: number; height: number; color: string }
  | { x: number; y: number; radius: number; color: string }
  | { x: number; y: number; radius: number; startAngle: number; endAngle: number; color: string }
  | { points: [number, number][]; color: string; lineWidth: number };
