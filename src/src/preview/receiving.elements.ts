import {
  UIAnimatedImage,
  UIGraphics,
  UIImage,
  UINineSlice,
  UIProgress,
  UIScene,
  UIText,
} from "laymur";
import type { EAnyElement } from "../document/types.elements";
import { EElementType } from "../document/types.elements";
import type { EElementUUID, ELayerUUID } from "../document/types.misc";
import { consoleDebug } from "../miscellaneous/debug.print";
import {
  applyGraphicsDrawSequence,
  buildAnimateImageLoopMode,
  buildCSSColor,
  buildNineSliceRegionMode,
  buildProgressMaskFunction,
  buildSceneUpdateMode,
  buildTextContent,
  buildTextResizeMode,
  ensureUniqueElement,
  findLayerUuidForElement,
  LAYER_DATABASE,
  resolveElement,
  resolveLayerContext,
  resolveTextureAsset,
} from "./miscellaneous";

export function addElement(layerUuid: ELayerUUID, data: EAnyElement): void {
  ensureUniqueElement(data.uuid);
  const layerContext = resolveLayerContext(layerUuid);

  switch (data.type) {
    case EElementType.ANIMATED_IMAGE: {
      const element = new UIAnimatedImage(
        layerContext.layer,
        data.sequence.map(resolveTextureAsset),
        {
          name: data.name,
          color: buildCSSColor(data.color),
          frameRate: data.frameRate,
          timeScale: data.timeScale,
          loopMode: buildAnimateImageLoopMode(data.loopMode),
          playByDefault: data.playByDefault,
        },
      );
      layerContext.elements.set(data.uuid, element);
      break;
    }
    case EElementType.GRAPHICS: {
      const element = new UIGraphics(layerContext.layer, {
        width: data.resolution[0],
        height: data.resolution[1],
        color: buildCSSColor(data.color),
        name: data.name,
      });
      applyGraphicsDrawSequence(element, data.drawSequence);
      layerContext.elements.set(data.uuid, element);
      break;
    }
    case EElementType.IMAGE: {
      const element = new UIImage(layerContext.layer, resolveTextureAsset(data.texture), {
        color: buildCSSColor(data.color),
        name: data.name,
      });
      layerContext.elements.set(data.uuid, element);
      break;
    }
    case EElementType.NINE_SLICE: {
      const element = new UINineSlice(layerContext.layer, resolveTextureAsset(data.texture), {
        color: buildCSSColor(data.color),
        name: data.name,
        regionMode: buildNineSliceRegionMode(data.regionMode),
        sliceBorders: data.sliceBorders,
        sliceRegions: data.sliceRegions,
      });
      layerContext.elements.set(data.uuid, element);
      break;
    }
    case EElementType.PROGRESS: {
      const element = new UIProgress(layerContext.layer, resolveTextureAsset(data.texture), {
        name: data.name,
        color: buildCSSColor(data.color),
        maskFunction: buildProgressMaskFunction(data.maskFunction),
        progress: data.progress,
      });
      layerContext.elements.set(data.uuid, element);
      break;
    }
    case EElementType.SCENE: {
      const element = new UIScene(layerContext.layer, {
        name: data.name,
        color: buildCSSColor(data.color),
        clearColor: buildCSSColor(data.clearColor),
        resolutionFactor: data.resolutionFactor,
        updateMode: buildSceneUpdateMode(data.updateMode),
        enableDepthBuffer: data.enableDepthBuffer,
      });
      layerContext.elements.set(data.uuid, element);
      break;
    }
    case EElementType.TEXT: {
      const element = new UIText(layerContext.layer, buildTextContent(data.content), {
        name: data.name,
        color: buildCSSColor(data.color),
        maxLineWidth: data.maxLineWidth,
        resizeMode: buildTextResizeMode(data.resizeMode),
      });
      layerContext.elements.set(data.uuid, element);
      break;
    }
  }
}

export function removeElement(layerUuid: ELayerUUID, uuid: EElementUUID): void {
  const element = resolveElement(layerUuid, uuid);

  for (const layerContext of LAYER_DATABASE.values()) {
    for (const constraint of layerContext.constraints.values()) {
      if (
        ("element" in constraint && constraint.element === element) ||
        ("a" in constraint && constraint.a === element) ||
        ("b" in constraint && constraint.b === element)
      ) {
        throw new Error(`Element ${uuid} is referenced by a constraint`);
      }
    }
  }

  element.destroy();
  resolveLayerContext(layerUuid).elements.delete(uuid);
}

export function updateElement(data: EAnyElement): void {
  const layerUuid = findLayerUuidForElement(data.uuid);

  switch (data.type) {
    case EElementType.ANIMATED_IMAGE: {
      const element = resolveElement(layerUuid, data.uuid) as UIAnimatedImage;
      element.name = data.name;
      element.color = buildCSSColor(data.color);
      element.sequence = data.sequence.map(resolveTextureAsset);
      element.frameRate = data.frameRate;
      element.timeScale = data.timeScale;
      element.loopMode = buildAnimateImageLoopMode(data.loopMode);
      break;
    }
    case EElementType.GRAPHICS: {
      const element = resolveElement(layerUuid, data.uuid) as UIGraphics;
      element.name = data.name;
      element.color = buildCSSColor(data.color);
      applyGraphicsDrawSequence(element, data.drawSequence);
      break;
    }
    case EElementType.IMAGE: {
      const element = resolveElement(layerUuid, data.uuid) as UIImage;
      element.name = data.name;
      element.color = buildCSSColor(data.color);
      element.texture.set(resolveTextureAsset(data.texture));
      break;
    }
    case EElementType.NINE_SLICE: {
      const element = resolveElement(layerUuid, data.uuid) as UINineSlice;
      element.name = data.name;
      element.color = buildCSSColor(data.color);
      element.texture.set(resolveTextureAsset(data.texture));
      element.regionMode = buildNineSliceRegionMode(data.regionMode);
      element.sliceBorders = data.sliceBorders;
      element.sliceRegions = data.sliceRegions;
      break;
    }
    case EElementType.PROGRESS: {
      const element = resolveElement(layerUuid, data.uuid) as UIProgress;
      element.name = data.name;
      element.color = buildCSSColor(data.color);
      element.texture.set(resolveTextureAsset(data.texture));
      element.maskFunction = buildProgressMaskFunction(data.maskFunction);
      element.progress = data.progress;
      break;
    }
    case EElementType.SCENE: {
      const element = resolveElement(layerUuid, data.uuid) as UIScene;
      element.name = data.name;
      element.color = buildCSSColor(data.color);
      element.clearColor = buildCSSColor(data.clearColor);
      element.resolutionFactor = data.resolutionFactor;
      element.updateMode = buildSceneUpdateMode(data.updateMode);

      consoleDebug("[preview] UIScene.enableDepthBuffer is not supported, ignoring");
      // element.enableDepthBuffer = data.enableDepthBuffer;
      break;
    }
    case EElementType.TEXT: {
      const element = resolveElement(layerUuid, data.uuid) as UIText;
      element.name = data.name;
      element.color = buildCSSColor(data.color);
      element.content = buildTextContent(data.content);
      element.maxLineWidth = data.maxLineWidth;
      element.resizeMode = buildTextResizeMode(data.resizeMode);
      break;
    }
  }
}
