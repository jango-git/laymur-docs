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

export type EAssetDataType = Texture | FontFace;

export type EAnyUILayer = UIFullscreenLayer;

export type EAnyUIElement =
  | UIAnimatedImage
  | UIGraphics
  | UIImage
  | UINineSlice
  | UIProgress
  | UIScene
  | UIText;

export type EAnyUIConstraint =
  | UIAspectConstraint
  | UIHorizontalDistanceConstraint
  | UIVerticalDistanceConstraint
  | UIHorizontalProportionConstraint
  | UIVerticalProportionConstraint
  | UIWidthConstraint
  | UIHeightConstraint;

export interface EPreviewLayerContext {
  layer: EAnyUILayer;
  debug: UILayerDebug;
  elements: Map<string, EAnyUIElement>;
  constraints: Map<string, EAnyUIConstraint>;
}
