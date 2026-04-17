import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { consoleDebug } from "../../miscellaneous/debug.print";
import type { EAnyElement } from "../types.elements";
import type { UUID } from "../types.misc";
import type { EStoreDeltaOperation } from "./index";

export type EStoreDeltaElements =
  | { operation: EStoreDeltaOperation.ADD; layerUuid: UUID; element: EAnyElement }
  | { operation: EStoreDeltaOperation.REMOVE; layerUuid: UUID; uuid: UUID }
  | { operation: EStoreDeltaOperation.REORDER; layerUuid: UUID; uuids: UUID[] };

export interface EStoreDeltaElement {
  element: EAnyElement;
}

export class EStoreSignalsElements {
  private readonly listInternal = new Ferrsign1<EStoreDeltaElements>();
  private readonly itemInternal = new Ferrsign1<EStoreDeltaElement>();

  public get list(): FerrsignView1<EStoreDeltaElements> {
    return this.listInternal;
  }

  public get item(): FerrsignView1<EStoreDeltaElement> {
    return this.itemInternal;
  }

  protected emitList(delta: EStoreDeltaElements): void {
    consoleDebug(`[EStoreSignalsElements] emit list:`, delta);
    this.listInternal.emit(delta);
  }

  protected emitItem(delta: EStoreDeltaElement): void {
    consoleDebug(`[EStoreSignalsElements] emit item:`, delta);
    this.itemInternal.emit(delta);
  }
}
