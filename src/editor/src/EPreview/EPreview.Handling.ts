import { UIAnimatedImage, UIFullscreenLayer, UIImage, UINineSlice } from "laymur";
import { UILayerDebug } from "laymur/debug";
import type {
  EMessage,
  EMessageAssetFontAdd,
  EMessageAssetFontUpdate,
  EMessageAssetImageAdd,
  EMessageAssetImageUpdate,
  EMessageAssetRemove,
  EMessageCommonReset,
  EMessageCommonSetTheme,
  EMessageConstraintAspectAdd,
  EMessageConstraintAspectUpdate,
  EMessageConstraintDistanceHorizontalAdd,
  EMessageConstraintDistanceHorizontalUpdate,
  EMessageConstraintDistanceVerticalAdd,
  EMessageConstraintDistanceVerticalUpdate,
  EMessageConstraintProportionHorizontalAdd,
  EMessageConstraintProportionHorizontalUpdate,
  EMessageConstraintProportionVerticalAdd,
  EMessageConstraintProportionVerticalUpdate,
  EMessageConstraintRemove,
  EMessageConstraintSizeHorizontalAdd,
  EMessageConstraintSizeHorizontalUpdate,
  EMessageConstraintSizeVerticalAdd,
  EMessageConstraintSizeVerticalUpdate,
  EMessageElementAnimatedImageAdd,
  EMessageElementAnimatedImageUpdate,
  EMessageElementGraphicsAdd,
  EMessageElementGraphicsUpdate,
  EMessageElementImageAdd,
  EMessageElementImageUpdate,
  EMessageElementNineSliceAdd,
  EMessageElementNineSliceUpdate,
  EMessageElementProgressAdd,
  EMessageElementProgressUpdate,
  EMessageElementRemove,
  EMessageElementSceneAdd,
  EMessageElementSceneUpdate,
  EMessageElementTextAdd,
  EMessageElementTextUpdate,
  EMessageLayerDebugUpdate,
  EMessageLayerFullscreenAdd,
  EMessageLayerFullscreenUpdate,
  EMessageLayerRemove,
  EMessageLayerSetActive,
} from "../EBridge/EBridge.Messages";
import { EMessageType } from "../EBridge/EBridge.Messages";
import {
  ASSET_DATABASE,
  buildResizePolicy,
  getLayerContextActive,
  LAYER_DATABASE,
  loadTexture,
  resolveFontAsset,
  resolveLayerContext,
  resolveTextureAsset,
  resolveUIElement,
  setLayerContextActive,
} from "./EPreview.Internal";

