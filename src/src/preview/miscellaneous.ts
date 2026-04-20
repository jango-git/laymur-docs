import type { UIGraphics } from "laymur";
import {
  UIAnimatedImageLoopMode,
  UINineSliceRegionMode,
  UIProgressMaskFunctionCircular,
  UIProgressMaskFunctionDirectional,
  UIResizePolicyCover,
  UIResizePolicyCross,
  UIResizePolicyCrossInverted,
  UIResizePolicyFit,
  UIResizePolicyFixedHeight,
  UIResizePolicyFixedWidth,
  UIResizePolicyNone,
  UISceneUpdateMode,
  UITextResizeMode,
} from "laymur";
import { SRGBColorSpace, Texture, TextureLoader } from "three";
import type {
  EAnyGraphicsDrawCommand,
  EAssetUUID,
  EColor,
  EConstraintUUID,
  EElementUUID,
  ELayerUUID,
  ETextChunk,
} from "../document/types.misc";
import {
  EAnimatedImageLoopMode,
  EGraphicsDrawCommandType,
  ENineSliceRegionMode,
  EProgressMaskFunction,
  EResizePolicyType,
  ESceneUpdateMode,
  ETextAlign,
  ETextFontStyle,
  ETextFontWeight,
  ETextResizeMode,
} from "../document/types.misc";
import type {
  EAnyUIConstraint,
  EAnyUIElement,
  EAssetDataType,
  EPreviewLayerContext,
} from "./types";

export const LAYER_DATABASE = new Map<ELayerUUID, EPreviewLayerContext>();
export const ASSET_DATABASE = new Map<EAssetUUID, EAssetDataType>();

let LAYER_ACTIVE: EPreviewLayerContext | undefined;

const TEXTURE_LOADER = new TextureLoader();

export async function loadTexture(dataURL: string): Promise<Texture> {
  return new Promise((resolve) => {
    TEXTURE_LOADER.load(
      dataURL,
      (texture) => {
        texture.colorSpace = SRGBColorSpace;
        resolve(texture);
      },
      undefined,
      (error) => {
        throw new Error(`Failed to load texture: ${error}`);
      },
    );
  });
}

export function setLayerContextActive(uuid: ELayerUUID, isActive: boolean): void {
  LAYER_ACTIVE = isActive ? resolveLayerContext(uuid) : undefined;
}

export function resetLayerContextActive(): void {
  LAYER_ACTIVE = undefined;
}

export function getLayerContextActive(): EPreviewLayerContext | undefined {
  return LAYER_ACTIVE;
}

export function isLayerContextActive(uuid: ELayerUUID): boolean {
  return LAYER_ACTIVE === LAYER_DATABASE.get(uuid);
}

export function resolveLayerContext(uuid: ELayerUUID): EPreviewLayerContext {
  const layerData = LAYER_DATABASE.get(uuid);
  if (!layerData) {
    throw new Error(`Layer not found: ${uuid}`);
  }
  return layerData;
}

export function resolveElement(layerUuid: ELayerUUID, uuid: EElementUUID): EAnyUIElement {
  const element = resolveLayerContext(layerUuid).elements.get(uuid);
  if (!element) {
    throw new Error(`Element not found: ${uuid}`);
  }
  return element;
}

export function resolveConstraint(layerUuid: ELayerUUID, uuid: EConstraintUUID): EAnyUIConstraint {
  const constraint = resolveLayerContext(layerUuid).constraints.get(uuid);
  if (!constraint) {
    throw new Error(`Constraint not found: ${uuid}`);
  }
  return constraint;
}

export function resolveAsset(uuid: EAssetUUID): EAssetDataType {
  const asset = ASSET_DATABASE.get(uuid);
  if (!asset) {
    throw new Error(`Asset not found: ${uuid}`);
  }
  return asset;
}

export function resolveTextureAsset(uuid: EAssetUUID): Texture {
  const asset = resolveAsset(uuid);
  if (!(asset instanceof Texture)) {
    throw new Error(`Asset is not a texture: ${uuid}`);
  }
  return asset;
}

export function resolveFontAsset(uuid: EAssetUUID): FontFace {
  const asset = resolveAsset(uuid);
  if (!(asset instanceof FontFace)) {
    throw new Error(`Asset is not a font: ${uuid}`);
  }
  return asset;
}

