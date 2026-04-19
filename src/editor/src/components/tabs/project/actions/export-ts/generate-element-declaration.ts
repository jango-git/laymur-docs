import type { EAnyElement } from "../../../../../document/types.elements";
import { EElementType } from "../../../../../document/types.elements";
import type { EAssetUUID } from "../../../../../document/types.misc";

export function generateElementDeclaration(
  name: string,
  element: EAnyElement,
  assetMap: Map<string, string>,
): { code: string; imports: string[] } {
  const assetRef = (uuid: EAssetUUID): string => {
    const assetName = assetMap.get(uuid);
    return assetName !== undefined ? `/* TODO: ${assetName} */` : `/* TODO: unknown asset */`;
  };

  switch (element.type) {
    case EElementType.IMAGE:
      return {
        code: `private readonly ${name} = new UIImage(this, ${assetRef(element.texture)});`,
        imports: ["UIImage"],
      };
    case EElementType.ANIMATED_IMAGE:
      return {
        code: `private readonly ${name} = new UIAnimatedImage(this, /* TODO: frames */);`,
        imports: ["UIAnimatedImage"],
      };
    case EElementType.NINE_SLICE:
      return {
        code: `private readonly ${name} = new UINineSlice(this, ${assetRef(element.texture)}, [${element.sliceBorders.join(", ")}]);`,
        imports: ["UINineSlice"],
      };
    case EElementType.PROGRESS:
      return {
        code: `private readonly ${name} = new UIProgress(this, ${assetRef(element.texture)});`,
        imports: ["UIProgress"],
      };
    case EElementType.SCENE:
      return {
        code: `private readonly ${name} = new UIScene(this);`,
        imports: ["UIScene"],
      };
    case EElementType.TEXT:
      return {
        code: `private readonly ${name} = new UIText(this, /* TODO: content */);`,
        imports: ["UIText"],
      };
    case EElementType.GRAPHICS:
      return {
        code: `private readonly ${name} = new UIGraphics(this, [${element.resolution.join(", ")}]);`,
        imports: ["UIGraphics"],
      };
  }
}
