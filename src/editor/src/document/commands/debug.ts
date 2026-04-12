import type { EStoreSignalsDebug } from "../signals";
import type { EDocument } from "../types";
import type { ELayerDebug } from "../types.debug";
import type { UUID } from "../types.misc";

export class EStoreCommandsDebug {
  constructor(
    private readonly data: EDocument,
    private readonly signals: EStoreSignalsDebug,
  ) {}

  public write(layerUuid: UUID, debug: ELayerDebug): void {
    const layerContext = this.data.layerContexts.find((c) => c.layer.uuid === layerUuid);
    if (!layerContext) {
      throw new Error(`[EStoreCommandsDebug] Layer not found: (uuid: ${layerUuid})`);
    }
    layerContext.debug = debug;
    this.signals["emit"]({ layerUuid, debug });
  }
}
