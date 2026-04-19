import { consoleDebug } from "../../miscellaneous/debug.print";
import type { EStoreSignals } from "../signals";
import type { EDocument } from "../types";
import { clone } from "../types";
import { EStoreCommandsAssets } from "./assets";
import { EStoreCommandsConstraints } from "./constraints";
import { EStoreCommandsElements } from "./elements";
import { EStoreCommandsLayers } from "./layers";

export class EStoreCommands {
  public readonly assets: EStoreCommandsAssets;
  public readonly layers: EStoreCommandsLayers;
  public readonly elements: EStoreCommandsElements;
  public readonly constraints: EStoreCommandsConstraints;

  constructor(
    private readonly data: EDocument,
    private readonly signals: EStoreSignals,
  ) {
    this.assets = new EStoreCommandsAssets(data, signals.assets);
    this.layers = new EStoreCommandsLayers(data, signals.layers);
    this.elements = new EStoreCommandsElements(data, signals.elements);
    this.constraints = new EStoreCommandsConstraints(data, signals.constraints);
  }

  public setup(document: EDocument): void {
    this.data.assets = clone(document.assets);
    this.data.layerContexts = clone(document.layerContexts);
    consoleDebug("[EStoreCommands] command 'setup' was evaluated", document);
    this.signals["emitSetup"](clone(document));
  }
}
