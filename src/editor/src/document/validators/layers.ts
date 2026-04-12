import type { EDocument, ELayerContext } from "../types";
import type { ELayerFullscreen } from "../types.layers";
import { isValidName, isValidPositiveNumber } from "./miscellaneous";

export interface EFullscreenLayerError {
  message: string;
  field: "name" | "resizePolicy" | "resizePolicyParameters";
}

export class EStoreValidatorsLayers {
  constructor(private readonly data: EDocument) {}

  public fullscreen(
    layer: Partial<Omit<ELayerFullscreen, "type">>,
    fullValidation: boolean,
  ): EFullscreenLayerError | undefined {
    if (layer.name === undefined || layer.name === "") {
      return { message: "name is required", field: "name" };
    }
    if (!isValidName(layer.name)) {
      return { message: `name "${layer.name}" not valid`, field: "name" };
    }
    if (!this.isLayerNameUnique(layer.name)) {
      return { message: `name "${layer.name}" is already in use`, field: "name" };
    }
    if (layer.resizePolicy === undefined) {
      return { message: "resizePolicy is required", field: "resizePolicy" };
    }
    if (layer.resizePolicyParameters === undefined) {
      return { message: "resizePolicyParameters is required", field: "resizePolicyParameters" };
    }

    if (fullValidation) {
      return undefined;
    }

    const [parameterA, parameterB] = layer.resizePolicyParameters;
    if (!isValidPositiveNumber(parameterA) || !isValidPositiveNumber(parameterB)) {
      return {
        message: "resizePolicyParameters must be positive numbers",
        field: "resizePolicyParameters",
      };
    }
  }

  private isLayerNameUnique(name: string): boolean {
    return this.data.layerContexts.every(
      (layerContext: ELayerContext) => layerContext.layer.name !== name,
    );
  }
}
