import type { EStoreSignals } from "../signals";
import type { EDocument } from "../types";
import { EStoreCommandsAssets } from "./assets";
import { EStoreCommandsConstraints } from "./constraints";
import { EStoreCommandsDebug } from "./debug";
import { EStoreCommandsElements } from "./elements";
import { EStoreCommandsLayers } from "./layers";

export class EStoreCommands {
  public readonly assets: EStoreCommandsAssets;
  public readonly layers: EStoreCommandsLayers;
  public readonly elements: EStoreCommandsElements;
  public readonly constraints: EStoreCommandsConstraints;
  public readonly debug: EStoreCommandsDebug;

  constructor(data: EDocument, signals: EStoreSignals) {
    this.assets = new EStoreCommandsAssets(data, signals.assets);
    this.layers = new EStoreCommandsLayers(data, signals.layers);
    this.elements = new EStoreCommandsElements(data, signals.elements);
    this.constraints = new EStoreCommandsConstraints(data, signals.constraints);
    this.debug = new EStoreCommandsDebug(data, signals.debug);
  }
}
