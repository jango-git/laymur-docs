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
import type { UUID } from "../document/types.misc";
import {
  applyDrawSequence,
  buildCSSColor,
  buildLoopMode,
  buildProgressMaskFunction,
  buildRegionMode,
  buildTextContent,
  buildTextResizeMode,
  buildUpdateMode,
  ensureUniqueElement,
  findLayerUuidForElement,
  LAYER_DATABASE,
  resolveElement,
  resolveLayerContext,
  resolveTextureAsset,
} from "./miscellaneous";

export function addElement(layerUuid: UUID, data: EAnyElement): void {
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
          loopMode: buildLoopMode(data.loopMode),
          playByDefault: data.playByDefault,
        },
      );
      layerContext.elements.set(data.uuid, element);
      break;
    }
    case EElementType.GRAPHICS: {
      const e = new UIGraphics(layerContext.layer, {
        width: data.resolution[0],
        height: data.resolution[1],
        color: buildCSSColor(data.color),
        name: data.name,
      });
      applyDrawSequence(e, data.drawSequence);
      layerContext.elements.set(data.uuid, e);
      break;
    }
    case EElementType.IMAGE: {
      const e = new UIImage(layerContext.layer, resolveTextureAsset(data.texture), {
        color: buildCSSColor(data.color),
        name: data.name,
      });
      layerContext.elements.set(data.uuid, e);
      break;
    }
    case EElementType.NINE_SLICE: {
      const e = new UINineSlice(layerContext.layer, resolveTextureAsset(data.texture), {
        color: buildCSSColor(data.color),
        name: data.name,
        regionMode: buildRegionMode(data.regionMode),
        sliceBorders: data.sliceBorders,
        sliceRegions: data.sliceRegions,
      });
      layerContext.elements.set(data.uuid, e);
      break;
    }
    case EElementType.PROGRESS: {
      const e = new UIProgress(layerContext.layer, resolveTextureAsset(data.texture), {
        name: data.name,
        color: buildCSSColor(data.color),
        maskFunction: buildProgressMaskFunction(data.maskFunction),
        progress: data.progress,
      });
      layerContext.elements.set(data.uuid, e);
      break;
    }
    case EElementType.SCENE: {
      console.warn("[preview] UIScene.enableDepthBuffer is not supported, ignoring");
      const e = new UIScene(layerContext.layer, {
        name: data.name,
        color: buildCSSColor(data.color),
        clearColor: buildCSSColor(data.clearColor),
        resolutionFactor: data.resolutionFactor,
        updateMode: buildUpdateMode(data.updateMode),
      });
      layerContext.elements.set(data.uuid, e);
      break;
    }
    case EElementType.TEXT: {
      const e = new UIText(layerContext.layer, buildTextContent(data.content), {
        name: data.name,
        color: buildCSSColor(data.color),
        maxLineWidth: data.maxLineWidth,
        resizeMode: buildTextResizeMode(data.resizeMode),
      });
      layerContext.elements.set(data.uuid, e);
      break;
    }
  }
}

export function removeElement(layerUuid: UUID, uuid: UUID): void {
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

export function updateElement(element: EAnyElement): void {
  const layerUuid = findLayerUuidForElement(element.uuid);

  switch (element.type) {
    case EElementType.ANIMATED_IMAGE: {
      const e = resolveElement(layerUuid, element.uuid) as UIAnimatedImage;
      e.name = element.name;
      e.color = buildCSSColor(element.color);
      e.sequence = element.sequence.map(resolveTextureAsset);
      e.frameRate = element.frameRate;
      e.timeScale = element.timeScale;
      e.loopMode = buildLoopMode(element.loopMode);
      break;
    }
    case EElementType.GRAPHICS: {
      const e = resolveElement(layerUuid, element.uuid) as UIGraphics;
      e.name = element.name;
      e.color = buildCSSColor(element.color);
      applyDrawSequence(e, element.drawSequence);
      break;
    }
    case EElementType.IMAGE: {
      const e = resolveElement(layerUuid, element.uuid) as UIImage;
      e.name = element.name;
      e.color = buildCSSColor(element.color);
      e.texture.set(resolveTextureAsset(element.texture));
      break;
    }
    case EElementType.NINE_SLICE: {
      const e = resolveElement(layerUuid, element.uuid) as UINineSlice;
      e.name = element.name;
      e.color = buildCSSColor(element.color);
      e.texture.set(resolveTextureAsset(element.texture));
      e.regionMode = buildRegionMode(element.regionMode);
      e.sliceBorders = element.sliceBorders;
      e.sliceRegions = element.sliceRegions;
      break;
    }
    case EElementType.PROGRESS: {
      const e = resolveElement(layerUuid, element.uuid) as UIProgress;
      e.name = element.name;
      e.color = buildCSSColor(element.color);
      e.texture.set(resolveTextureAsset(element.texture));
      e.maskFunction = buildProgressMaskFunction(element.maskFunction);
      e.progress = element.progress;
      break;
    }
    case EElementType.SCENE: {
      console.warn("[preview] UIScene.enableDepthBuffer is not supported, ignoring");
      const e = resolveElement(layerUuid, element.uuid) as UIScene;
      e.name = element.name;
      e.color = buildCSSColor(element.color);
      e.clearColor = buildCSSColor(element.clearColor);
      e.resolutionFactor = element.resolutionFactor;
      e.updateMode = buildUpdateMode(element.updateMode);
      break;
    }
    case EElementType.TEXT: {
      const e = resolveElement(layerUuid, element.uuid) as UIText;
      e.name = element.name;
      e.color = buildCSSColor(element.color);
      e.content = buildTextContent(element.content);
      e.maxLineWidth = element.maxLineWidth;
      e.resizeMode = buildTextResizeMode(element.resizeMode);
      break;
    }
  }
}
