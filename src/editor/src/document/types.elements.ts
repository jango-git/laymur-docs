import type {
  EAnimatedImageLoopMode,
  EAnyGraphicsDrawCommand,
  EAssetUuid,
  EColor,
  EElementUuid,
  ENineSliceRegionMode,
  EProgressMaskFunction,
  ESceneUpdateMode,
  ETextChunk,
  ETextResizeMode,
} from "./types.misc";

export enum EElementType {
  ANIMATED_IMAGE = "ANIMATED_IMAGE",
  GRAPHICS = "GRAPHICS",
  IMAGE = "IMAGE",
  NINE_SLICE = "NINE_SLICE",
  PROGRESS = "PROGRESS",
  SCENE = "SCENE",
  TEXT = "TEXT",
}

interface EElement {
  uuid: EElementUuid;
  type: EElementType;
  name: string;
  color: EColor;
}

export interface EAnimatedImageElement extends EElement {
  type: EElementType.ANIMATED_IMAGE;
  sequence: EAssetUuid[];
  frameRate: number;
  timeScale: number;
  loopMode: EAnimatedImageLoopMode;
  playByDefault: boolean;
}

export interface EGraphicsElement extends EElement {
  type: EElementType.GRAPHICS;
  resolution: [number, number];
  drawSequence: EAnyGraphicsDrawCommand[];
}

export interface EImageElement extends EElement {
  type: EElementType.IMAGE;
  texture: EAssetUuid;
}

export interface ENineSliceElement extends EElement {
  type: EElementType.NINE_SLICE;
  texture: EAssetUuid;
  sliceBorders: [number, number, number, number];
  sliceRegions: [number, number, number, number];
  regionMode: ENineSliceRegionMode;
}

export interface EProgressElement extends EElement {
  type: EElementType.PROGRESS;
  texture: EAssetUuid;
  maskFunction: EProgressMaskFunction;
  progress: number;
}

export interface ESceneElement extends EElement {
  type: EElementType.SCENE;
  updateMode: ESceneUpdateMode;
  resolutionFactor: number;
  clearColor: EColor;
  enableDepthBuffer: boolean;
}

export interface ETextElement extends EElement {
  type: EElementType.TEXT;
  content: ETextChunk[];
  resizeMode: ETextResizeMode;
  maxLineWidth: number;
}

export type EAnyElement =
  | EAnimatedImageElement
  | EGraphicsElement
  | EImageElement
  | ENineSliceElement
  | EProgressElement
  | ESceneElement
  | ETextElement;