export function handleMessage(event: MessageEvent<EMessage>): void {
  const message = event.data;

  switch (message.type) {
    case EMessageType.LAYER_FULLSCREEN_ADD:
      layerFullscreenAdd(message as EMessageLayerFullscreenAdd);
      break;

    case EMessageType.LAYER_FULLSCREEN_UPDATE:
      layerFullscreenUpdate(message as EMessageLayerFullscreenUpdate);
      break;

    case EMessageType.LAYER_REMOVE:
      layerRemove(message as EMessageLayerRemove);
      break;

    case EMessageType.LAYER_DEBUG_UPDATE:
      layerDebugUpdate(message as EMessageLayerDebugUpdate);
      break;

    case EMessageType.LAYER_SET_ACTIVE:
      layerSetActive(message as EMessageLayerSetActive);
      break;

    case EMessageType.ELEMENT_ANIMATED_IMAGE_ADD:
      elementAnimatedImageAdd(message as EMessageElementAnimatedImageAdd);
      break;

    case EMessageType.ELEMENT_ANIMATED_IMAGE_UPDATE:
      elementAnimatedImageUpdate(message as EMessageElementAnimatedImageUpdate);
      break;

    case EMessageType.ELEMENT_GRAPHICS_ADD:
      elementGraphicsAdd(message as EMessageElementGraphicsAdd);
      break;

    case EMessageType.ELEMENT_GRAPHICS_UPDATE:
      elementGraphicsUpdate(message as EMessageElementGraphicsUpdate);
      break;

    case EMessageType.ELEMENT_IMAGE_ADD:
      elementImageAdd(message as EMessageElementImageAdd);
      break;

    case EMessageType.ELEMENT_IMAGE_UPDATE:
      elementImageUpdate(message as EMessageElementImageUpdate);
      break;

    case EMessageType.ELEMENT_NINE_SLICE_ADD:
      elementNineSliceAdd(message as EMessageElementNineSliceAdd);
      break;

    case EMessageType.ELEMENT_NINE_SLICE_UPDATE:
      elementNineSliceUpdate(message as EMessageElementNineSliceUpdate);
      break;

    case EMessageType.ELEMENT_PROGRESS_ADD:
      elementProgressAdd(message as EMessageElementProgressAdd);
      break;

    case EMessageType.ELEMENT_PROGRESS_UPDATE:
      elementProgressUpdate(message as EMessageElementProgressUpdate);
      break;

    case EMessageType.ELEMENT_SCENE_ADD:
      elementSceneAdd(message as EMessageElementSceneAdd);
      break;

    case EMessageType.ELEMENT_SCENE_UPDATE:
      elementSceneUpdate(message as EMessageElementSceneUpdate);
      break;

    case EMessageType.ELEMENT_TEXT_ADD:
      elementTextAdd(message as EMessageElementTextAdd);
      break;

    case EMessageType.ELEMENT_TEXT_UPDATE:
      elementTextUpdate(message as EMessageElementTextUpdate);
      break;

    case EMessageType.ELEMENT_REMOVE:
      elementRemove(message as EMessageElementRemove);
      break;

    case EMessageType.CONSTRAINT_ASPECT_ADD:
      constraintAspectAdd(message as EMessageConstraintAspectAdd);
      break;

    case EMessageType.CONSTRAINT_ASPECT_UPDATE:
      constraintAspectUpdate(message as EMessageConstraintAspectUpdate);
      break;

    case EMessageType.CONSTRAINT_DISTANCE_HORIZONTAL_ADD:
      constraintDistanceHorizontalAdd(message as EMessageConstraintDistanceHorizontalAdd);
      break;

    case EMessageType.CONSTRAINT_DISTANCE_HORIZONTAL_UPDATE:
      constraintDistanceHorizontalUpdate(message as EMessageConstraintDistanceHorizontalUpdate);
      break;

    case EMessageType.CONSTRAINT_DISTANCE_VERTICAL_ADD:
      constraintDistanceVerticalAdd(message as EMessageConstraintDistanceVerticalAdd);
      break;

    case EMessageType.CONSTRAINT_DISTANCE_VERTICAL_UPDATE:
      constraintDistanceVerticalUpdate(message as EMessageConstraintDistanceVerticalUpdate);
      break;

    case EMessageType.CONSTRAINT_PROPORTION_HORIZONTAL_ADD:
      constraintProportionHorizontalAdd(message as EMessageConstraintProportionHorizontalAdd);
      break;

    case EMessageType.CONSTRAINT_PROPORTION_HORIZONTAL_UPDATE:
      constraintProportionHorizontalUpdate(message as EMessageConstraintProportionHorizontalUpdate);
      break;

    case EMessageType.CONSTRAINT_PROPORTION_VERTICAL_ADD:
      constraintProportionVerticalAdd(message as EMessageConstraintProportionVerticalAdd);
      break;

    case EMessageType.CONSTRAINT_PROPORTION_VERTICAL_UPDATE:
      constraintProportionVerticalUpdate(message as EMessageConstraintProportionVerticalUpdate);
      break;

    case EMessageType.CONSTRAINT_SIZE_HORIZONTAL_ADD:
      constraintSizeHorizontalAdd(message as EMessageConstraintSizeHorizontalAdd);
      break;

    case EMessageType.CONSTRAINT_SIZE_HORIZONTAL_UPDATE:
      constraintSizeHorizontalUpdate(message as EMessageConstraintSizeHorizontalUpdate);
      break;

    case EMessageType.CONSTRAINT_SIZE_VERTICAL_ADD:
      constraintSizeVerticalAdd(message as EMessageConstraintSizeVerticalAdd);
      break;

    case EMessageType.CONSTRAINT_SIZE_VERTICAL_UPDATE:
      constraintSizeVerticalUpdate(message as EMessageConstraintSizeVerticalUpdate);
      break;

    case EMessageType.CONSTRAINT_REMOVE:
      constraintRemove(message as EMessageConstraintRemove);
      break;

    case EMessageType.ASSET_FONT_ADD:
      assetFontAdd(message as EMessageAssetFontAdd);
      break;

    case EMessageType.ASSET_FONT_UPDATE:
      assetFontUpdate(message as EMessageAssetFontUpdate);
      break;

    case EMessageType.ASSET_IMAGE_ADD:
      assetImageAdd(message as EMessageAssetImageAdd);
      break;

    case EMessageType.ASSET_IMAGE_UPDATE:
      assetImageUpdate(message as EMessageAssetImageUpdate);
      break;

    case EMessageType.ASSET_REMOVE:
      assetRemove(message as EMessageAssetRemove);
      break;

    case EMessageType.COMMON_SET_THEME:
      commonSetTheme(message as EMessageCommonSetTheme);
      break;

    case EMessageType.COMMON_RESET:
      commonReset(message as EMessageCommonReset);
      break;
  }
}

