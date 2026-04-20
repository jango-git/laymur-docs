import type { ELayerFullscreen } from "../../../../../document/types.layers";
import { EResizePolicyType } from "../../../../../document/types.misc";

export function generateResizePolicyCode(layer: ELayerFullscreen): {
  code: string;
  import: string;
} {
  const [w, h] = layer.resizePolicyParameters;
  switch (layer.resizePolicy) {
    case EResizePolicyType.COVER:
      return { code: `new UIResizePolicyCover(${w}, ${h})`, import: "UIResizePolicyCover" };
    case EResizePolicyType.CROSS:
      return { code: `new UIResizePolicyCross(${w}, ${h})`, import: "UIResizePolicyCross" };
    case EResizePolicyType.CROSS_INVERTED:
      return {
        code: `new UIResizePolicyCrossInverted(${w}, ${h})`,
        import: "UIResizePolicyCrossInverted",
      };
    case EResizePolicyType.FIT:
      return { code: `new UIResizePolicyFit(${w}, ${h})`, import: "UIResizePolicyFit" };
    case EResizePolicyType.FIXED_HEIGHT:
      return {
        code: `new UIResizePolicyFixedHeight(${w}, ${h})`,
        import: "UIResizePolicyFixedHeight",
      };
    case EResizePolicyType.FIXED_WIDTH:
      return {
        code: `new UIResizePolicyFixedWidth(${w}, ${h})`,
        import: "UIResizePolicyFixedWidth",
      };
    case EResizePolicyType.NONE:
      return { code: `new UIResizePolicyNone()`, import: "UIResizePolicyNone" };
  }
}
