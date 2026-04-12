import type { EResizePolicyType, UUID } from "./types.misc";

export enum ELayerType {
  FULLSCREEN = "FULLSCREEN",
}

interface ELayer {
  uuid: UUID;
  type: ELayerType;
  name: string;
}

export interface ELayerFullscreen extends ELayer {
  type: ELayerType.FULLSCREEN;
  resizePolicy: EResizePolicyType;
  resizePolicyParameters: [number, number];
}

export type EAnyLayer = ELayerFullscreen;