// Layers

function layerFullscreenAdd({
  uuid: uuid,
  name,
  resizePolicy,
  parameters,
}: Omit<EMessageLayerFullscreenAdd, "type">): void {
  const layer = new UIFullscreenLayer({
    name,
    resizePolicy: buildResizePolicy(resizePolicy, parameters),
  });

  LAYER_DATABASE.set(uuid, {
    layer,
    debug: new UILayerDebug(layer),
    constraints: new Map(),
    elements: new Map(),
  });
}

function layerFullscreenUpdate({
  uuid: uuid,
  name,
  resizePolicy,
  parameters,
}: Omit<EMessageLayerFullscreenUpdate, "type">): void {
  const layer = resolveLayerContext(uuid).layer;
  layer.name = name;
  layer.resizePolicy = buildResizePolicy(resizePolicy, parameters);
}

function layerRemove({ uuid }: Omit<EMessageLayerRemove, "type">): void {
  const layerContext = resolveLayerContext(uuid);

  if (getLayerContextActive() === layerContext) {
    setLayerContextActive(uuid, false);
  }

  for (const constraint of layerContext.constraints.values()) {
    constraint.destroy();
  }

  for (const element of layerContext.elements.values()) {
    element.destroy();
  }

  layerContext.layer.destroy();
  LAYER_DATABASE.delete(uuid);
}

function layerDebugUpdate({
  uuid,
  showAspect,
  showHeight,
  showWidth,
  showHorizontalDistance,
  showHorizontalInterpolation,
  showVerticalDistance,
  showVerticalInterpolation,
}: Omit<EMessageLayerDebugUpdate, "type">): void {
  const debug = resolveLayerContext(uuid).debug;
  debug.showAspect = showAspect;
  debug.showHeight = showHeight;
  debug.showWidth = showWidth;
  debug.showHorizontalDistance = showHorizontalDistance;
  debug.showHorizontalInterpolation = showHorizontalInterpolation;
  debug.showVerticalDistance = showVerticalDistance;
  debug.showVerticalInterpolation = showVerticalInterpolation;
}

function layerSetActive({ uuid, isActive }: Omit<EMessageLayerSetActive, "type">): void {
  setLayerContextActive(uuid, isActive);
}

// Elements

function elementAnimatedImageAdd({
  uuid,
  uuidLayer,
  name,
  color,
  sequence,
  frameRate,
  timeScale,
  loopMode,
  playByDefault,
}: Omit<EMessageElementAnimatedImageAdd, "type">): void {
  const layerContext = resolveLayerContext(uuidLayer);
  const images = sequence.map(resolveTextureAsset);

  const animatedImage = new UIAnimatedImage(layerContext.layer, images, {
    name,
    color,
    frameRate,
    timeScale,
    loopMode,
    playByDefault,
  });

  layerContext.elements.set(uuid, animatedImage);
}

function elementAnimatedImageUpdate({
  uuid,
  uuidLayer,
  name,
  color,
  sequence,
  frameRate,
  timeScale,
  loopMode,
}: Omit<EMessageElementAnimatedImageUpdate, "type">): void {
  const animatedImage = resolveUIElement(uuidLayer, uuid) as UIAnimatedImage;
  animatedImage.name = name;
  animatedImage.color = color;
  animatedImage.sequence = sequence.map(resolveTextureAsset);
  animatedImage.frameRate = frameRate;
  animatedImage.timeScale = timeScale;
  animatedImage.loopMode = loopMode;
}

function elementGraphicsAdd({
  uuid,
  uuidLayer,
  name,
  resolution,
  color,
  drawSequence,
}: Omit<EMessageElementGraphicsAdd, "type">): void {
  throw new Error("Not implemented yet: EMessageType.ELEMENT_GRAPHICS_ADD case");
}

function elementGraphicsUpdate({
  uuid,
  uuidLayer,
  name,
  color,
  drawSequence,
}: Omit<EMessageElementGraphicsUpdate, "type">): void {
  throw new Error("Not implemented yet: EMessageType.ELEMENT_GRAPHICS_UPDATE case");
}

