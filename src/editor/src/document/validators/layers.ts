import type { EDocument, ELayerContext } from "../types";

interface EValidateFullscreenBuilderError {
  message: string;
  field: "name";
}

export class EStoreValidatorsLayers {
  constructor(private readonly data: EDocument) {}

  public validateFullscreenBuilder(name?: string): EValidateFullscreenBuilderError | undefined {
    if (name === undefined || name === "") {
      return { message: "Name is required", field: "name" };
    }

    if (!this.isUniqueLayerName(name)) {
      return { message: "Name is already in use", field: "name" };
    }
  }

  private isUniqueLayerName(name: string): boolean {
    return this.data.layerContexts.every(
      (layerContext: ELayerContext) => layerContext.layer.name !== name,
    );
  }
}
