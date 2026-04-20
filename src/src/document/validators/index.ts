import type { EDocument } from "../types";
import { EStoreValidatorsConstraints } from "./constraints";
import { EStoreValidatorsElements } from "./elements";
import { EStoreValidatorsLayers } from "./layers";

export class EStoreValidators {
  public readonly layers: EStoreValidatorsLayers;
  public readonly elements: EStoreValidatorsElements;
  public readonly constraints: EStoreValidatorsConstraints;

  constructor(data: EDocument) {
    this.layers = new EStoreValidatorsLayers(data);
    this.elements = new EStoreValidatorsElements(data);
    this.constraints = new EStoreValidatorsConstraints(data);
  }
}