function elementImageAdd({
  uuid,
  uuidLayer,
  name,
  color,
  texture,
}: Omit<EMessageElementImageAdd, "type">): void {
  const layerContext = resolveLayerContext(uuidLayer);
  const image = new UIImage(layerContext.layer, resolveTextureAsset(texture), { color, name });
  layerContext.elements.set(uuid, image);
}

function elementImageUpdate({
  uuid,
  uuidLayer,
  name,
  color,
  texture,
}: Omit<EMessageElementImageUpdate, "type">): void {
  const image = resolveUIElement(uuidLayer, uuid) as UIImage;
  image.color = color;
  image.name = name;
  image.texture.set(resolveTextureAsset(texture));
}

function elementNineSliceAdd({
  uuid,
  uuidLayer,
  name,
  color,
  texture,
  regionMode,
  sliceBorders,
  sliceRegions,
}: Omit<EMessageElementNineSliceAdd, "type">): void {
  const layerContext = resolveLayerContext(uuidLayer);
  const nineSlice = new UINineSlice(layerContext.layer, resolveTextureAsset(texture), {
    color,
    name,
    regionMode,
    sliceBorders,
    sliceRegions,
  });
  layerContext.elements.set(uuid, nineSlice);
}

function elementNineSliceUpdate({
  uuid,
  uuidLayer,
  name,
  color,
  texture,
  regionMode,
  sliceBorders,
  sliceRegions,
}: Omit<EMessageElementNineSliceUpdate, "type">): void {
  const nineSlice = resolveUIElement(uuidLayer, uuid) as UINineSlice;
  nineSlice.color = color;
  nineSlice.name = name;
  nineSlice.texture.set(resolveTextureAsset(texture));
  nineSlice.regionMode = regionMode;
  nineSlice.sliceBorders = sliceBorders;
  nineSlice.sliceRegions = sliceRegions;
}

function elementProgressAdd({
  uuid,
  uuidLayer,
  name,
  color,
  texture,
  maskFunction,
  progress,
}: Omit<EMessageElementProgressAdd, "type">): void {
  throw new Error("Not implemented yet: EMessageType.ELEMENT_PROGRESS_ADD case");
}

function elementProgressUpdate({
  uuid,
  uuidLayer,
  name,
  color,
  texture,
  maskFunction,
  progress,
}: Omit<EMessageElementProgressUpdate, "type">): void {
  throw new Error("Not implemented yet: EMessageType.ELEMENT_PROGRESS_UPDATE case");
}

function elementSceneAdd({
  uuid,
  uuidLayer,
  name,
  color,
  clearColor,
  enableDepthBuffer,
  resolutionFactor,
  updateMode,
}: Omit<EMessageElementSceneAdd, "type">): void {
  throw new Error("Not implemented yet: EMessageType.ELEMENT_SCENE_ADD case");
}

function elementSceneUpdate({
  uuid,
  uuidLayer,
  name,
  color,
  clearColor,
  enableDepthBuffer,
  resolutionFactor,
  updateMode,
}: Omit<EMessageElementSceneUpdate, "type">): void {
  throw new Error("Not implemented yet: EMessageType.ELEMENT_SCENE_UPDATE case");
}

function elementTextAdd({
  uuid,
  uuidLayer,
  name,
  color,
  content,
  maxLineWidth,
  resizeMode,
}: Omit<EMessageElementTextAdd, "type">): void {
  throw new Error("Not implemented yet: EMessageType.ELEMENT_TEXT_ADD case");
}

function elementTextUpdate({
  uuid,
  uuidLayer,
  name,
  color,
  content,
  maxLineWidth,
  resizeMode,
}: Omit<EMessageElementTextUpdate, "type">): void {
  throw new Error("Not implemented yet: EMessageType.ELEMENT_TEXT_UPDATE case");
}

function elementRemove({ uuid, uuidLayer }: Omit<EMessageElementRemove, "type">): void {
  const element = resolveUIElement(uuidLayer, uuid);
  element.destroy();
}

// Constraint

function constraintAspectAdd({
  uuid,
  uuidLayer,
  name,
  uuidElementA,
  aspect,
}: Omit<EMessageConstraintAspectAdd, "type">): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_ASPECT_ADD case");
}

function constraintAspectUpdate(data: Omit<EMessageConstraintAspectUpdate, "type">): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_ASPECT_UPDATE case");
}