export function ensureUniqueAsset(uuid: EAssetUUID): void {
  if (ASSET_DATABASE.has(uuid)) {
    throw new Error(`Asset already exists: ${uuid}`);
  }
}

export function ensureUniqueElement(uuid: EElementUUID): void {
  for (const { elements } of LAYER_DATABASE.values()) {
    if (elements.has(uuid)) {
      throw new Error(`Element already exists: ${uuid}`);
    }
  }
}

export function ensureUniqueConstraint(uuid: EConstraintUUID): void {
  for (const { constraints } of LAYER_DATABASE.values()) {
    if (constraints.has(uuid)) {
      throw new Error(`Constraint already exists: ${uuid}`);
    }
  }
}

export function findLayerUuidForElement(elementUuid: EElementUUID): ELayerUUID {
  for (const [layerUuid, layerContext] of LAYER_DATABASE.entries()) {
    if (layerContext.elements.has(elementUuid)) {
      return layerUuid;
    }
  }
  throw new Error(`Element not found in any layer: ${elementUuid}`);
}

export function findLayerUuidForConstraint(constraintUuid: EConstraintUUID): ELayerUUID {
  for (const [layerUuid, layerContext] of LAYER_DATABASE.entries()) {
    if (layerContext.constraints.has(constraintUuid)) {
      return layerUuid;
    }
  }
  throw new Error(`Constraint not found in any layer: ${constraintUuid}`);
}

