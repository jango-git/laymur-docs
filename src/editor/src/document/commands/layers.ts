import type { EStoreSignalsLayers } from "../signals";
import { EStoreDeltaOperation } from "../signals";
import type { EDocument, ELayerContext, PartialExceptUUIDField } from "../types";
import { clone } from "../types";
import type { ELayerFullscreen } from "../types.layers";
import { ELayerType } from "../types.layers";
import type { UUID } from "../types.misc";

export class EStoreCommandsLayers {
  constructor(
    private readonly data: EDocument,
    private readonly signals: EStoreSignalsLayers,
  ) {}

  public add(layerContext: ELayerContext): void {
    const stored = clone(layerContext);
    this.data.layerContexts.push(stored);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.ADD, layerContext: clone(stored) });
  }

  public remove(uuid: UUID): void {
    const index = this.data.layerContexts.findIndex((context) => context.layer.uuid === uuid);
    if (index === -1) {
      throw new Error(`[EStoreCommandsLayers] Layer not found: (uuid: ${uuid})`);
    }
    this.data.layerContexts.splice(index, 1);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REMOVE, uuid });
  }

  public reorder(uuids: UUID[]): void {
    const uuidsCopy = clone(uuids);
    this.data.layerContexts.sort(
      (first, second) => uuidsCopy.indexOf(first.layer.uuid) - uuidsCopy.indexOf(second.layer.uuid),
    );
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REORDER, uuids: clone(uuidsCopy) });
  }

  public writeFullscreen(data: PartialExceptUUIDField<ELayerFullscreen>): void {
    const copy = clone(data);
    const layerContext = this.getContext(copy.uuid);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (layerContext.layer.type !== ELayerType.FULLSCREEN) {
      throw new Error(`[EStoreCommandsLayers] Layer type mismatch: (uuid: ${copy.uuid})`);
    }
    const layer = layerContext.layer;
    if (copy.name !== undefined) {
      layer.name = copy.name;
    }
    if (copy.resizePolicy !== undefined) {
      layer.resizePolicy = copy.resizePolicy;
    }
    if (copy.resizePolicyParameters !== undefined) {
      layer.resizePolicyParameters = copy.resizePolicyParameters;
    }
    this.signals["emitItem"]({ layer: clone(layer) });
  }

  private getContext(uuid: UUID): ELayerContext {
    const layerContext = this.data.layerContexts.find((context) => context.layer.uuid === uuid);
    if (!layerContext) {
      throw new Error(`[EStoreCommandsLayers] Layer not found: (uuid: ${uuid})`);
    }
    return layerContext;
  }
}
