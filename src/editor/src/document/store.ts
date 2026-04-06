import { EStoreCommands } from "./commands";
import { EStoreSelectors } from "./selectors";
import { EStoreSignals } from "./signals";
import type { EDocument } from "./types";
import { EStoreValidators } from "./validators";

export class EStore {
  public readonly signals: EStoreSignals;
  public readonly commands: EStoreCommands;
  public readonly selectors: EStoreSelectors;
  public readonly validators: EStoreValidators;

  private readonly data: EDocument = { assets: [], layerContexts: [] };

  constructor() {
    this.signals = new EStoreSignals();
    this.commands = new EStoreCommands(this.data, this.signals);
    this.selectors = new EStoreSelectors(this.data);
    this.validators = new EStoreValidators(this.data);
  }
}

export const STORE = new EStore();
