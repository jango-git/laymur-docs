import type {
  EMessageAssetPayloadFont,
  EMessageAssetPayloadImage,
  EMessageConstraintPayloadAspect,
  EMessageConstraintPayloadDistance,
  EMessageConstraintPayloadProportion,
  EMessageConstraintPayloadSize,
  EMessageElementPayloadAnimatedImage,
  EMessageElementPayloadGraphics,
  EMessageElementPayloadImage,
  EMessageElementPayloadNineSlice,
  EMessageElementPayloadProgress,
  EMessageElementPayloadScene,
  EMessageElementPayloadText,
  EMessageLayerPayloadLayerFullscreen,
} from "./EBridge.Payload";

export enum EMessageType {
  // Layers
  LAYER_FULLSCREEN_ADD = "LAYER_FULLSCREEN_ADD",
  LAYER_FULLSCREEN_UPDATE = "LAYER_FULLSCREEN_UPDATE",
  LAYER_REMOVE = "LAYER_REMOVE",
  LAYER_DEBUG_UPDATE = "LAYER_DEBUG_UPDATE",
  LAYER_SET_ACTIVE = "LAYER_SET_ACTIVE",

  // Elements
  ELEMENT_ANIMATED_IMAGE_ADD = "ELEMENT_ANIMATED_IMAGE_ADD",
  ELEMENT_ANIMATED_IMAGE_UPDATE = "ELEMENT_ANIMATED_IMAGE_UPDATE",
  ELEMENT_GRAPHICS_ADD = "ELEMENT_GRAPHICS_ADD",
  ELEMENT_GRAPHICS_UPDATE = "ELEMENT_GRAPHICS_UPDATE",
  ELEMENT_IMAGE_ADD = "ELEMENT_IMAGE_ADD",
  ELEMENT_IMAGE_UPDATE = "ELEMENT_IMAGE_UPDATE",
  ELEMENT_NINE_SLICE_ADD = "ELEMENT_NINE_SLICE_ADD",
  ELEMENT_NINE_SLICE_UPDATE = "ELEMENT_NINE_SLICE_UPDATE",
  ELEMENT_PROGRESS_ADD = "ELEMENT_PROGRESS_ADD",
  ELEMENT_PROGRESS_UPDATE = "ELEMENT_PROGRESS_UPDATE",
  ELEMENT_SCENE_ADD = "ELEMENT_SCENE_ADD",
  ELEMENT_SCENE_UPDATE = "ELEMENT_SCENE_UPDATE",
  ELEMENT_TEXT_ADD = "ELEMENT_TEXT_ADD",
  ELEMENT_TEXT_UPDATE = "ELEMENT_TEXT_UPDATE",
  ELEMENT_REMOVE = "ELEMENT_REMOVE",

  // Constraints
  CONSTRAINT_ASPECT_ADD = "CONSTRAINT_ASPECT_ADD",
  CONSTRAINT_ASPECT_UPDATE = "CONSTRAINT_ASPECT_UPDATE",
  CONSTRAINT_DISTANCE_HORIZONTAL_ADD = "CONSTRAINT_DISTANCE_HORIZONTAL_ADD",
  CONSTRAINT_DISTANCE_HORIZONTAL_UPDATE = "CONSTRAINT_DISTANCE_HORIZONTAL_UPDATE",
  CONSTRAINT_DISTANCE_VERTICAL_ADD = "CONSTRAINT_DISTANCE_VERTICAL_ADD",
  CONSTRAINT_DISTANCE_VERTICAL_UPDATE = "CONSTRAINT_DISTANCE_VERTICAL_UPDATE",
  CONSTRAINT_PROPORTION_HORIZONTAL_ADD = "CONSTRAINT_PROPORTION_HORIZONTAL_ADD",
  CONSTRAINT_PROPORTION_HORIZONTAL_UPDATE = "CONSTRAINT_PROPORTION_HORIZONTAL_UPDATE",
  CONSTRAINT_PROPORTION_VERTICAL_ADD = "CONSTRAINT_PROPORTION_VERTICAL_ADD",
  CONSTRAINT_PROPORTION_VERTICAL_UPDATE = "CONSTRAINT_PROPORTION_VERTICAL_UPDATE",
  CONSTRAINT_SIZE_HORIZONTAL_ADD = "CONSTRAINT_SIZE_HORIZONTAL_ADD",
  CONSTRAINT_SIZE_HORIZONTAL_UPDATE = "CONSTRAINT_SIZE_HORIZONTAL_UPDATE",
  CONSTRAINT_SIZE_VERTICAL_ADD = "CONSTRAINT_SIZE_VERTICAL_ADD",
  CONSTRAINT_SIZE_VERTICAL_UPDATE = "CONSTRAINT_SIZE_VERTICAL_UPDATE",
  CONSTRAINT_REMOVE = "CONSTRAINT_REMOVE",

