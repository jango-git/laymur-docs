export interface EColor {
  color: string; // #RRGGBB
  alpha: number; // 0-1
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type EAssetUUID = string & { __brand: "EAssetUUID" };
// eslint-disable-next-line @typescript-eslint/naming-convention
export type ELayerUUID = string & { __brand: "ELayerUUID" };
// eslint-disable-next-line @typescript-eslint/naming-convention
export type EElementUUID = string & { __brand: "EElementUUID" };
// eslint-disable-next-line @typescript-eslint/naming-convention
export type EConstraintUUID = string & { __brand: "EConstraintUUID" };

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
  BREAK = "BREAK",
}

export enum EGraphicsDrawCommandType {
  ARC = "ARC",
  CIRCLE = "CIRCLE",
  POLYLINE = "POLYLINE",
  RECT = "RECT",
}

interface EGraphicsDrawCommand {
  type: EGraphicsDrawCommandType;
}

export interface EGraphicsArcDrawCommand extends EGraphicsDrawCommand {
  type: EGraphicsDrawCommandType.ARC;
  x: number;
  y: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  color: EColor;
}

export interface EGraphicsCircleDrawCommand extends EGraphicsDrawCommand {
  type: EGraphicsDrawCommandType.CIRCLE;
  x: number;
  y: number;
  radius: number;
  color: EColor;
}

export interface EGraphicsPolylineDrawCommand extends EGraphicsDrawCommand {
  type: EGraphicsDrawCommandType.POLYLINE;
  points: [number, number][];
  color: EColor;
  lineWidth: number;
}

export interface EGraphicsRectDrawCommand extends EGraphicsDrawCommand {
  type: EGraphicsDrawCommandType.RECT;
  x: number;
  y: number;
  width: number;
  height: number;
  color: EColor;
}

export type EAnyGraphicsDrawCommand =
  | EGraphicsArcDrawCommand
  | EGraphicsCircleDrawCommand
  | EGraphicsPolylineDrawCommand
  | EGraphicsRectDrawCommand;

export interface ETextChunk {
  text: string;
  style: {
    color: EColor;
    align: ETextAlign;
    font: UUID;
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
