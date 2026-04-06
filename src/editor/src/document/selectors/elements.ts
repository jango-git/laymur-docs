import type { EDocument } from "../types";
import { clone } from "../types";
import type { EAnyElement } from "../types.elements";
import type { EElementUuid, ELayerUuid } from "../types.misc";

export class EStoreSelectorsElements {
  constructor(private readonly data: EDocument) {}

  public selectAll(layerUuid: ELayerUuid): EAnyElement[] {
    const layerContext = this.data.layerContexts.find((c) => c.layer.uuid === layerUuid);
    return layerContext && layerContext.elements.length > 0 ? clone(layerContext.elements) : [];
  }

  public select(uuid: EElementUuid): EAnyElement | undefined {
    for (const { elements } of this.data.layerContexts) {
      const result = elements.find((e) => e.uuid === uuid);
      if (result) {
        return clone(result);
      }
    }
    return undefined;
  }
}
