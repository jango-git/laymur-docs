import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import type { EAnyConstraint } from "../types.constraints";
import type { EConstraintUuid, ELayerUuid } from "../types.misc";
import type { EStoreDeltaOperation } from "./index";

export type EStoreDeltaConstraints =
  | { operation: EStoreDeltaOperation.ADD; layerUuid: ELayerUuid; constraint: EAnyConstraint }
  | { operation: EStoreDeltaOperation.REMOVE; layerUuid: ELayerUuid; uuid: EConstraintUuid }
  | { operation: EStoreDeltaOperation.REORDER; layerUuid: ELayerUuid; uuids: EConstraintUuid[] };

export interface EStoreDeltaConstraint {
  constraint: EAnyConstraint;
}

export class EStoreSignalsConstraints {
  private readonly listInternal = new Ferrsign1<EStoreDeltaConstraints>();
  private readonly itemInternal = new Ferrsign1<EStoreDeltaConstraint>();

  public get list(): FerrsignView1<EStoreDeltaConstraints> {
    return this.listInternal;
  }

  public get item(): FerrsignView1<EStoreDeltaConstraint> {
    return this.itemInternal;
  }

  protected emitList(delta: EStoreDeltaConstraints): void {
    this.listInternal.emit(delta);
  }

  protected emitItem(delta: EStoreDeltaConstraint): void {
    this.itemInternal.emit(delta);
  }
}
