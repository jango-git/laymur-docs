export type EColor = string; // RRGGBBAA

export type EAssetUUID = string;

export type ELayerUUID = string;

export type EElementUUID = string;

export type EConstraintUUID = string;

export type EChildUUID = string;

export enum EResizePolicyType {
  COVER = "COVER",
  CROSS = "CROSS",
  CROSS_INVERTED = "CROSS_INVERTED",
  FIT = "FIT",
  FIXED_HEIGHT = "FIXED_HEIGHT",
  FIXED_WIDTH = "FIXED_WIDTH",
  NONE = "NONE",
}

export enum EAnimatedImageLoopMode {
  NONE = "NONE",
  LOOP = "LOOP",
  PING_PONG = "PING_PONG",
}

export enum ENineSliceRegionMode {
  NORMALIZED = "NORMALIZED",
  WORLD = "WORLD",
}

export enum EProgressMaskFunction {
  CIRCULAR = "CIRCULAR",
  DIRECTIONAL = "DIRECTIONAL",
}

export enum ESceneUpdateMode {
  EVERY_FRAME = "EVERY_FRAME",
  EVERY_SECOND_FRAME = "EVERY_SECOND_FRAME",
  ON_PROPERTIES_CHANGE = "ON_PROPERTIES_CHANGE",
  ON_DIMENSIONS_CHANGE = "ON_DIMENSIONS_CHANGE",
  MANUAL = "MANUAL",
}

export enum ETextAlign {
  LEFT = "LEFT",
  CENTER = "CENTER",
  RIGHT = "RIGHT",
}

export enum ETextFontStyle {
  NORMAL = "NORMAL",
  ITALIC = "ITALIC",
  OBLIQUE = "OBLIQUE",
}

export enum ETextFontWeight {
  NORMAL = "NORMAL",
  BOLD = "BOLD",
  BOLDER = "BOLDER",
  LIGHTER = "LIGHTER",
}

export enum ETextResizeMode {
  SCALE = "SCALE",
  WORLD = "WORLD",
}

export type EGraphicsDrawCommand =
  | { x: number; y: number; width: number; height: number; color: string }
  | { x: number; y: number; radius: number; color: string }
  | { x: number; y: number; radius: number; startAngle: number; endAngle: number; color: string }
  | { points: [number, number][]; color: string; lineWidth: number };

export interface ETextChunk {
  text: string;
  style: {
    color: EColor;
    align: ETextAlign;
    font: EAssetUUID;
    fontSize: number;
    fontStyle: ETextFontStyle;
    fontWeight: ETextFontWeight;
    lineHeight: number;
    enableShadow: boolean;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowBlur: number;
    shadowColor: EColor;
    enableStroke: boolean;
    strokeColor: EColor;
    strokeThickness: number;
  };
}
