import type { ELayerUUID } from "./types.misc";

export interface ELayerDebug {
  layer: ELayerUUID;
  showAspect: boolean;
  showHeight: boolean;
  showWidth: boolean;
  showHorizontalDistance: boolean;
  showHorizontalInterpolation: boolean;
  showVerticalDistance: boolean;
  showVerticalInterpolation: boolean;
}
