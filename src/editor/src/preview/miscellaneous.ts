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
import type { EAnyAsset } from "../document/types.assets";
import { EAssetType } from "../document/types.assets";
import type { EAnyGraphicsDrawCommand, EColor, ETextChunk } from "../document/types.misc";
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
import type { EAssetRawDataType, UIAnyConstraint, UIAnyElement, UILayerContext } from "./types";

export const LAYER_DATABASE = new Map<string, UILayerContext>();
export const ASSET_DATABASE = new Map<string, EAssetRawDataType>();

let LAYER_ACTIVE: UILayerContext | undefined;

const TEXTURE_LOADER = new TextureLoader();

export async function loadTexture(dataURL: string): Promise<Texture> {
  return new Promise((resolve) => {
    TEXTURE_LOADER.load(dataURL, (texture) => {
      texture.colorSpace = SRGBColorSpace;
      resolve(texture);
    });
  });
}

export function setLayerContextActive(uuid: string, isActive: boolean): void {
  LAYER_ACTIVE = isActive ? resolveLayerContext(uuid) : undefined;
}

export function resetLayerContextActive(): void {
  LAYER_ACTIVE = undefined;
}

export function getLayerContextActive(): UILayerContext | undefined {
  return LAYER_ACTIVE;
}

export function isLayerContextActive(uuid: string): boolean {
  return LAYER_ACTIVE === LAYER_DATABASE.get(uuid);
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

export function buildCSSColor(eColor: EColor): string {
  const alphaHex = Math.round(eColor.alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${eColor.color}${alphaHex}`;
}

export function buildMaskFunction(
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

export function resolveLayerContext(uuid: string): UILayerContext {
  const layerData = LAYER_DATABASE.get(uuid);
  if (!layerData) {
    throw new Error(`Layer not found: ${uuid}`);
  }
  return layerData;
}

export function resolveElement(uuidOwner: string, uuid: string): UIAnyElement {
  const element = resolveLayerContext(uuidOwner).elements.get(uuid);
  if (!element) {
    throw new Error(`Element not found: ${uuid}`);
  }
  return element;
}

export function resolveConstraint(uuidOwner: string, uuid: string): UIAnyConstraint {
  const constraint = resolveLayerContext(uuidOwner).constraints.get(uuid);
  if (!constraint) {
    throw new Error(`Constraint not found: ${uuid}`);
  }
  return constraint;
}

export function resolveAsset(uuid: string): EAssetRawDataType {
  const asset = ASSET_DATABASE.get(uuid);
  if (!asset) {
    throw new Error(`Asset not found: ${uuid}`);
  }
  return asset;
}

export function resolveTextureAsset(uuid: string): Texture {
  const asset = resolveAsset(uuid);
  if (!(asset instanceof Texture)) {
    throw new Error(`Asset is not a texture: ${uuid}`);
  }
  return asset;
}

export function resolveFontAsset(uuid: string): FontFace {
  const asset = resolveAsset(uuid);
  if (!(asset instanceof FontFace)) {
    throw new Error(`Asset is not a font: ${uuid}`);
  }
  return asset;
}

export function ensureUniqueElement(uuid: string): void {
  for (const { elements } of LAYER_DATABASE.values()) {
    if (elements.has(uuid)) {
      throw new Error(`Element already exists: ${uuid}`);
    }
  }
}

export function ensureUniqueConstraint(uuid: string): void {
  for (const { constraints } of LAYER_DATABASE.values()) {
    if (constraints.has(uuid)) {
      throw new Error(`Constraint already exists: ${uuid}`);
    }
  }
}

export function ensureUniqueAsset(uuid: string): void {
  if (ASSET_DATABASE.has(uuid)) {
    throw new Error(`Asset already exists: ${uuid}`);
  }
}

export function findLayerUuidForElement(elementUuid: string): string {
  for (const [layerUuid, ctx] of LAYER_DATABASE.entries()) {
    if (ctx.elements.has(elementUuid)) {
      return layerUuid;
    }
  }
  throw new Error(`Element not found in any layer: ${elementUuid}`);
}

export function findLayerUuidForConstraint(constraintUuid: string): string {
  for (const [layerUuid, ctx] of LAYER_DATABASE.entries()) {
    if (ctx.constraints.has(constraintUuid)) {
      return layerUuid;
    }
  }
  throw new Error(`Constraint not found in any layer: ${constraintUuid}`);
}

export function applyDrawSequence(
  graphics: UIGraphics,
  drawSequence: EAnyGraphicsDrawCommand[],
): void {
  graphics.clear();

  for (const cmd of drawSequence) {
    switch (cmd.type) {
      case EGraphicsDrawCommandType.POLYLINE:
        graphics.drawPolyline(cmd.points, buildCSSColor(cmd.color), cmd.lineWidth);
        break;
      case EGraphicsDrawCommandType.ARC:
        graphics.drawArc(
          cmd.x,
          cmd.y,
          cmd.radius,
          cmd.startAngle,
          cmd.endAngle,
          buildCSSColor(cmd.color),
        );
        break;
      case EGraphicsDrawCommandType.CIRCLE:
        graphics.drawCircle(cmd.x, cmd.y, cmd.radius, buildCSSColor(cmd.color));
        break;
      case EGraphicsDrawCommandType.RECT:
        graphics.drawRect(cmd.x, cmd.y, cmd.width, cmd.height, buildCSSColor(cmd.color));
        break;
    }
  }
}

export function buildLoopMode(loopMode: EAnimatedImageLoopMode): UIAnimatedImageLoopMode {
  switch (loopMode) {
    case EAnimatedImageLoopMode.NONE:
      return UIAnimatedImageLoopMode.NONE;
    case EAnimatedImageLoopMode.LOOP:
      return UIAnimatedImageLoopMode.LOOP;
    case EAnimatedImageLoopMode.PING_PONG:
      return UIAnimatedImageLoopMode.PING_PONG;
  }
}

export function buildRegionMode(regionMode: ENineSliceRegionMode): UINineSliceRegionMode {
  switch (regionMode) {
    case ENineSliceRegionMode.NORMALIZED:
      return UINineSliceRegionMode.NORMALIZED;
    case ENineSliceRegionMode.WORLD:
      return UINineSliceRegionMode.WORLD;
  }
}

export function buildUpdateMode(updateMode: ESceneUpdateMode): UISceneUpdateMode {
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

export function buildAlign(align: ETextAlign): "left" | "center" | "right" {
  switch (align) {
    case ETextAlign.LEFT:
      return "left";
    case ETextAlign.CENTER:
      return "center";
    case ETextAlign.RIGHT:
      return "right";
  }
}

export function buildFontStyle(style: ETextFontStyle): "normal" | "italic" | "oblique" {
  switch (style) {
    case ETextFontStyle.NORMAL:
      return "normal";
    case ETextFontStyle.ITALIC:
      return "italic";
    case ETextFontStyle.OBLIQUE:
      return "oblique";
  }
}

export function buildFontWeight(weight: ETextFontWeight): "normal" | "bold" | "bolder" | "lighter" {
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

interface TextContent {
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

export function buildTextContent(chunks: ETextChunk[]): TextContent[] {
  return chunks.map(({ text, style }): TextContent => {
    return {
      text,
      style: {
        color: style.color.color,
        align: buildAlign(style.align),
        fontFamily: resolveFontAsset(style.font).family,
        fontSize: style.fontSize,
        fontStyle: buildFontStyle(style.fontStyle),
        fontWeight: buildFontWeight(style.fontWeight),
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

export async function loadAsset(asset: EAnyAsset): Promise<void> {
  ensureUniqueAsset(asset.uuid);

  if (asset.type === EAssetType.FONT) {
    const fontFace = new FontFace(asset.name, `url(${asset.dataURL})`);
    await fontFace.load();
    document.fonts.add(fontFace);
    ASSET_DATABASE.set(asset.uuid, fontFace);
  } else {
    const texture = await loadTexture(asset.dataURL);
    ASSET_DATABASE.set(asset.uuid, texture);
  }
}
