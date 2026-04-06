import type { ELayerUuid, EResizePolicyType } from "./types.misc";

export enum ELayerType {
  FULLSCREEN = "FULLSCREEN",
}

interface ELayer {
  uuid: ELayerUuid;
  type: ELayerType;
  name: string;
}

export interface ELayerFullscreen extends ELayer {
  type: ELayerType.FULLSCREEN;
  resizePolicy: EResizePolicyType;
  resizePolicyParameters: [number, number];
}

export type EAnyLayer = ELayerFullscreen;
