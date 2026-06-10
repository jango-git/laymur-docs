import type { EAnyElement } from "../../../../../document/types.elements";
import { EElementType } from "../../../../../document/types.elements";
import type { EAnyGraphicsDrawCommand, EAssetUUID } from "../../../../../document/types.misc";
import { EGraphicsDrawCommandType, EProgressMaskFunction } from "../../../../../document/types.misc";
import { generateTextContent } from "./generate-text-content";
import { assetPlaceholder, cssColorLiteral, stringLiteral } from "./serialize";

interface ElementCode {
  // The class field declaration, e.g. `private readonly icon = new UIImage(...);`
  field: string;
  imports: string[];
  // Constructor-body statements that operate on the element after it is built
  // (currently only UIGraphics draw commands).
  statements: string[];
}

export function generateElementDeclaration(
  name: string,
  element: EAnyElement,
  assetMap: Map<string, string>,
  fieldModifier: string,
): ElementCode {
  const tex = (uuid: EAssetUUID): string => assetPlaceholder(assetMap.get(uuid));
  const field = (expression: string): string => `${fieldModifier}${name} = ${expression};`;
  const color = cssColorLiteral(element.color);
  const elName = stringLiteral(element.name);

  switch (element.type) {
    case EElementType.IMAGE:
      return {
        field: field(
          `new UIImage(this, ${tex(element.texture)}, { color: ${color}, name: ${elName} })`,
        ),
        imports: ["UIImage"],
        statements: [],
      };
    case EElementType.ANIMATED_IMAGE: {
      const sequence = element.sequence.map((uuid) => tex(uuid)).join(", ");
      return {
        field: field(
          `new UIAnimatedImage(this, [${sequence}], { name: ${elName}, color: ${color}, frameRate: ${element.frameRate}, timeScale: ${element.timeScale}, loopMode: UIAnimatedImageLoopMode.${element.loopMode}, playByDefault: ${element.playByDefault} })`,
        ),
        imports: ["UIAnimatedImage", "UIAnimatedImageLoopMode"],
        statements: [],
      };
    }
    case EElementType.NINE_SLICE:
      return {
        field: field(
          `new UINineSlice(this, ${tex(element.texture)}, { color: ${color}, name: ${elName}, regionMode: UINineSliceRegionMode.${element.regionMode}, sliceBorders: [${element.sliceBorders.join(", ")}], sliceRegions: [${element.sliceRegions.join(", ")}] })`,
        ),
        imports: ["UINineSlice", "UINineSliceRegionMode"],
        statements: [],
      };
    case EElementType.PROGRESS: {
      const mask =
        element.maskFunction === EProgressMaskFunction.CIRCULAR
          ? "UIProgressMaskFunctionCircular"
          : "UIProgressMaskFunctionDirectional";
      return {
        field: field(
          `new UIProgress(this, ${tex(element.texture)}, { name: ${elName}, color: ${color}, maskFunction: new ${mask}(), progress: ${element.progress} })`,
        ),
        imports: ["UIProgress", mask],
        statements: [],
      };
    }
    case EElementType.SCENE:
      return {
        field: field(
          `new UIScene(this, { name: ${elName}, color: ${color}, clearColor: ${cssColorLiteral(element.clearColor)}, resolutionFactor: ${element.resolutionFactor}, updateMode: UISceneUpdateMode.${element.updateMode}, enableDepthBuffer: ${element.enableDepthBuffer} })`,
        ),
        imports: ["UIScene", "UISceneUpdateMode"],
        statements: [],
      };
    case EElementType.TEXT:
      return {
        field: field(
          `new UIText(this, ${generateTextContent(element.content, assetMap)}, { name: ${elName}, color: ${color}, maxLineWidth: ${element.maxLineWidth}, resizeMode: UITextResizeMode.${element.resizeMode} })`,
        ),
        imports: ["UIText", "UITextResizeMode"],
        statements: [],
      };
    case EElementType.GRAPHICS:
      return {
        field: field(
          `new UIGraphics(this, { width: ${element.resolution[0]}, height: ${element.resolution[1]}, color: ${color}, name: ${elName} })`,
        ),
        imports: ["UIGraphics"],
        statements: element.drawSequence.map((command) => graphicsStatement(name, command)),
      };
  }
}

function graphicsStatement(name: string, command: EAnyGraphicsDrawCommand): string {
  const color = cssColorLiteral(command.color);
  switch (command.type) {
    case EGraphicsDrawCommandType.POLYLINE: {
      const points = command.points.map(([x, y]) => `[${x}, ${y}]`).join(", ");
      return `this.${name}.drawPolyline([${points}], ${color}, ${command.lineWidth});`;
    }
    case EGraphicsDrawCommandType.ARC:
      return `this.${name}.drawArc(${command.x}, ${command.y}, ${command.radius}, ${command.startAngle}, ${command.endAngle}, ${color});`;
    case EGraphicsDrawCommandType.CIRCLE:
      return `this.${name}.drawCircle(${command.x}, ${command.y}, ${command.radius}, ${color});`;
    case EGraphicsDrawCommandType.RECT:
      return `this.${name}.drawRect(${command.x}, ${command.y}, ${command.width}, ${command.height}, ${color});`;
  }
}
