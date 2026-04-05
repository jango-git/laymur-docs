import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import type { EAnyAsset } from "../types.assets";
import type { EAssetUUID } from "../types.misc";
import type { EStoreDeltaOperation } from "./index";

export type EStoreDeltaAssets =
  | { operation: EStoreDeltaOperation.ADD; asset: EAnyAsset }
  | { operation: EStoreDeltaOperation.REMOVE; uuid: EAssetUUID }
  | { operation: EStoreDeltaOperation.REORDER; uuids: EAssetUUID[] };

export interface EStoreDeltaAsset {
  asset: EAnyAsset;
}

export class EStoreSignalsAssets {
  private readonly listInternal = new Ferrsign1<EStoreDeltaAssets>();
  private readonly itemInternal = new Ferrsign1<EStoreDeltaAsset>();

  public get list(): FerrsignView1<EStoreDeltaAssets> {
    return this.listInternal;
  }

  public get item(): FerrsignView1<EStoreDeltaAsset> {
    return this.itemInternal;
  }

  protected emitList(delta: EStoreDeltaAssets): void {
    this.listInternal.emit(delta);
  }

  protected emitItem(delta: EStoreDeltaAsset): void {
    this.itemInternal.emit(delta);
  }
}
