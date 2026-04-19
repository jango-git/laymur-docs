import type {
  UIAnimatedImage,
  UIAspectConstraint,
  UIFullscreenLayer,
  UIGraphics,
  UIHeightConstraint,
  UIHorizontalDistanceConstraint,
  UIHorizontalProportionConstraint,
  UIImage,
  UINineSlice,
  UIProgress,
  UIScene,
  UIText,
  UIVerticalDistanceConstraint,
  UIVerticalProportionConstraint,
  UIWidthConstraint,
} from "laymur";
import type { UILayerDebug } from "laymur/debug";
import type { Texture } from "three";

export type UILayer = UIFullscreenLayer;

export type UIAnyElement =
  | UIAnimatedImage
  | UIGraphics
  | UIImage
  | UINineSlice
  | UIProgress
  | UIScene
  | UIText;

export type UIAnyConstraint =
  | UIAspectConstraint
  | UIHorizontalDistanceConstraint
  | UIVerticalDistanceConstraint
  | UIHorizontalProportionConstraint
  | UIVerticalProportionConstraint
  | UIWidthConstraint
  | UIHeightConstraint;

export interface UILayerContext {
  layer: UILayer;
  debug: UILayerDebug;
  elements: Map<string, UIAnyElement>;
  constraints: Map<string, UIAnyConstraint>;
}

export type EAssetRawDataType = Texture | FontFace;
