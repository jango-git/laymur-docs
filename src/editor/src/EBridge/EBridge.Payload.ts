import type {
  EAnimatedImageLoopType,
  ENineSliceRegionMode,
  EProgressMaskFunction,
  EResizePolicyType,
  ESceneUpdateMode,
} from "./EBridge.Types";

export interface EMessagePayload {
  uuid: string;
  name: string;
}

export interface EMessageLayerComponentPayload extends EMessagePayload {
  uuidLayer: string;
}

// Layers
export interface EMessageLayerPayloadLayerFullscreen extends EMessagePayload {
  resizePolicy: EResizePolicyType;
  parameters: [number, number];
}

// Elements
export interface EMessageElementPayloadAnimatedImage extends EMessageLayerComponentPayload {
  color: string; // rrggbbaa
  sequence: string[]; // image asset UUID
  frameRate: number;
  timeScale: number;
  loopMode: EAnimatedImageLoopType;
}

export interface EMessageElementPayloadGraphics extends EMessageLayerComponentPayload {
  color: string; // rrggbbaa
  drawSequence: (
    | { x: number; y: number; width: number; height: number; color: string }
    | { x: number; y: number; radius: number; color: string }
    | { x: number; y: number; radius: number; startAngle: number; endAngle: number; color: string }
    | { points: [number, number][]; color: string; lineWidth: number }
  )[];
}

export interface EMessageElementPayloadImage extends EMessageLayerComponentPayload {
  color: string; // rrggbbaa
  texture: string; // image asset UUID
}

export interface EMessageElementPayloadNineSlice extends EMessageLayerComponentPayload {
  color: string; // rrggbbaa
  texture: string; // image asset UUID
  sliceBorders: [number, number, number, number];
  sliceRegions: [number, number, number, number];
  regionMode: ENineSliceRegionMode;
}

export interface EMessageElementPayloadProgress extends EMessageLayerComponentPayload {
  color: string; // rrggbbaa
  texture: string; // image asset UUID
  maskFunction: EProgressMaskFunction;
  progress: number;
}

export interface EMessageElementPayloadScene extends EMessageLayerComponentPayload {
  color: string; // rrggbbaa
  updateMode: ESceneUpdateMode;
  resolutionFactor: number;
  clearColor: string; // rrggbbaa
  enableDepthBuffer: boolean;
}

export interface EMessageElementPayloadText extends EMessageLayerComponentPayload {
  color: string; // rrggbbaa
  content: {
    text: string;
    color: string; // rrggbbaa
    align: "LEFT" | "CENTER" | "RIGHT";
    fontFamily: string;
    fontSize: number;
    fontStyle: "NORMAL" | "ITALIC" | "OBLIQUE";
    fontWeight: "NORMAL" | "BOLD" | "BOLDER" | "LIGHTER";
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
  resizeMode: "BREAK" | "SCALE";
  maxLineWidth: number;
}

// Constraints
export interface EMessageConstraintPayloadAspect extends EMessageLayerComponentPayload {
  aspect: number;
}

export interface EMessageConstraintPayloadDistance extends EMessageLayerComponentPayload {
  anchorA: number;
  anchorB: number;
  distance: number;
}

export interface EMessageConstraintPayloadProportion extends EMessageLayerComponentPayload {
  anchorA: number;
  anchorB: number;
  proportion: number;
}

export interface EMessageConstraintPayloadSize extends EMessageLayerComponentPayload {
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
