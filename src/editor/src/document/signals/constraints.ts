import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { consoleDebug } from "../../miscellaneous/debug.print";
import type { EAnyConstraint } from "../types.constraints";
import type { UUID } from "../types.misc";
import type { EStoreDeltaOperation } from "./index";

export type EStoreDeltaConstraintList =
  | { operation: EStoreDeltaOperation.ADD; layerUuid: UUID; constraint: EAnyConstraint }
  | { operation: EStoreDeltaOperation.REMOVE; layerUuid: UUID; uuid: UUID }
  | { operation: EStoreDeltaOperation.REORDER; layerUuid: UUID; uuids: UUID[] };

export interface EStoreDeltaConstraint {
  constraint: EAnyConstraint;
}

export class EStoreSignalsConstraints {
  private readonly listInternal = new Ferrsign1<EStoreDeltaConstraintList>();
  private readonly itemInternal = new Ferrsign1<EStoreDeltaConstraint>();

  public get list(): FerrsignView1<EStoreDeltaConstraintList> {
    return this.listInternal;
  }

  public get item(): FerrsignView1<EStoreDeltaConstraint> {
    return this.itemInternal;
  }

  protected emitList(delta: EStoreDeltaConstraintList): void {
    consoleDebug(`[EStoreSignalsConstraints] emit list:`, delta);
    this.listInternal.emit(delta);
  }

  protected emitItem(delta: EStoreDeltaConstraint): void {
    consoleDebug(`[EStoreSignalsConstraints] emit item:`, delta);
    this.itemInternal.emit(delta);
  }
}
