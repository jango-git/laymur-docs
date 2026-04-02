import type { UIAnimatedImageLoopMode, UINineSliceRegionMode, UISceneUpdateMode } from "laymur";

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