  // Assets
  ASSET_FONT_ADD = "ASSET_FONT_ADD",
  ASSET_FONT_UPDATE = "ASSET_FONT_UPDATE",

  ASSET_IMAGE_ADD = "ASSET_IMAGE_ADD",
  ASSET_IMAGE_UPDATE = "ASSET_IMAGE_UPDATE",

  ASSET_REMOVE = "ASSET_REMOVE",

  // Common
  COMMON_SET_THEME = "COMMON_SET_THEME",
  COMMON_RESET = "COMMON_RESET",
}

export interface EMessage {
  type: EMessageType;
}

// Layers
export interface EMessageLayerFullscreenAdd extends EMessage, EMessageLayerPayloadLayerFullscreen {
  type: EMessageType.LAYER_FULLSCREEN_ADD;
}

export interface EMessageLayerFullscreenUpdate
  extends EMessage, EMessageLayerPayloadLayerFullscreen {
  type: EMessageType.LAYER_FULLSCREEN_UPDATE;
}

export interface EMessageLayerRemove extends EMessage {
  type: EMessageType.LAYER_REMOVE;
  uuid: string;
}

export interface EMessageLayerDebugUpdate extends EMessage {
  type: EMessageType.LAYER_DEBUG_UPDATE;
  uuid: string;
  showAspect: boolean;
  showHeight: boolean;
  showWidth: boolean;
  showHorizontalDistance: boolean;
  showHorizontalInterpolation: boolean;
  showVerticalDistance: boolean;
  showVerticalInterpolation: boolean;
}

export interface EMessageLayerSetActive extends EMessage {
  type: EMessageType.LAYER_SET_ACTIVE;
  uuid: string;
  isActive: boolean;
}

// Elements
export interface EMessageElementAnimatedImageAdd
  extends EMessage, EMessageElementPayloadAnimatedImage {
  type: EMessageType.ELEMENT_ANIMATED_IMAGE_ADD;
  playByDefault: boolean;
}

export interface EMessageElementAnimatedImageUpdate
  extends EMessage, EMessageElementPayloadAnimatedImage {
  type: EMessageType.ELEMENT_ANIMATED_IMAGE_UPDATE;
}

export interface EMessageElementGraphicsAdd extends EMessage, EMessageElementPayloadGraphics {
  type: EMessageType.ELEMENT_GRAPHICS_ADD;
  resolution: [number, number];
}

export interface EMessageElementGraphicsUpdate extends EMessage, EMessageElementPayloadGraphics {
  type: EMessageType.ELEMENT_GRAPHICS_UPDATE;
}

export interface EMessageElementImageAdd extends EMessage, EMessageElementPayloadImage {
  type: EMessageType.ELEMENT_IMAGE_ADD;
}

export interface EMessageElementImageUpdate extends EMessage, EMessageElementPayloadImage {
  type: EMessageType.ELEMENT_IMAGE_UPDATE;
}

export interface EMessageElementNineSliceAdd extends EMessage, EMessageElementPayloadNineSlice {
  type: EMessageType.ELEMENT_NINE_SLICE_ADD;
}

export interface EMessageElementNineSliceUpdate extends EMessage, EMessageElementPayloadNineSlice {
  type: EMessageType.ELEMENT_NINE_SLICE_UPDATE;
}

export interface EMessageElementProgressAdd extends EMessage, EMessageElementPayloadProgress {
  type: EMessageType.ELEMENT_PROGRESS_ADD;
}

export interface EMessageElementProgressUpdate extends EMessage, EMessageElementPayloadProgress {
  type: EMessageType.ELEMENT_PROGRESS_UPDATE;
}

export interface EMessageElementSceneAdd extends EMessage, EMessageElementPayloadScene {
  type: EMessageType.ELEMENT_SCENE_ADD;
}

export interface EMessageElementSceneUpdate extends EMessage, EMessageElementPayloadScene {
  type: EMessageType.ELEMENT_SCENE_UPDATE;
}

export interface EMessageElementTextAdd extends EMessage, EMessageElementPayloadText {
  type: EMessageType.ELEMENT_TEXT_ADD;
}

export interface EMessageElementTextUpdate extends EMessage, EMessageElementPayloadText {
  type: EMessageType.ELEMENT_TEXT_UPDATE;
}

export interface EMessageElementRemove extends EMessage {
  type: EMessageType.ELEMENT_REMOVE;
  uuid: string;
  uuidLayer: string;
}

