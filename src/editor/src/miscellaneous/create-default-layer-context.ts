import type { ELayerContext } from "../document/types";
import { ELayerType } from "../document/types.layers";
import { EResizePolicyType } from "../document/types.misc";

export function createDefaultLayerContext(): ELayerContext {
  return {
    layer: {
      uuid: crypto.randomUUID(),
      type: ELayerType.FULLSCREEN,
      name: "GameplayLayer",
      resizePolicy: EResizePolicyType.FIXED_HEIGHT,
      resizePolicyParameters: [1080, 1920],
    },
    debug: {
      showAspect: false,
      showHeight: false,
      showWidth: false,
      showHorizontalDistance: false,
      showHorizontalInterpolation: false,
      showVerticalDistance: false,
      showVerticalInterpolation: false,
    },
    elements: [],
    constraints: [],
  };
}
