import type { EDocument, ELayerContext } from "../types";
import { clone } from "../types";
import type { UUID } from "../types.misc";
import { EStoreSelectorsAssets } from "./assets";
import { EStoreSelectorsConstraints } from "./constraints";
import { EStoreSelectorsElements } from "./elements";
import { EStoreSelectorsLayers } from "./layers";

export class EStoreSelectors {
  public readonly assets: EStoreSelectorsAssets;
  public readonly layers: EStoreSelectorsLayers;
  public readonly elements: EStoreSelectorsElements;
  public readonly constraints: EStoreSelectorsConstraints;

  constructor(private readonly data: EDocument) {
    this.assets = new EStoreSelectorsAssets(data);
    this.layers = new EStoreSelectorsLayers(data);
    this.elements = new EStoreSelectorsElements(data);
    this.constraints = new EStoreSelectorsConstraints(data);
  }

  public all(): EDocument {
    return clone(this.data);
  }

  public ownerLayerContext(childUuid: UUID): ELayerContext | undefined {
    const result = this.data.layerContexts.find(
      (layerContext) =>
        layerContext.elements.some((element) => element.uuid === childUuid) ||
        layerContext.constraints.some((constraint) => constraint.uuid === childUuid),
    );
    return result ? clone(result) : undefined;
  }
}
