import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { consoleDebug } from "../../miscellaneous/debug.print";
import type { EDocument } from "../types";
import { EStoreSignalsAssets } from "./assets";
import { EStoreSignalsConstraints } from "./constraints";
import { EStoreSignalsElements } from "./elements";
import { EStoreSignalsLayers } from "./layers";

export enum EStoreDeltaOperation {
  ADD = "ADD",
  REMOVE = "REMOVE",
  REORDER = "REORDER",
}

export class EStoreSignals {
  public readonly assets = new EStoreSignalsAssets();
  public readonly layers = new EStoreSignalsLayers();
  public readonly elements = new EStoreSignalsElements();
  public readonly constraints = new EStoreSignalsConstraints();

  private readonly setupInternal = new Ferrsign1<EDocument>();

  public get setup(): FerrsignView1<EDocument> {
    return this.setupInternal;
  }

  protected emitSetup(document: EDocument): void {
    consoleDebug(`[EStoreSignals] emit setup:`, document);
    this.setupInternal.emit(document);
  }
}
