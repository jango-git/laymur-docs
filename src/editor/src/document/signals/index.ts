export enum EStoreDeltaOperation {
  ADD = "ADD",
  REMOVE = "REMOVE",
  REORDER = "REORDER",
}

export { EStoreDeltaAsset, EStoreDeltaAssets, EStoreSignalsAssets } from "./assets";
export {
  EStoreDeltaConstraint,
  EStoreDeltaConstraints,
  EStoreSignalsConstraints,
} from "./constraints";
export { EStoreDeltaDebug, EStoreSignalsDebug } from "./debug";
export { EStoreDeltaElement, EStoreDeltaElements, EStoreSignalsElements } from "./elements";
export { EStoreDeltaLayer, EStoreDeltaLayers, EStoreSignalsLayers } from "./layers";

import { EStoreSignalsAssets } from "./assets";
import { EStoreSignalsConstraints } from "./constraints";
import { EStoreSignalsDebug } from "./debug";
import { EStoreSignalsElements } from "./elements";
import { EStoreSignalsLayers } from "./layers";

export class EStoreSignals {
  public readonly assets = new EStoreSignalsAssets();
  public readonly layers = new EStoreSignalsLayers();
  public readonly elements = new EStoreSignalsElements();
  public readonly constraints = new EStoreSignalsConstraints();
  public readonly debug = new EStoreSignalsDebug();
}
