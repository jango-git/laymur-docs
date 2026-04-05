import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EStoreCommands } from "./commands";
import { EStoreSelectors } from "./selectors";
import { EStoreSignals } from "./signals";
import type { EDocument } from "./types";
import type { ELayerUUID } from "./types.misc";
import { EStoreValidators } from "./validators";

export class EStore {
  public readonly signals: EStoreSignals;
  public readonly commands: EStoreCommands;
  public readonly selectors: EStoreSelectors;
  public readonly validators: EStoreValidators;

  private readonly data: EDocument = { assets: [], layerContexts: [] };
  private currentLayerUuidInternal?: ELayerUUID;
  private readonly signalCurrentLayerChangedInternal = new Ferrsign1<ELayerUUID | undefined>();

  constructor() {
    this.signals = new EStoreSignals();
    this.commands = new EStoreCommands(this.data, this.signals);
    this.selectors = new EStoreSelectors(this.data);
    this.validators = new EStoreValidators(this.data);
  }

  public get currentLayerUuid(): ELayerUUID | undefined {
    return this.currentLayerUuidInternal;
  }

  public get currentLayerChanged(): FerrsignView1<ELayerUUID | undefined> {
    return this.signalCurrentLayerChangedInternal;
  }

  public setCurrentLayer(uuid: ELayerUUID | undefined): void {
    if (this.currentLayerUuidInternal !== uuid) {
      this.currentLayerUuidInternal = uuid;
      this.signalCurrentLayerChangedInternal.emit(uuid);
    }
  }
}

export const STORE = new EStore();
