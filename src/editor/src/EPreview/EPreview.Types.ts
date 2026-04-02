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

export type UIElement =
  | UIAnimatedImage
  | UIGraphics
  | UIImage
  | UINineSlice
  | UIProgress
  | UIScene
  | UIText;

export type UIConstraint =
  | UIAspectConstraint
  | UIHorizontalDistanceConstraint
  | UIVerticalDistanceConstraint
  | UIHorizontalProportionConstraint
  | UIVerticalProportionConstraint
  | UIWidthConstraint
  | UIHeightConstraint;

export interface LayerContext {
  layer: UILayer;
  debug: UILayerDebug;
  elements: Map<string, UIElement>;
  constraints: Map<string, UIConstraint>;
}

export type AssetType = Texture | FontFace;
