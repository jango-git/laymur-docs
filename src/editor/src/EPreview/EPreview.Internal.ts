import {
  UIResizePolicyCover,
  UIResizePolicyCross,
  UIResizePolicyCrossInverted,
  UIResizePolicyFit,
  UIResizePolicyFixedHeight,
  UIResizePolicyFixedWidth,
  UIResizePolicyNone,
} from "laymur";
import { Texture, TextureLoader } from "three";
import { EResizePolicyType } from "../EBridge/EBridge.Types";
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

export function resolveLayerContext(uuid: string): LayerContext {
  const layerData = LAYER_DATABASE.get(uuid);
  if (!layerData) {
    throw new Error(`Layer data not found: ${uuid}`);
  }
  return layerData;
}

export function resolveUIElement(uuidLayer: string, uuidElement: string): UIElement {
  const layerData = resolveLayerContext(uuidLayer);
  const element = layerData.elements.get(uuidElement);
  if (!element) {
    throw new Error(`Element not found: ${uuidElement}`);
  }
  return element;
}

export function resolveUIConstraint(uuidLayer: string, uuidConstraint: string): UIConstraint {
  const layerData = resolveLayerContext(uuidLayer);
  const constraint = layerData.constraints.get(uuidConstraint);
  if (!constraint) {
    throw new Error(`Constraint not found: ${uuidConstraint}`);
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
