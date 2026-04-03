import type { UIGraphics } from "laymur";
import {
  UIProgressMaskFunctionCircular,
  UIProgressMaskFunctionDirectional,
  UIResizePolicyCover,
  UIResizePolicyCross,
  UIResizePolicyCrossInverted,
  UIResizePolicyFit,
  UIResizePolicyFixedHeight,
  UIResizePolicyFixedWidth,
  UIResizePolicyNone,
} from "laymur";
import { Texture, TextureLoader } from "three";
import type { EGrapicsDrawCommand } from "../EBridge/EBridge.Types";
import { EProgressMaskFunction, EResizePolicyType } from "../EBridge/EBridge.Types";
import type { AssetType, LayerContext, UIConstraint, UIElement } from "./EPreview.Types";

export const LAYER_DATABASE = new Map<string, LayerContext>();
export const ASSET_DATABASE = new Map<string, Texture | FontFace>();

let LAYER_ACTIVE: LayerContext | null = null;

const TEXTURE_LOADER = new TextureLoader();

export function loadTexture(url: string): Promise<Texture> {
  return TEXTURE_LOADER.loadAsync(url);
}

export function setLayerContextActive(uuid: string, isActive: boolean): void {
  LAYER_ACTIVE = isActive ? resolveLayerContext(uuid) : null;
}

export function getLayerContextActive(): LayerContext | null {
  return LAYER_ACTIVE;
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

export function resolveLayerContext(uuid: string): LayerContext {
  const layerData = LAYER_DATABASE.get(uuid);
  if (!layerData) {
    throw new Error(`Layer data not found: ${uuid}`);
  }
  return layerData;
}

export function resolveElement(uuidOwner: string, uuid: string): UIElement {
  const layerData = resolveLayerContext(uuidOwner);
  const element = layerData.elements.get(uuid);
  if (!element) {
    throw new Error(`Element not found: ${uuid}`);
  }
  return element;
}

export function resolveConstraint(uuidOwner: string, uuid: string): UIConstraint {
  const layerData = resolveLayerContext(uuidOwner);
  const constraint = layerData.constraints.get(uuid);
  if (!constraint) {
    throw new Error(`Constraint not found: ${uuid}`);
  }
  return constraint;
}

export function resolveAsset(uuid: string): AssetType {
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

export function applyDrawSequence(graphics: UIGraphics, drawSequence: EGrapicsDrawCommand[]): void {
  graphics.clear();

  for (const drawCommand of drawSequence) {
    if ("points" in drawCommand) {
      graphics.drawPolyline(drawCommand.points, drawCommand.color, drawCommand.lineWidth);
    } else if ("startAngle" in drawCommand) {
      graphics.drawArc(
        drawCommand.x,
        drawCommand.y,
        drawCommand.radius,
        drawCommand.startAngle,
        drawCommand.endAngle,
        drawCommand.color,
      );
    } else if ("radius" in drawCommand) {
      graphics.drawCircle(drawCommand.x, drawCommand.y, drawCommand.radius, drawCommand.color);
    } else if (
      "x" in drawCommand &&
      "y" in drawCommand &&
      "width" in drawCommand &&
      "height" in drawCommand
    ) {
      graphics.drawRect(
        drawCommand.x,
        drawCommand.y,
        drawCommand.width,
        drawCommand.height,
        drawCommand.color,
      );
    }
  }
}
