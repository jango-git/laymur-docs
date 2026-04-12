import type { EDocument, ELayerContext } from "../types";
import type { EElementUuid, ELayerUuid } from "../types.misc";

interface EValidateSingleElementConstraintBuilderError {
  message: string;
  field: "layer" | "element";
}

interface EValidateDualElementConstraintBuilderError {
  message: string;
  field: "layer" | "elementA" | "elementB";
}

export class EStoreValidatorsConstraints {
  constructor(private readonly data: EDocument) {}

  public validateSingleElementConstraintBuilder(
    layer?: ELayerUuid,
    element?: EElementUuid,
  ): EValidateSingleElementConstraintBuilderError | undefined {
    if (layer === undefined) {
      return { message: "Layer is required", field: "layer" };
    }

    if (!this.isLayerContextExists(layer)) {
      return { message: `Layer with UUID ${layer} must exist`, field: "layer" };
    }

    if (element === undefined) {
      return { message: "Element is required", field: "element" };
    }

    if (element === layer) {
      return { message: "Element cannot be a layer", field: "element" };
    }
  }

  public validateDualElementConstraintBuilder(
    layer?: ELayerUuid,
    elementA?: EElementUuid,
    elementB?: EElementUuid,
  ): EValidateDualElementConstraintBuilderError | undefined {
    if (layer === undefined) {
      return { message: "Layer is required", field: "layer" };
    }

    if (!this.isLayerContextExists(layer)) {
      return { message: `Layer with UUID ${layer} must exist`, field: "layer" };
    }

    if (elementA === undefined) {
      return { message: "Element A is required", field: "elementA" };
    }

    if (elementB === undefined) {
      return { message: "Element B is required", field: "elementB" };
    }

    if (elementA === elementB) {
      return { message: "Elements must be different", field: "elementB" };
    }

    if (elementA === layer && elementB === layer) {
      return { message: "Only one element can be the layer", field: "elementB" };
    }
  }

  private isLayerContextExists(layer: ELayerUuid): ELayerContext | undefined {
    return this.data.layerContexts.find((layerContext) => layerContext.layer.uuid === layer);
  }
}
