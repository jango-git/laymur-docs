import { consoleDebug } from "../../miscellaneous/debug.print";
import { EStoreDeltaOperation } from "../signals";
import type { EStoreSignalsElements } from "../signals/elements";
import type { EDocument, ELayerContext, PartialExceptUUIDField } from "../types";
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
import type { EElementUUID, ELayerUUID } from "../types.misc";

export class EStoreCommandsElements {
  constructor(
    private readonly data: EDocument,
    private readonly signals: EStoreSignalsElements,
  ) {}

  public add(layerUuid: ELayerUUID, element: EAnyElement): void {
    const stored = clone(element);
    this.getContext(layerUuid).elements.push(stored);
    consoleDebug("[EStoreCommandsElements] command 'add' was evaluated", element);
    this.signals["emitList"]({
      operation: EStoreDeltaOperation.ADD,
      layerUuid,
      element: clone(stored),
    });
  }

  public remove(layerUuid: ELayerUUID, uuid: EElementUUID): void {
    const layerContext = this.getContext(layerUuid);
    const index = layerContext.elements.findIndex((element) => element.uuid === uuid);
    if (index === -1) {
      throw new Error(`[EStoreCommandsElements] Element not found: (uuid: ${uuid})`);
    }
    layerContext.elements.splice(index, 1);
    consoleDebug("[EStoreCommandsElements] command 'remove' was evaluated", uuid);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REMOVE, layerUuid, uuid });
  }

  public reorder(layerUuid: ELayerUUID, uuids: EElementUUID[]): void {
    const layerContext = this.getContext(layerUuid);
    const uuidsCopy = clone(uuids);
    layerContext.elements.sort(
      (first, second) => uuidsCopy.indexOf(first.uuid) - uuidsCopy.indexOf(second.uuid),
    );
    consoleDebug("[EStoreCommandsElements] command 'reorder' was evaluated", uuids);
    this.signals["emitList"]({
      operation: EStoreDeltaOperation.REORDER,
      layerUuid,
      uuids: clone(uuidsCopy),
    });
  }

  public writeAnimatedImage(data: PartialExceptUUIDField<EAnimatedImageElement>): void {
    const copy = clone(data);
    const element = this.get<EAnimatedImageElement>(copy.uuid, EElementType.ANIMATED_IMAGE);
    if (copy.name !== undefined) {
      element.name = copy.name;
    }
    if (copy.color !== undefined) {
      element.color = copy.color;
    }
    if (copy.sequence !== undefined) {
      element.sequence = copy.sequence;
    }
    if (copy.frameRate !== undefined) {
      element.frameRate = copy.frameRate;
    }
    if (copy.timeScale !== undefined) {
      element.timeScale = copy.timeScale;
    }
    if (copy.loopMode !== undefined) {
      element.loopMode = copy.loopMode;
    }
    if (copy.playByDefault !== undefined) {
      element.playByDefault = copy.playByDefault;
    }
    consoleDebug("[EStoreCommandsElements] command 'writeAnimatedImage' was evaluated", data);
    this.signals["emitItem"]({ element: clone(element) });
  }

  public writeGraphics(data: PartialExceptUUIDField<EGraphicsElement>): void {
    const copy = clone(data);
    const element = this.get<EGraphicsElement>(copy.uuid, EElementType.GRAPHICS);
    if (copy.name !== undefined) {
      element.name = copy.name;
    }
    if (copy.color !== undefined) {
      element.color = copy.color;
    }
    if (copy.resolution !== undefined) {
      element.resolution = copy.resolution;
    }
    if (copy.drawSequence !== undefined) {
      element.drawSequence = copy.drawSequence;
    }
    consoleDebug("[EStoreCommandsElements] command 'writeGraphics' was evaluated", data);
    this.signals["emitItem"]({ element: clone(element) });
  }

  public writeImage(data: PartialExceptUUIDField<EImageElement>): void {
    const copy = clone(data);
    const element = this.get<EImageElement>(copy.uuid, EElementType.IMAGE);
    if (copy.name !== undefined) {
      element.name = copy.name;
    }
    if (copy.color !== undefined) {
      element.color = copy.color;
    }
    if (copy.texture !== undefined) {
      element.texture = copy.texture;
    }
    consoleDebug("[EStoreCommandsElements] command 'writeImage' was evaluated", data);
    this.signals["emitItem"]({ element: clone(element) });
  }

  public writeNineSlice(data: PartialExceptUUIDField<ENineSliceElement>): void {
    const copy = clone(data);
    const element = this.get<ENineSliceElement>(copy.uuid, EElementType.NINE_SLICE);
    if (copy.name !== undefined) {
      element.name = copy.name;
    }
    if (copy.color !== undefined) {
      element.color = copy.color;
    }
    if (copy.texture !== undefined) {
      element.texture = copy.texture;
    }
    if (copy.sliceBorders !== undefined) {
      element.sliceBorders = copy.sliceBorders;
    }
    if (copy.sliceRegions !== undefined) {
      element.sliceRegions = copy.sliceRegions;
    }
    if (copy.regionMode !== undefined) {
      element.regionMode = copy.regionMode;
    }
    consoleDebug("[EStoreCommandsElements] command 'writeNineSlice' was evaluated", data);
    this.signals["emitItem"]({ element: clone(element) });
  }

  public writeProgress(data: PartialExceptUUIDField<EProgressElement>): void {
    const copy = clone(data);
    const element = this.get<EProgressElement>(copy.uuid, EElementType.PROGRESS);
    if (copy.name !== undefined) {
      element.name = copy.name;
    }
    if (copy.color !== undefined) {
      element.color = copy.color;
    }
    if (copy.texture !== undefined) {
      element.texture = copy.texture;
    }
    if (copy.maskFunction !== undefined) {
      element.maskFunction = copy.maskFunction;
    }
    if (copy.progress !== undefined) {
      element.progress = copy.progress;
    }
    consoleDebug("[EStoreCommandsElements] command 'writeProgress' was evaluated", data);
    this.signals["emitItem"]({ element: clone(element) });
  }

  public writeScene(data: PartialExceptUUIDField<ESceneElement>): void {
    const copy = clone(data);
    const element = this.get<ESceneElement>(copy.uuid, EElementType.SCENE);
    if (copy.name !== undefined) {
      element.name = copy.name;
    }
    if (copy.color !== undefined) {
      element.color = copy.color;
    }
    if (copy.updateMode !== undefined) {
      element.updateMode = copy.updateMode;
    }
    if (copy.resolutionFactor !== undefined) {
      element.resolutionFactor = copy.resolutionFactor;
    }
    if (copy.clearColor !== undefined) {
      element.clearColor = copy.clearColor;
    }
    if (copy.enableDepthBuffer !== undefined) {
      element.enableDepthBuffer = copy.enableDepthBuffer;
    }
    consoleDebug("[EStoreCommandsElements] command 'writeScene' was evaluated", data);
    this.signals["emitItem"]({ element: clone(element) });
  }

  public writeText(data: PartialExceptUUIDField<ETextElement>): void {
    const copy = clone(data);
    const element = this.get<ETextElement>(copy.uuid, EElementType.TEXT);
    if (copy.name !== undefined) {
      element.name = copy.name;
    }
    if (copy.color !== undefined) {
      element.color = copy.color;
    }
    if (copy.content !== undefined) {
      element.content = copy.content;
    }
    if (copy.resizeMode !== undefined) {
      element.resizeMode = copy.resizeMode;
    }
    if (copy.maxLineWidth !== undefined) {
      element.maxLineWidth = copy.maxLineWidth;
    }
    consoleDebug("[EStoreCommandsElements] command 'writeText' was evaluated", data);
    this.signals["emitItem"]({ element: clone(element) });
  }

  private getContext(layerUuid: ELayerUUID): ELayerContext {
    const layerContext = this.data.layerContexts.find(
      (context) => context.layer.uuid === layerUuid,
    );
    if (!layerContext) {
      throw new Error(`[EStoreCommandsElements] Layer not found: (uuid: ${layerUuid})`);
    }
    return layerContext;
  }

  private get<T extends EAnyElement>(uuid: EElementUUID, type: EElementType): T {
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
