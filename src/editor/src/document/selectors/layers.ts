import type { EDocument, ELayerContext } from "../types";
import { clone } from "../types";
import type { EAnyLayer } from "../types.layers";
import type { ELayerUUID } from "../types.misc";

export class EStoreSelectorsLayers {
  constructor(private readonly data: EDocument) {}

  public selectAllContexts(): ELayerContext[] | undefined {
    return this.data.layerContexts.length > 0 ? clone(this.data.layerContexts) : undefined;
  }

  public selectContext(uuid: ELayerUUID): ELayerContext | undefined {
    const result = this.data.layerContexts.find((c) => c.layer.uuid === uuid);
    return result ? clone(result) : undefined;
  }

  public selectAll(): EAnyLayer[] | undefined {
    const result = this.data.layerContexts.map(({ layer }) => layer);
    return result.length > 0 ? clone(result) : undefined;
  }

  public select(uuid: ELayerUUID): EAnyLayer | undefined {
    const result = this.data.layerContexts.find((c) => c.layer.uuid === uuid)?.layer;
    return result ? clone(result) : undefined;
  }
}
