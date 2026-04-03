import {
  UIAnimatedImage,
  UIAspectConstraint,
  UIFullscreenLayer,
  UIGraphics,
  UIHeightConstraint,
  UIHorizontalDistanceConstraint,
  UIHorizontalProportionConstraint,
  UIImage,
  UINineSlice,
  UIProgress,
  UIScene,
  UIText,
  UIVerticalDistanceConstraint,
  UIVerticalProportionConstraint,
  UIWidthConstraint,
} from "laymur";
import { UILayerDebug } from "laymur/debug";
import { Texture } from "three";
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
  applyDrawSequence,
  ASSET_DATABASE,
  buildMaskFunction,
  buildResizePolicy,
  ensureUniqueAsset,
  ensureUniqueConstraint,
  ensureUniqueElement,
  getLayerContextActive,
  LAYER_DATABASE,
  loadTexture,
  resolveAsset,
  resolveConstraint,
  resolveElement,
  resolveFontAsset,
  resolveLayerContext,
  resolveTextureAsset,
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
  if (LAYER_DATABASE.has(uuid)) {
    throw new Error(`Layer with uuid ${uuid} already exists`);
  }

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
  uuidOwner,
  name,
  color,
  sequence,
  frameRate,
  timeScale,
  loopMode,
  playByDefault,
}: Omit<EMessageElementAnimatedImageAdd, "type">): void {
  ensureUniqueElement(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const animatedImage = new UIAnimatedImage(layerContext.layer, sequence.map(resolveTextureAsset), {
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
  uuidOwner,
  name,
  color,
  sequence,
  frameRate,
  timeScale,
  loopMode,
}: Omit<EMessageElementAnimatedImageUpdate, "type">): void {
  const animatedImage = resolveElement(uuidOwner, uuid) as UIAnimatedImage;
  animatedImage.name = name;
  animatedImage.color = color;
  animatedImage.sequence = sequence.map(resolveTextureAsset);
  animatedImage.frameRate = frameRate;
  animatedImage.timeScale = timeScale;
  animatedImage.loopMode = loopMode;
}

function elementGraphicsAdd({
  uuid,
  uuidOwner,
  name,
  resolution,
  color,
  drawSequence,
}: Omit<EMessageElementGraphicsAdd, "type">): void {
  ensureUniqueElement(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const graphics = new UIGraphics(layerContext.layer, {
    width: resolution[0],
    height: resolution[1],
    color,
    name,
  });
  layerContext.elements.set(uuid, graphics);
  applyDrawSequence(graphics, drawSequence);
}

function elementGraphicsUpdate({
  uuid,
  uuidOwner,
  name,
  color,
  drawSequence,
}: Omit<EMessageElementGraphicsUpdate, "type">): void {
  const graphics = resolveElement(uuidOwner, uuid) as UIGraphics;
  graphics.name = name;
  graphics.color = color;
  applyDrawSequence(graphics, drawSequence);
}

function elementImageAdd({
  uuid,
  uuidOwner,
  name,
  color,
  texture,
}: Omit<EMessageElementImageAdd, "type">): void {
  ensureUniqueElement(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const image = new UIImage(layerContext.layer, resolveTextureAsset(texture), { color, name });
  layerContext.elements.set(uuid, image);
}

function elementImageUpdate({
  uuid,
  uuidOwner,
  name,
  color,
  texture,
}: Omit<EMessageElementImageUpdate, "type">): void {
  const image = resolveElement(uuidOwner, uuid) as UIImage;
  image.color = color;
  image.name = name;
  image.texture.set(resolveTextureAsset(texture));
}

function elementNineSliceAdd({
  uuid,
  uuidOwner,
  name,
  color,
  texture,
  regionMode,
  sliceBorders,
  sliceRegions,
}: Omit<EMessageElementNineSliceAdd, "type">): void {
  ensureUniqueElement(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
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
  uuidOwner,
  name,
  color,
  texture,
  regionMode,
  sliceBorders,
  sliceRegions,
}: Omit<EMessageElementNineSliceUpdate, "type">): void {
  const nineSlice = resolveElement(uuidOwner, uuid) as UINineSlice;
  nineSlice.color = color;
  nineSlice.name = name;
  nineSlice.texture.set(resolveTextureAsset(texture));
  nineSlice.regionMode = regionMode;
  nineSlice.sliceBorders = sliceBorders;
  nineSlice.sliceRegions = sliceRegions;
}

function elementProgressAdd({
  uuid,
  uuidOwner,
  name,
  color,
  texture,
  maskFunction,
  progress,
}: Omit<EMessageElementProgressAdd, "type">): void {
  ensureUniqueElement(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const progressElement = new UIProgress(layerContext.layer, resolveTextureAsset(texture), {
    name,
    color,
    maskFunction: buildMaskFunction(maskFunction),
    progress,
  });
  layerContext.elements.set(uuid, progressElement);
}

function elementProgressUpdate({
  uuid,
  uuidOwner,
  name,
  color,
  texture,
  maskFunction,
  progress,
}: Omit<EMessageElementProgressUpdate, "type">): void {
  const layerContext = resolveLayerContext(uuidOwner);
  const progressElement = layerContext.elements.get(uuid) as UIProgress;
  progressElement.name = name;
  progressElement.color = color;
  progressElement.texture.set(resolveTextureAsset(texture));
  progressElement.maskFunction = buildMaskFunction(maskFunction);
  progressElement.progress = progress;
}

function elementSceneAdd({
  uuid,
  uuidOwner,
  name,
  color,
  clearColor,
  enableDepthBuffer,
  resolutionFactor,
  updateMode,
}: Omit<EMessageElementSceneAdd, "type">): void {
  ensureUniqueElement(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const scene = new UIScene(layerContext.layer, {
    name,
    color,
    clearColor,
    enableDepthBuffer,
    resolutionFactor,
    updateMode,
  });
  layerContext.elements.set(uuid, scene);
}

function elementSceneUpdate({
  uuid,
  uuidOwner,
  name,
  color,
  clearColor,
  resolutionFactor,
  updateMode,
}: Omit<EMessageElementSceneUpdate, "type">): void {
  const scene = resolveElement(uuidOwner, uuid) as UIScene;
  scene.name = name;
  scene.color = color;
  scene.clearColor = clearColor;
  scene.resolutionFactor = resolutionFactor;
  scene.updateMode = updateMode;
}

function elementTextAdd({
  uuid,
  uuidOwner,
  name,
  color,
  content,
  maxLineWidth,
  resizeMode,
}: Omit<EMessageElementTextAdd, "type">): void {
  ensureUniqueElement(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const text = new UIText(layerContext.layer, content, { name, color, maxLineWidth, resizeMode });
  layerContext.elements.set(uuid, text);
}

function elementTextUpdate({
  uuid,
  uuidOwner,
  name,
  color,
  content,
  maxLineWidth,
  resizeMode,
}: Omit<EMessageElementTextUpdate, "type">): void {
  const text = resolveElement(uuidOwner, uuid) as UIText;
  text.name = name;
  text.color = color;
  text.content = content;
  text.maxLineWidth = maxLineWidth;
  text.resizeMode = resizeMode;
}

function elementRemove({ uuid, uuidOwner }: Omit<EMessageElementRemove, "type">): void {
  const element = resolveElement(uuidOwner, uuid);
  for (const layerContext of LAYER_DATABASE.values()) {
    for (const constraint of layerContext.constraints.values()) {
      if (
        ("element" in constraint && constraint.element === element) ||
        ("a" in constraint && constraint.a === element) ||
        ("b" in constraint && constraint.b === element)
      ) {
        throw new Error("Element cannot be removed, it is referenced by a constraint: " + uuid);
      }
    }
  }
  // todo check if element is in use by constraints
  element.destroy();
}

// Constraint

function constraintAspectAdd({
  uuid,
  uuidOwner,
  name,
  uuidElementA,
  aspect,
}: Omit<EMessageConstraintAspectAdd, "type">): void {
  ensureUniqueConstraint(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const element = resolveElement(uuidOwner, uuidElementA);
  const aspectConstraint = new UIAspectConstraint(element, { name, aspect });
  layerContext.constraints.set(uuid, aspectConstraint);
}

function constraintAspectUpdate({
  uuid,
  uuidOwner,
  name,
  aspect,
}: Omit<EMessageConstraintAspectUpdate, "type">): void {
  const constraint = resolveConstraint(uuidOwner, uuid) as UIAspectConstraint;
  constraint.name = name;
  constraint.aspect = aspect;
}

function constraintDistanceHorizontalAdd({
  uuid,
  uuidOwner,
  name,
  uuidElementA,
  uuidElementB,
  anchorA,
  anchorB,
  distance,
}: Omit<EMessageConstraintDistanceHorizontalAdd, "type">): void {
  ensureUniqueConstraint(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const elementA = resolveElement(uuidOwner, uuidElementA);
  const elementB = resolveElement(uuidOwner, uuidElementB);
  const constraint = new UIHorizontalDistanceConstraint(elementA, elementB, {
    name,
    anchorA,
    anchorB,
    distance,
  });
  layerContext.constraints.set(uuid, constraint);
}

function constraintDistanceHorizontalUpdate({
  uuid,
  uuidOwner,
  name,
  anchorA,
  anchorB,
  distance,
}: Omit<EMessageConstraintDistanceHorizontalUpdate, "type">): void {
  const constraint = resolveConstraint(uuidOwner, uuid) as UIHorizontalDistanceConstraint;
  constraint.name = name;
  constraint.anchorA = anchorA;
  constraint.anchorB = anchorB;
  constraint.distance = distance;
}

function constraintDistanceVerticalAdd({
  uuid,
  uuidOwner,
  name,
  uuidElementA,
  uuidElementB,
  anchorA,
  anchorB,
  distance,
}: Omit<EMessageConstraintDistanceVerticalAdd, "type">): void {
  ensureUniqueConstraint(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const elementA = resolveElement(uuidOwner, uuidElementA);
  const elementB = resolveElement(uuidOwner, uuidElementB);
  const constraint = new UIVerticalDistanceConstraint(elementA, elementB, {
    name,
    anchorA,
    anchorB,
    distance,
  });
  layerContext.constraints.set(uuid, constraint);
}

function constraintDistanceVerticalUpdate({
  uuid,
  uuidOwner,
  name,
  anchorA,
  anchorB,
  distance,
}: Omit<EMessageConstraintDistanceVerticalUpdate, "type">): void {
  const constraint = resolveConstraint(uuidOwner, uuid) as UIVerticalDistanceConstraint;
  constraint.name = name;
  constraint.anchorA = anchorA;
  constraint.anchorB = anchorB;
  constraint.distance = distance;
}

function constraintProportionHorizontalAdd({
  uuid,
  uuidOwner,
  name,
  uuidElementA,
  uuidElementB,
  proportion,
}: Omit<EMessageConstraintProportionHorizontalAdd, "type">): void {
  ensureUniqueConstraint(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const elementA = resolveElement(uuidOwner, uuidElementA);
  const elementB = resolveElement(uuidOwner, uuidElementB);
  const constraint = new UIHorizontalProportionConstraint(elementA, elementB, { name, proportion });
  layerContext.constraints.set(uuid, constraint);
}

function constraintProportionHorizontalUpdate({
  uuid,
  uuidOwner,
  name,
  proportion,
}: Omit<EMessageConstraintProportionHorizontalUpdate, "type">): void {
  const constraint = resolveConstraint(uuidOwner, uuid) as UIHorizontalProportionConstraint;
  constraint.name = name;
  constraint.proportion = proportion;
}

function constraintProportionVerticalAdd({
  uuid,
  uuidOwner,
  name,
  uuidElementA,
  uuidElementB,
  proportion,
}: Omit<EMessageConstraintProportionVerticalAdd, "type">): void {
  ensureUniqueConstraint(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const elementA = resolveElement(uuidOwner, uuidElementA);
  const elementB = resolveElement(uuidOwner, uuidElementB);
  const constraint = new UIVerticalProportionConstraint(elementA, elementB, { name, proportion });
  layerContext.constraints.set(uuid, constraint);
}

function constraintProportionVerticalUpdate({
  uuid,
  uuidOwner,
  name,
  proportion,
}: Omit<EMessageConstraintProportionVerticalUpdate, "type">): void {
  const constraint = resolveConstraint(uuidOwner, uuid) as UIVerticalProportionConstraint;
  constraint.name = name;
  constraint.proportion = proportion;
}

function constraintSizeHorizontalAdd({
  uuid,
  uuidOwner,
  name,
  uuidElementA,
  size,
}: Omit<EMessageConstraintSizeHorizontalAdd, "type">): void {
  ensureUniqueConstraint(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const element = resolveElement(uuidOwner, uuidElementA);
  const constraint = new UIWidthConstraint(element, { name, width: size });
  layerContext.constraints.set(uuid, constraint);
}

function constraintSizeHorizontalUpdate({
  uuid,
  uuidOwner,
  name,
  size,
}: Omit<EMessageConstraintSizeHorizontalUpdate, "type">): void {
  const constraint = resolveConstraint(uuidOwner, uuid) as UIWidthConstraint;
  constraint.name = name;
  constraint.width = size;
}

function constraintSizeVerticalAdd({
  uuid,
  uuidOwner,
  name,
  uuidElementA,
  size,
}: Omit<EMessageConstraintSizeVerticalAdd, "type">): void {
  ensureUniqueConstraint(uuid);
  const layerContext = resolveLayerContext(uuidOwner);
  const element = resolveElement(uuidOwner, uuidElementA);
  const constraint = new UIHeightConstraint(element, { name, height: size });
  layerContext.constraints.set(uuid, constraint);
}

function constraintSizeVerticalUpdate({
  uuid,
  uuidOwner,
  name,
  size,
}: Omit<EMessageConstraintSizeVerticalUpdate, "type">): void {
  const constraint = resolveConstraint(uuidOwner, uuid) as UIHeightConstraint;
  constraint.name = name;
  constraint.height = size;
}

function constraintRemove({ uuid, uuidOwner }: Omit<EMessageConstraintRemove, "type">): void {
  const layerContext = resolveLayerContext(uuidOwner);
  const constraint = resolveConstraint(uuidOwner, uuid);
  constraint.destroy();
  layerContext.constraints.delete(uuid);
}

async function assetFontAdd({
  uuid,
  dataURL,
  fontFamily,
}: Omit<EMessageAssetFontAdd, "type">): Promise<void> {
  ensureUniqueAsset(uuid);
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
  const oldFontFace = resolveFontAsset(uuid);
  document.fonts.delete(oldFontFace);
  await assetFontAdd({ uuid, dataURL, fontFamily });
  const fontFace = resolveFontAsset(uuid);

  for (const layerContext of LAYER_DATABASE.values()) {
    // Each layer
    for (const element of layerContext.elements.values()) {
      // Each element in the layer
      if (element instanceof UIText) {
        for (const span of element.content) {
          if (span.style.fontFamily === fontFamily) {
            const clonedContent = [...element.content];
            for (const clonedSpan of clonedContent) {
              if (clonedSpan.style.fontFamily === fontFace.family) {
                clonedSpan.style.fontFamily = fontFamily;
              }
            }
            element.content = clonedContent;
            break;
          }
        }
      }
    }
  }
}

async function assetImageAdd({
  uuid,
  dataURL,
}: Omit<EMessageAssetImageAdd, "type">): Promise<void> {
  ensureUniqueAsset(uuid);
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
    // Each layer
    for (const element of layerContext.elements.values()) {
      // Each element in the layer
      if (element instanceof UIAnimatedImage) {
        for (const frame of element.sequence) {
          if (frame.texture === oldTexture) {
            frame.set(newTexture);
            break;
          }
        }
      } else if (
        element instanceof UIImage ||
        element instanceof UINineSlice ||
        element instanceof UIProgress
      ) {
        if (element.texture.texture === oldTexture) {
          element.texture.set(newTexture);
        }
      }
    }
  }

  oldTexture.dispose();
  ASSET_DATABASE.set(uuid, newTexture);
}

function assetRemove({ uuid }: Omit<EMessageAssetRemove, "type">): void {
  const asset = resolveAsset(uuid);

  if (asset instanceof Texture) {
    for (const layerContext of LAYER_DATABASE.values()) {
      // Each layer
      for (const element of layerContext.elements.values()) {
        // Each element in the layer
        if (element instanceof UIAnimatedImage) {
          for (const frame of element.sequence) {
            if (frame.texture === asset) {
              throw new Error("Cannot remove texture that is currently in use");
            }
          }
        } else if (
          element instanceof UIImage ||
          element instanceof UINineSlice ||
          element instanceof UIProgress
        ) {
          if (element.texture.texture === asset) {
            throw new Error("Cannot remove texture that is currently in use");
          }
        }
      }
    }
  } else {
    for (const layerContext of LAYER_DATABASE.values()) {
      // Each layer
      for (const element of layerContext.elements.values()) {
        // Each element in the layer
        if (element instanceof UIText) {
          for (const span of element.content) {
            if (span.style.fontFamily === asset.family) {
              throw new Error("Cannot remove font that is currently in use");
            }
          }
        }
      }
    }
  }

  ASSET_DATABASE.delete(uuid);
}

function commonSetTheme({ theme }: Omit<EMessageCommonSetTheme, "type">): void {
  console.debug("[preview] SET_THEME theme=%s", theme);
  document.documentElement.setAttribute("data-theme", theme.toLowerCase());
}

function commonReset({}: Omit<EMessageCommonReset, "type">): void {
  for (const layerContext of LAYER_DATABASE.values()) {
    layerContext.debug.destroy();
    for (const constraint of layerContext.constraints.values()) {
      constraint.destroy();
    }
    for (const element of layerContext.elements.values()) {
      element.destroy();
    }
    layerContext.layer.destroy();
  }

  LAYER_DATABASE.clear();
}
