import type {
  EAnimatedImageLoopType,
  EGrapicsDrawCommand,
  ENineSliceRegionMode,
  EProgressMaskFunction,
  EResizePolicyType,
  ESceneUpdateMode,
  ETextAlign,
  ETextFontStyle,
  ETextFontWeight,
  ETextResizeMode,
} from "./EBridge.Types";

export interface EMessagePayload {
  uuid: string;
  name: string;
  uuidOwner: string;
}

// Layers
export interface EMessageLayerPayloadLayerFullscreen extends Omit<EMessagePayload, "uuidOwner"> {
  resizePolicy: EResizePolicyType;
  parameters: [number, number];
}

// Elements
export interface EMessageElementPayloadAnimatedImage extends EMessagePayload {
  color: string; // rrggbbaa
  sequence: string[]; // image asset UUID
  frameRate: number;
  timeScale: number;
  loopMode: EAnimatedImageLoopType;
}

export interface EMessageElementPayloadGraphics extends EMessagePayload {
  color: string; // rrggbbaa
  drawSequence: EGrapicsDrawCommand[];
}

export interface EMessageElementPayloadImage extends EMessagePayload {
  color: string; // rrggbbaa
  texture: string; // image asset UUID
}

export interface EMessageElementPayloadNineSlice extends EMessagePayload {
  color: string; // rrggbbaa
  texture: string; // image asset UUID
  sliceBorders: [number, number, number, number];
  sliceRegions: [number, number, number, number];
  regionMode: ENineSliceRegionMode;
}

export interface EMessageElementPayloadProgress extends EMessagePayload {
  color: string; // rrggbbaa
  texture: string; // image asset UUID
  maskFunction: EProgressMaskFunction;
  progress: number;
}

export interface EMessageElementPayloadScene extends EMessagePayload {
  color: string; // rrggbbaa
  updateMode: ESceneUpdateMode;
  resolutionFactor: number;
  clearColor: string; // rrggbbaa
}

export interface EMessageElementPayloadText extends EMessagePayload {
  color: string; // rrggbbaa
  content: {
    text: string;
    color: string; // rrggbbaa
    align: ETextAlign;
    fontFamily: string;
    fontSize: number;
    fontStyle: ETextFontStyle;
    fontWeight: ETextFontWeight;
    lineHeight: number;
    enableShadow: boolean;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowBlur: number;
    shadowColor: string; // rrggbbaa
    enableStroke: boolean;
    strokeColor: string; // rrggbbaa
    strokeThickness: number;
  }[];
  resizeMode: ETextResizeMode;
  maxLineWidth: number;
}

// Constraints
export interface EMessageConstraintPayloadAspect extends EMessagePayload {
  aspect: number;
}

export interface EMessageConstraintPayloadDistance extends EMessagePayload {
  anchorA: number;
  anchorB: number;
  distance: number;
}

export interface EMessageConstraintPayloadProportion extends EMessagePayload {
  proportion: number;
}

export interface EMessageConstraintPayloadSize extends EMessagePayload {
  size: number;
}

export interface EMessageAssetPayloadFont {
  uuid: string;
  dataURL: string;
  fontFamily: string;
}

export interface EMessageAssetPayloadImage {
  uuid: string;
  dataURL: string;
}