export function buildCSSColor(eColor: EColor): string {
  const alphaHex = Math.round(eColor.alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${eColor.color}${alphaHex}`;
}

export function buildResizePolicy(
  type: EResizePolicyType,
  parameters: [number, number],
):
  | UIResizePolicyCover
  | UIResizePolicyCross
  | UIResizePolicyCrossInverted
  | UIResizePolicyFit
  | UIResizePolicyFixedHeight
  | UIResizePolicyFixedWidth
  | UIResizePolicyNone {
  switch (type) {
    case EResizePolicyType.COVER:
      return new UIResizePolicyCover(...parameters);
    case EResizePolicyType.FIT:
      return new UIResizePolicyFit(...parameters);
    case EResizePolicyType.CROSS:
      return new UIResizePolicyCross(...parameters);
    case EResizePolicyType.CROSS_INVERTED:
      return new UIResizePolicyCrossInverted(...parameters);
    case EResizePolicyType.FIXED_WIDTH:
      return new UIResizePolicyFixedWidth(...parameters);
    case EResizePolicyType.FIXED_HEIGHT:
      return new UIResizePolicyFixedHeight(...parameters);
    case EResizePolicyType.NONE:
    default:
      return new UIResizePolicyNone();
  }
}

export function buildProgressMaskFunction(
  maskFunction: EProgressMaskFunction,
): UIProgressMaskFunctionCircular | UIProgressMaskFunctionDirectional {
  switch (maskFunction) {
    case EProgressMaskFunction.CIRCULAR:
      return new UIProgressMaskFunctionCircular();
    case EProgressMaskFunction.DIRECTIONAL:
      return new UIProgressMaskFunctionDirectional();
    default:
      throw new Error(`Unknown mask function: ${maskFunction}`);
  }
}

export function applyGraphicsDrawSequence(
  graphics: UIGraphics,
  drawSequence: EAnyGraphicsDrawCommand[],
): void {
  graphics.clear();

  for (const command of drawSequence) {
    switch (command.type) {
      case EGraphicsDrawCommandType.POLYLINE:
        graphics.drawPolyline(command.points, buildCSSColor(command.color), command.lineWidth);
        break;
      case EGraphicsDrawCommandType.ARC:
        graphics.drawArc(
          command.x,
          command.y,
          command.radius,
          command.startAngle,
          command.endAngle,
          buildCSSColor(command.color),
        );
        break;
      case EGraphicsDrawCommandType.CIRCLE:
        graphics.drawCircle(command.x, command.y, command.radius, buildCSSColor(command.color));
        break;
      case EGraphicsDrawCommandType.RECT:
        graphics.drawRect(
          command.x,
          command.y,
          command.width,
          command.height,
          buildCSSColor(command.color),
        );
        break;
    }
  }
}

export function buildAnimateImageLoopMode(
  loopMode: EAnimatedImageLoopMode,
): UIAnimatedImageLoopMode {
  switch (loopMode) {
    case EAnimatedImageLoopMode.NONE:
      return UIAnimatedImageLoopMode.NONE;
    case EAnimatedImageLoopMode.LOOP:
      return UIAnimatedImageLoopMode.LOOP;
    case EAnimatedImageLoopMode.PING_PONG:
      return UIAnimatedImageLoopMode.PING_PONG;
  }
}

export function buildNineSliceRegionMode(regionMode: ENineSliceRegionMode): UINineSliceRegionMode {
  switch (regionMode) {
    case ENineSliceRegionMode.NORMALIZED:
      return UINineSliceRegionMode.NORMALIZED;
    case ENineSliceRegionMode.WORLD:
      return UINineSliceRegionMode.WORLD;
  }
}

export function buildSceneUpdateMode(updateMode: ESceneUpdateMode): UISceneUpdateMode {
  switch (updateMode) {
    case ESceneUpdateMode.EVERY_FRAME:
      return UISceneUpdateMode.EVERY_FRAME;
    case ESceneUpdateMode.EVERY_SECOND_FRAME:
      return UISceneUpdateMode.EVERY_SECOND_FRAME;
    case ESceneUpdateMode.ON_PROPERTIES_CHANGE:
      return UISceneUpdateMode.ON_PROPERTIES_CHANGE;
    case ESceneUpdateMode.ON_DIMENSIONS_CHANGE:
      return UISceneUpdateMode.ON_DIMENSIONS_CHANGE;
    case ESceneUpdateMode.MANUAL:
      return UISceneUpdateMode.MANUAL;
  }
}

function buildTextAlign(align: ETextAlign): "left" | "center" | "right" {
  switch (align) {
    case ETextAlign.LEFT:
      return "left";
    case ETextAlign.CENTER:
      return "center";
    case ETextAlign.RIGHT:
      return "right";
  }
}

function buildTextFontStyle(style: ETextFontStyle): "normal" | "italic" | "oblique" {
  switch (style) {
    case ETextFontStyle.NORMAL:
      return "normal";
    case ETextFontStyle.ITALIC:
      return "italic";
    case ETextFontStyle.OBLIQUE:
      return "oblique";
  }
}

function buildTextFontWeight(weight: ETextFontWeight): "normal" | "bold" | "bolder" | "lighter" {
  switch (weight) {
    case ETextFontWeight.NORMAL:
      return "normal";
    case ETextFontWeight.BOLD:
      return "bold";
    case ETextFontWeight.BOLDER:
      return "bolder";
    case ETextFontWeight.LIGHTER:
      return "lighter";
  }
}

interface ETextContent {
  text: string;
  style: Partial<{
    color: string;
    align: "left" | "center" | "right";
    fontFamily: string;
    fontSize: number;
    fontStyle: "normal" | "italic" | "oblique";
    fontWeight: "normal" | "bold" | "bolder" | "lighter" | number;
    lineHeight: number;
    enableShadow: boolean;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowBlur: number;
    shadowColor: string;
    enableStroke: boolean;
    strokeColor: string;
    strokeThickness: number;
  }>;
}

export function buildTextContent(chunks: ETextChunk[]): ETextContent[] {
  return chunks.map(({ text, style }): ETextContent => {
    return {
      text,
      style: {
        color: style.color.color,
        align: buildTextAlign(style.align),
        fontFamily: resolveFontAsset(style.font).family,
        fontSize: style.fontSize,
        fontStyle: buildTextFontStyle(style.fontStyle),
        fontWeight: buildTextFontWeight(style.fontWeight),
        lineHeight: style.lineHeight,
        enableShadow: style.enableShadow,
        shadowOffsetX: style.shadowOffsetX,
        shadowOffsetY: style.shadowOffsetY,
        shadowBlur: style.shadowBlur,
        shadowColor: style.shadowColor.color,
        enableStroke: style.enableStroke,
        strokeColor: style.strokeColor.color,
        strokeThickness: style.strokeThickness,
      },
    };
  });
}

export function buildTextResizeMode(resizeMode: ETextResizeMode): UITextResizeMode {
  switch (resizeMode) {
    case ETextResizeMode.SCALE:
      return UITextResizeMode.SCALE;
    case ETextResizeMode.BREAK:
      return UITextResizeMode.BREAK;
  }
}
