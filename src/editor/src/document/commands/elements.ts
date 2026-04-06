import type { EStoreSignalsElements } from "../signals";
import { EStoreDeltaOperation } from "../signals";
import type { EDocument, ELayerContext, PartialExceptUUID } from "../types";
import { clone } from "../types";
import type {
  EAnimatedImageElement,
  EAnyElement,
  EGraphicsElement,
  EImageElement,
  ENineSliceElement,
  EProgressElement,
  ESceneElement,
  ETextElement,
} from "../types.elements";
import { EElementType } from "../types.elements";
import type { EElementUuid, ELayerUuid } from "../types.misc";

export class EStoreCommandsElements {
  constructor(
    private readonly data: EDocument,
    private readonly signals: EStoreSignalsElements,
  ) {}

  public add(layerUuid: ELayerUuid, element: EAnyElement): void {
    this.getContext(layerUuid).elements.push(element);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.ADD, layerUuid, element });
  }

  public remove(layerUuid: ELayerUuid, uuid: EElementUuid): void {
    const layerContext = this.getContext(layerUuid);
    const index = layerContext.elements.findIndex((e) => e.uuid === uuid);
    if (index === -1) {
      throw new Error(`[EStoreCommandsElements] Element not found: (uuid: ${uuid})`);
    }
    layerContext.elements.splice(index, 1);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REMOVE, layerUuid, uuid });
  }

  public reorder(layerUuid: ELayerUuid, uuids: EElementUuid[]): void {
    const layerContext = this.getContext(layerUuid);
    layerContext.elements.sort((a, b) => uuids.indexOf(a.uuid) - uuids.indexOf(b.uuid));
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REORDER, layerUuid, uuids });
  }

  public writeAnimatedImage(data: PartialExceptUUID<EAnimatedImageElement>): void {
    const element = this.get<EAnimatedImageElement>(data.uuid, EElementType.ANIMATED_IMAGE);
    if (data.name !== undefined) {
      element.name = data.name;
    }
    if (data.color !== undefined) {
      element.color = data.color;
    }
    if (data.sequence !== undefined) {
      element.sequence = clone(data.sequence);
    }
    if (data.frameRate !== undefined) {
      element.frameRate = data.frameRate;
    }
    if (data.timeScale !== undefined) {
      element.timeScale = data.timeScale;
    }
    if (data.loopMode !== undefined) {
      element.loopMode = data.loopMode;
    }
    if (data.playByDefault !== undefined) {
      element.playByDefault = data.playByDefault;
    }
    this.signals["emitItem"]({ element });
  }

  public writeGraphics(data: PartialExceptUUID<EGraphicsElement>): void {
    const element = this.get<EGraphicsElement>(data.uuid, EElementType.GRAPHICS);
    if (data.name !== undefined) {
      element.name = data.name;
    }
    if (data.color !== undefined) {
      element.color = data.color;
    }
    if (data.resolution !== undefined) {
      element.resolution = clone(data.resolution);
    }
    if (data.drawSequence !== undefined) {
      element.drawSequence = clone(data.drawSequence);
    }
    this.signals["emitItem"]({ element });
  }

  public writeImage(data: PartialExceptUUID<EImageElement>): void {
    const element = this.get<EImageElement>(data.uuid, EElementType.IMAGE);
    if (data.name !== undefined) {
      element.name = data.name;
    }
    if (data.color !== undefined) {
      element.color = data.color;
    }
    if (data.texture !== undefined) {
      element.texture = data.texture;
    }
    this.signals["emitItem"]({ element });
  }

  public writeNineSlice(data: PartialExceptUUID<ENineSliceElement>): void {
    const element = this.get<ENineSliceElement>(data.uuid, EElementType.NINE_SLICE);
    if (data.name !== undefined) {
      element.name = data.name;
    }
    if (data.color !== undefined) {
      element.color = data.color;
    }
    if (data.texture !== undefined) {
      element.texture = data.texture;
    }
    if (data.sliceBorders !== undefined) {
      element.sliceBorders = clone(data.sliceBorders);
    }
    if (data.sliceRegions !== undefined) {
      element.sliceRegions = clone(data.sliceRegions);
    }
    if (data.regionMode !== undefined) {
      element.regionMode = data.regionMode;
    }
    this.signals["emitItem"]({ element });
  }

  public writeProgress(data: PartialExceptUUID<EProgressElement>): void {
    const element = this.get<EProgressElement>(data.uuid, EElementType.PROGRESS);
    if (data.name !== undefined) {
      element.name = data.name;
    }
    if (data.color !== undefined) {
      element.color = data.color;
    }
    if (data.texture !== undefined) {
      element.texture = data.texture;
    }
    if (data.maskFunction !== undefined) {
      element.maskFunction = data.maskFunction;
    }
    if (data.progress !== undefined) {
      element.progress = data.progress;
    }
    this.signals["emitItem"]({ element });
  }

  public writeScene(data: PartialExceptUUID<ESceneElement>): void {
    const element = this.get<ESceneElement>(data.uuid, EElementType.SCENE);
    if (data.name !== undefined) {
      element.name = data.name;
    }
    if (data.color !== undefined) {
      element.color = data.color;
    }
    if (data.updateMode !== undefined) {
      element.updateMode = data.updateMode;
    }
    if (data.resolutionFactor !== undefined) {
      element.resolutionFactor = data.resolutionFactor;
    }
    if (data.clearColor !== undefined) {
      element.clearColor = data.clearColor;
    }
    if (data.enableDepthBuffer !== undefined) {
      element.enableDepthBuffer = data.enableDepthBuffer;
    }
    this.signals["emitItem"]({ element });
  }

  public writeText(data: PartialExceptUUID<ETextElement>): void {
    const element = this.get<ETextElement>(data.uuid, EElementType.TEXT);
    if (data.name !== undefined) {
      element.name = data.name;
    }
    if (data.color !== undefined) {
      element.color = data.color;
    }
    if (data.content !== undefined) {
      element.content = clone(data.content);
    }
    if (data.resizeMode !== undefined) {
      element.resizeMode = data.resizeMode;
    }
    if (data.maxLineWidth !== undefined) {
      element.maxLineWidth = data.maxLineWidth;
    }
    this.signals["emitItem"]({ element });
  }

  private getContext(layerUuid: ELayerUuid): ELayerContext {
    const layerContext = this.data.layerContexts.find((c) => c.layer.uuid === layerUuid);
    if (!layerContext) {
      throw new Error(`[EStoreCommandsElements] Layer not found: (uuid: ${layerUuid})`);
    }
    return layerContext;
  }

  private get<T extends EAnyElement>(uuid: EElementUuid, type: EElementType): T {
    for (const { elements } of this.data.layerContexts) {
      for (const element of elements) {
        if (element.type === type && element.uuid === uuid) {
          return element as T;
        }
      }
    }
    throw new Error(`[EStoreCommandsElements] Element not found: (uuid: ${uuid}, type: ${type})`);
  }
}
