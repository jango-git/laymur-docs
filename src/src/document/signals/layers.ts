import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { consoleDebug } from "../../miscellaneous/debug.print";
import type { ELayerContext } from "../types";
import type { EAnyLayer } from "../types.layers";
import type { ELayerUUID } from "../types.misc";
import type { EStoreDeltaOperation } from "./index";

export type EStoreDeltaLayerList =
  | { operation: EStoreDeltaOperation.ADD; layerContext: ELayerContext }
  | { operation: EStoreDeltaOperation.REMOVE; uuid: ELayerUUID }
  | { operation: EStoreDeltaOperation.REORDER; uuids: ELayerUUID[] };

export interface EStoreDeltaLayer {
  layer: EAnyLayer;
}

export class EStoreSignalsLayers {
  private readonly listInternal = new Ferrsign1<EStoreDeltaLayerList>();
  private readonly itemInternal = new Ferrsign1<EStoreDeltaLayer>();

  public get list(): FerrsignView1<EStoreDeltaLayerList> {
    return this.listInternal;
  }

  public get item(): FerrsignView1<EStoreDeltaLayer> {
    return this.itemInternal;
  }

  protected emitList(delta: EStoreDeltaLayerList): void {
    consoleDebug(`[EStoreSignalsLayers] emit list:`, delta);
    this.listInternal.emit(delta);
  }

  protected emitItem(delta: EStoreDeltaLayer): void {
    consoleDebug(`[EStoreSignalsLayers] emit item:`, delta);
    this.itemInternal.emit(delta);
  }
}
