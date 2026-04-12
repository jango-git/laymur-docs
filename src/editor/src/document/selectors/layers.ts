import type { EDocument, ELayerContext } from "../types";
import { clone } from "../types";
import type { EAnyLayer } from "../types.layers";
import type { UUID } from "../types.misc";

export class EStoreSelectorsLayers {
  constructor(private readonly data: EDocument) {}

  public selectAllContexts(): ELayerContext[] {
    return clone(this.data.layerContexts);
  }

  public selectContext(uuid: UUID): ELayerContext | undefined {
    const result = this.data.layerContexts.find((context) => context.layer.uuid === uuid);
    return result ? clone(result) : undefined;
  }

  public selectAll(): EAnyLayer[] {
    return clone(this.data.layerContexts.map(({ layer }) => layer));
  }

  public select(uuid: UUID): EAnyLayer | undefined {
    const result = this.data.layerContexts.find((context) => context.layer.uuid === uuid)?.layer;
    return result ? clone(result) : undefined;
  }

  public selectOwner(childUuid: UUID): EAnyLayer | undefined {
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
