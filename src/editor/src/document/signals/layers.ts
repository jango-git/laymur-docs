import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import type { ELayerContext } from "../types";
import type { EAnyLayer } from "../types.layers";
import type { UUID } from "../types.misc";
import type { EStoreDeltaOperation } from "./index";

export type EStoreDeltaLayers =
  | { operation: EStoreDeltaOperation.ADD; layerContext: ELayerContext }
  | { operation: EStoreDeltaOperation.REMOVE; uuid: UUID }
  | { operation: EStoreDeltaOperation.REORDER; uuids: UUID[] };

export interface EStoreDeltaLayer {
  layer: EAnyLayer;
}

export class EStoreSignalsLayers {
  private readonly listInternal = new Ferrsign1<EStoreDeltaLayers>();
  private readonly itemInternal = new Ferrsign1<EStoreDeltaLayer>();

  public get list(): FerrsignView1<EStoreDeltaLayers> {
    return this.listInternal;
  }

  public get item(): FerrsignView1<EStoreDeltaLayer> {
    return this.itemInternal;
  }

  protected emitList(delta: EStoreDeltaLayers): void {
    this.listInternal.emit(delta);
  }

  protected emitItem(delta: EStoreDeltaLayer): void {
    this.itemInternal.emit(delta);
  }
}