function constraintDistanceHorizontalAdd(
  data: Omit<EMessageConstraintDistanceHorizontalAdd, "type">,
): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_DISTANCE_HORIZONTAL_ADD case");
}

function constraintDistanceHorizontalUpdate(
  data: Omit<EMessageConstraintDistanceHorizontalUpdate, "type">,
): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_DISTANCE_HORIZONTAL_UPDATE case");
}

function constraintDistanceVerticalAdd(
  data: Omit<EMessageConstraintDistanceVerticalAdd, "type">,
): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_DISTANCE_VERTICAL_ADD case");
}

function constraintDistanceVerticalUpdate(
  data: Omit<EMessageConstraintDistanceVerticalUpdate, "type">,
): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_DISTANCE_VERTICAL_UPDATE case");
}

function constraintProportionHorizontalAdd(
  data: Omit<EMessageConstraintProportionHorizontalAdd, "type">,
): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_PROPORTION_HORIZONTAL_ADD case");
}

function constraintProportionHorizontalUpdate(
  data: Omit<EMessageConstraintProportionHorizontalUpdate, "type">,
): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_PROPORTION_HORIZONTAL_UPDATE case");
}

function constraintProportionVerticalAdd(
  data: Omit<EMessageConstraintProportionVerticalAdd, "type">,
): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_PROPORTION_VERTICAL_ADD case");
}

function constraintProportionVerticalUpdate(
  data: Omit<EMessageConstraintProportionVerticalUpdate, "type">,
): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_PROPORTION_VERTICAL_UPDATE case");
}

function constraintSizeHorizontalAdd(
  data: Omit<EMessageConstraintSizeHorizontalAdd, "type">,
): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_SIZE_HORIZONTAL_ADD case");
}

function constraintSizeHorizontalUpdate(
  data: Omit<EMessageConstraintSizeHorizontalUpdate, "type">,
): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_SIZE_HORIZONTAL_UPDATE case");
}

function constraintSizeVerticalAdd(data: Omit<EMessageConstraintSizeVerticalAdd, "type">): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_SIZE_VERTICAL_ADD case");
}

function constraintSizeVerticalUpdate(
  data: Omit<EMessageConstraintSizeVerticalUpdate, "type">,
): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_SIZE_VERTICAL_UPDATE case");
}

function constraintRemove(data: Omit<EMessageConstraintRemove, "type">): void {
  throw new Error("Not implemented yet: EMessageType.CONSTRAINT_REMOVE case");
}

async function assetFontAdd({
  uuid,
  dataURL,
  fontFamily,
}: Omit<EMessageAssetFontAdd, "type">): Promise<void> {
  console.debug("[preview] LOAD_FONT fontFamily=%s", fontFamily);
  const fontFace = new FontFace(fontFamily, `url(${dataURL})`);
  await fontFace.load();
  document.fonts.add(fontFace);
  ASSET_DATABASE.set(uuid, fontFace);
}

async function assetFontUpdate({
  uuid,
  dataURL,
  fontFamily,
}: Omit<EMessageAssetFontUpdate, "type">): Promise<void> {
  const fontFace = resolveFontAsset(uuid);
  document.fonts.delete(fontFace);
  await assetFontAdd({ uuid, dataURL, fontFamily });
}

async function assetImageAdd({
  uuid,
  dataURL,
}: Omit<EMessageAssetImageAdd, "type">): Promise<void> {
  const texture = await loadTexture(dataURL);
  ASSET_DATABASE.set(uuid, texture);
}

async function assetImageUpdate({
  uuid,
  dataURL,
}: Omit<EMessageAssetImageUpdate, "type">): Promise<void> {
  const oldTexture = resolveTextureAsset(uuid);
  const newTexture = await loadTexture(dataURL);

  for (const layerContext of LAYER_DATABASE.values()) {
    for (const element of layerContext.elements.values()) {
      if (element instanceof UII)
    }
  }


  // oldTexture.dispose();
  // ASSET_DATABASE.set(uuid, newTexture);
}

function assetRemove({ uuid }: Omit<EMessageAssetRemove, "type">): void {
  throw new Error("Not implemented yet: EMessageType.ASSET_REMOVE case");
}

function commonSetTheme({ theme }: Omit<EMessageCommonSetTheme, "type">): void {
  console.debug("[preview] SET_THEME theme=%s", theme);
  document.documentElement.setAttribute("data-theme", theme.toLowerCase());
}

function commonReset(data: Omit<EMessageCommonReset, "type">): void {}
