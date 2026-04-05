import type { EStoreSignalsLayers } from "../signals";
import { EStoreDeltaOperation } from "../signals";
import type { EDocument, ELayerContext, PartialExceptUUID } from "../types";
import { clone } from "../types";
import type { ELayerFullscreen } from "../types.layers";
import { ELayerType } from "../types.layers";
import type { ELayerUUID } from "../types.misc";

export class EStoreCommandsLayers {
  constructor(
    private readonly data: EDocument,
    private readonly signals: EStoreSignalsLayers,
  ) {}

  public add(layerContext: ELayerContext): void {
    this.data.layerContexts.push(layerContext);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.ADD, layerContext });
  }

  public remove(uuid: ELayerUUID): void {
    const index = this.data.layerContexts.findIndex((c) => c.layer.uuid === uuid);
    if (index === -1) {
      throw new Error(`[EStoreCommandsLayers] Layer not found: (uuid: ${uuid})`);
    }
    this.data.layerContexts.splice(index, 1);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REMOVE, uuid });
  }

  public reorder(uuids: ELayerUUID[]): void {
    this.data.layerContexts.sort(
      (a, b) => uuids.indexOf(a.layer.uuid) - uuids.indexOf(b.layer.uuid),
    );
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REORDER, uuids });
  }

  public writeFullscreen(data: PartialExceptUUID<ELayerFullscreen>): void {
    const layerContext = this.getContext(data.uuid);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (layerContext.layer.type !== ELayerType.FULLSCREEN) {
      throw new Error(`[EStoreCommandsLayers] Layer type mismatch: (uuid: ${data.uuid})`);
    }
    const layer = layerContext.layer;
    if (data.name !== undefined) {
      layer.name = data.name;
    }
    if (data.resizePolicy !== undefined) {
      layer.resizePolicy = data.resizePolicy;
    }
    if (data.resizePolicyParameters !== undefined) {
      layer.resizePolicyParameters = clone(data.resizePolicyParameters);
    }
    this.signals["emitItem"]({ layer });
  }

  private getContext(uuid: ELayerUUID): ELayerContext {
    const layerContext = this.data.layerContexts.find((c) => c.layer.uuid === uuid);
    if (!layerContext) {
      throw new Error(`[EStoreCommandsLayers] Layer not found: (uuid: ${uuid})`);
    }
    return layerContext;
  }
}
