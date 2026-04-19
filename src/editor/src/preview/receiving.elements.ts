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
  buildMaskFunction,
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
} from "./internal";

export function addElement(layerUuid: string, element: EAnyElement): void {
  ensureUniqueElement(element.uuid);
  const ctx = resolveLayerContext(layerUuid);

  switch (element.type) {
    case EElementType.ANIMATED_IMAGE: {
      const e = new UIAnimatedImage(ctx.layer, element.sequence.map(resolveTextureAsset), {
        name: element.name,
        color: buildCSSColor(element.color),
        frameRate: element.frameRate,
        timeScale: element.timeScale,
        loopMode: buildLoopMode(element.loopMode),
        playByDefault: element.playByDefault,
      });
      ctx.elements.set(element.uuid, e);
      break;
    }
    case EElementType.GRAPHICS: {
      const e = new UIGraphics(ctx.layer, {
        width: element.resolution[0],
        height: element.resolution[1],
        color: buildCSSColor(element.color),
        name: element.name,
      });
      applyDrawSequence(e, element.drawSequence);
      ctx.elements.set(element.uuid, e);
      break;
    }
    case EElementType.IMAGE: {
      const e = new UIImage(ctx.layer, resolveTextureAsset(element.texture), {
        color: buildCSSColor(element.color),
        name: element.name,
      });
      ctx.elements.set(element.uuid, e);
      break;
    }
    case EElementType.NINE_SLICE: {
      const e = new UINineSlice(ctx.layer, resolveTextureAsset(element.texture), {
        color: buildCSSColor(element.color),
        name: element.name,
        regionMode: buildRegionMode(element.regionMode),
        sliceBorders: element.sliceBorders,
        sliceRegions: element.sliceRegions,
      });
      ctx.elements.set(element.uuid, e);
      break;
    }
    case EElementType.PROGRESS: {
      const e = new UIProgress(ctx.layer, resolveTextureAsset(element.texture), {
        name: element.name,
        color: buildCSSColor(element.color),
        maskFunction: buildMaskFunction(element.maskFunction),
        progress: element.progress,
      });
      ctx.elements.set(element.uuid, e);
      break;
    }
    case EElementType.SCENE: {
      console.warn("[preview] UIScene.enableDepthBuffer is not supported, ignoring");
      const e = new UIScene(ctx.layer, {
        name: element.name,
        color: buildCSSColor(element.color),
        clearColor: buildCSSColor(element.clearColor),
        resolutionFactor: element.resolutionFactor,
        updateMode: buildUpdateMode(element.updateMode),
      });
      ctx.elements.set(element.uuid, e);
      break;
    }
    case EElementType.TEXT: {
      const e = new UIText(ctx.layer, buildTextContent(element.content), {
        name: element.name,
        color: buildCSSColor(element.color),
        maxLineWidth: element.maxLineWidth,
        resizeMode: buildTextResizeMode(element.resizeMode),
      });
      ctx.elements.set(element.uuid, e);
      break;
    }
  }
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
      e.maskFunction = buildMaskFunction(element.maskFunction);
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
