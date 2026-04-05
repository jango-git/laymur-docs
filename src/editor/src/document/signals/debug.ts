import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import type { ELayerDebug } from "../types.debug";
import type { ELayerUUID } from "../types.misc";

export interface EStoreDeltaDebug {
  layerUuid: ELayerUUID;
  debug: ELayerDebug;
}

export class EStoreSignalsDebug {
  private readonly signalInternal = new Ferrsign1<EStoreDeltaDebug>();

  public get signal(): FerrsignView1<EStoreDeltaDebug> {
    return this.signalInternal;
  }

  protected emit(delta: EStoreDeltaDebug): void {
    this.signalInternal.emit(delta);
  }
}
