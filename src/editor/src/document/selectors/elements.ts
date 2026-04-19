import type { EDocument } from "../types";
import { clone } from "../types";
import type { EAnyElement } from "../types.elements";
import type { EElementUUID, ELayerUUID } from "../types.misc";

export class EStoreSelectorsElements {
  constructor(private readonly data: EDocument) {}

  public selectAll(layerUuid: ELayerUUID): EAnyElement[] {
    const layerContext = this.data.layerContexts.find(
      (context) => context.layer.uuid === layerUuid,
    );
    return layerContext && layerContext.elements.length > 0 ? clone(layerContext.elements) : [];
  }

  public select(uuid: EElementUUID): EAnyElement | undefined {
    for (const { elements } of this.data.layerContexts) {
      const result = elements.find((element) => element.uuid === uuid);
      if (result) {
        return clone(result);
      }
    }
    return undefined;
  }
}
