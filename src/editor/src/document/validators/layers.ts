import type { EDocument } from "../types";
import type { ELayerUUID } from "../types.misc";

export class EStoreValidatorsLayers {
  constructor(private readonly data: EDocument) {}

  public uniqueLayerName(name: string): string[] | undefined {
    const errors: string[] = [];
    if (this.data.layerContexts.some((c) => c.layer.name === name)) {
      errors.push(`Layer name "${name}" is already in use.`);
    }
    return errors.length > 0 ? errors : undefined;
  }

  public uniqueChildName(layerUuid: ELayerUUID, name: string): string[] | undefined {
    const layerContext = this.data.layerContexts.find((c) => c.layer.uuid === layerUuid);
    if (!layerContext) {
      throw new Error(`[EStoreValidatorsLayers] Layer not found: (uuid: ${layerUuid})`);
    }
    const errors: string[] = [];
    if (
      layerContext.elements.some((e) => e.name === name) ||
      layerContext.constraints.some((c) => c.name === name)
    ) {
      errors.push(`Name "${name}" is already in use in this layer.`);
    }
    return errors.length > 0 ? errors : undefined;
  }
}
