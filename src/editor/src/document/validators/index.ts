import type { EDocument } from "../types";
import { EStoreValidatorsLayers } from "./layers";

export class EStoreValidators {
  public readonly layers: EStoreValidatorsLayers;

  constructor(data: EDocument) {
    this.layers = new EStoreValidatorsLayers(data);
  }
}
