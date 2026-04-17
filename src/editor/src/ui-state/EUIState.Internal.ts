import type { UUID } from "../document/types.misc";

export interface EUIDebugState {
  showAspect: boolean;
  showHeight: boolean;
  showWidth: boolean;
  showHorizontalDistance: boolean;
  showHorizontalInterpolation: boolean;
  showVerticalDistance: boolean;
  showVerticalInterpolation: boolean;
}

export interface EUIStateData {
  activeLayer?: UUID;
  debug: EUIDebugState;
}
