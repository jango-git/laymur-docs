import type { EDocument, ELayerContext } from "../types";
import { clone } from "../types";
import type { EAnyLayer } from "../types.layers";
import type { EChildUuid, ELayerUuid } from "../types.misc";

export class EStoreSelectorsLayers {
  constructor(private readonly data: EDocument) {}

  public selectAllContexts(): ELayerContext[] {
    return clone(this.data.layerContexts);
  }

  public selectContext(uuid: ELayerUuid): ELayerContext | undefined {
    const result = this.data.layerContexts.find((c) => c.layer.uuid === uuid);
    return result ? clone(result) : undefined;
  }

  public selectAll(): EAnyLayer[] {
    return clone(this.data.layerContexts.map(({ layer }) => layer));
  }

  public select(uuid: ELayerUuid): EAnyLayer | undefined {
    const result = this.data.layerContexts.find((c) => c.layer.uuid === uuid)?.layer;
    return result ? clone(result) : undefined;
  }

  public selectOwner(childUuid: EChildUuid): EAnyLayer | undefined {
    for (const context of this.data.layerContexts) {
      for (const element of context.elements) {
        if (element.uuid === childUuid) {
          return clone(context.layer);
        }
      }

      for (const constraint of context.constraints) {
        if (constraint.uuid === childUuid) {
          return clone(context.layer);
        }
      }
    }
  }
}