// Constraints
export interface EMessageConstraintAspectAdd extends EMessage, EMessageConstraintPayloadAspect {
  type: EMessageType.CONSTRAINT_ASPECT_ADD;
  uuidElementA: string;
}

export interface EMessageConstraintAspectUpdate extends EMessage, EMessageConstraintPayloadAspect {
  type: EMessageType.CONSTRAINT_ASPECT_UPDATE;
}

export interface EMessageConstraintDistanceHorizontalAdd
  extends EMessage, EMessageConstraintPayloadDistance {
  type: EMessageType.CONSTRAINT_DISTANCE_HORIZONTAL_ADD;
  uuidElementA: string;
  uuidElementB: string;
}

export interface EMessageConstraintDistanceHorizontalUpdate
  extends EMessage, EMessageConstraintPayloadDistance {
  type: EMessageType.CONSTRAINT_DISTANCE_HORIZONTAL_UPDATE;
}

export interface EMessageConstraintDistanceVerticalAdd
  extends EMessage, EMessageConstraintPayloadDistance {
  type: EMessageType.CONSTRAINT_DISTANCE_VERTICAL_ADD;
  uuidElementA: string;
  uuidElementB: string;
}

export interface EMessageConstraintDistanceVerticalUpdate
  extends EMessage, EMessageConstraintPayloadDistance {
  type: EMessageType.CONSTRAINT_DISTANCE_VERTICAL_UPDATE;
}

export interface EMessageConstraintProportionHorizontalAdd
  extends EMessage, EMessageConstraintPayloadProportion {
  type: EMessageType.CONSTRAINT_PROPORTION_HORIZONTAL_ADD;
  uuidElementA: string;
  uuidElementB: string;
}

export interface EMessageConstraintProportionHorizontalUpdate
  extends EMessage, EMessageConstraintPayloadProportion {
  type: EMessageType.CONSTRAINT_PROPORTION_HORIZONTAL_UPDATE;
}

export interface EMessageConstraintProportionVerticalAdd
  extends EMessage, EMessageConstraintPayloadProportion {
  type: EMessageType.CONSTRAINT_PROPORTION_VERTICAL_ADD;
  uuidElementA: string;
  uuidElementB: string;
}

export interface EMessageConstraintProportionVerticalUpdate
  extends EMessage, EMessageConstraintPayloadProportion {
  type: EMessageType.CONSTRAINT_PROPORTION_VERTICAL_UPDATE;
}

export interface EMessageConstraintSizeHorizontalAdd
  extends EMessage, EMessageConstraintPayloadSize {
  type: EMessageType.CONSTRAINT_SIZE_HORIZONTAL_ADD;
  uuidElementA: string;
}

export interface EMessageConstraintSizeHorizontalUpdate
  extends EMessage, EMessageConstraintPayloadSize {
  type: EMessageType.CONSTRAINT_SIZE_HORIZONTAL_UPDATE;
}

export interface EMessageConstraintSizeVerticalAdd extends EMessage, EMessageConstraintPayloadSize {
  type: EMessageType.CONSTRAINT_SIZE_VERTICAL_ADD;
  uuidElementA: string;
}

export interface EMessageConstraintSizeVerticalUpdate
  extends EMessage, EMessageConstraintPayloadSize {
  type: EMessageType.CONSTRAINT_SIZE_VERTICAL_UPDATE;
}

export interface EMessageConstraintRemove extends EMessage {
  type: EMessageType.CONSTRAINT_REMOVE;
  uuid: string;
}

// Assets

export interface EMessageAssetFontAdd extends EMessage, EMessageAssetPayloadFont {
  type: EMessageType.ASSET_FONT_ADD;
}

export interface EMessageAssetFontUpdate extends EMessage, EMessageAssetPayloadFont {
  type: EMessageType.ASSET_FONT_UPDATE;
}

export interface EMessageAssetImageAdd extends EMessage, EMessageAssetPayloadImage {
  type: EMessageType.ASSET_IMAGE_ADD;
}

export interface EMessageAssetImageUpdate extends EMessage, EMessageAssetPayloadImage {
  type: EMessageType.ASSET_IMAGE_UPDATE;
}

export interface EMessageAssetRemove extends EMessage {
  type: EMessageType.ASSET_REMOVE;
  uuid: string;
}

// Common

export interface EMessageCommonSetTheme extends EMessage {
  type: EMessageType.COMMON_SET_THEME;
  theme: "DARK" | "LIGHT";
}

export interface EMessageCommonReset extends EMessage {
  type: EMessageType.COMMON_RESET;
}
