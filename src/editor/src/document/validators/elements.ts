import type { EDocument, ELayerContext } from "../types";
import type { EImageAsset } from "../types.assets";
import { EAssetType } from "../types.assets";
import type { EAssetUuid, ELayerUuid } from "../types.misc";

interface EValidateAnimatedImageBuilderError {
  message: string;
  field: "layer" | "name" | "sequence";
}

interface EValidateSingleTextureBuilderError {
  message: string;
  field: "layer" | "name" | "texture";
}

interface EValidateBasicBuilderError {
  message: string;
  field: "layer" | "name";
}

export class EStoreValidatorsElements {
  constructor(private readonly data: EDocument) {}

  public validateAnimatedImageBuilder(
    layer?: ELayerUuid,
    name?: string,
    sequence?: EAssetUuid[],
  ): EValidateAnimatedImageBuilderError | undefined {
    if (layer === undefined) {
      return { message: "Layer is required", field: "layer" };
    }

    const layerContext = this.isLayerContextExists(layer);
    if (!layerContext) {
      return { message: `Layer with UUID ${layer} must exist`, field: "layer" };
    }

    if (name === undefined || name === "") {
      return { message: "Name is required", field: "name" };
    }

    if (!this.isElementNameUnique(layerContext, name)) {
      return { message: `Name "${name}" is already in use in this layer.`, field: "name" };
    }

    if (sequence === undefined) {
      return { message: "Textures are required", field: "sequence" };
    }

    for (const texture of sequence) {
      if (!this.isImageAssetExists(texture)) {
        return { message: `Texture with UUID ${texture} must exist`, field: "sequence" };
      }
    }
  }

  public validateGraphicsBuilder(
    layer?: ELayerUuid,
    name?: string,
  ): EValidateBasicBuilderError | undefined {
    return this.validateBasicBuilder(layer, name);
  }

  public validateImageBuilder(
    layer?: ELayerUuid,
    name?: string,
    texture?: EAssetUuid,
  ): EValidateSingleTextureBuilderError | undefined {
    return this.validateSingleTextureBuilder(layer, name, texture);
  }

  public validateNineSliceBuilder(
    layer?: ELayerUuid,
    name?: string,
    texture?: EAssetUuid,
  ): EValidateSingleTextureBuilderError | undefined {
    return this.validateSingleTextureBuilder(layer, name, texture);
  }

  public validateProgressBuilder(
    layer?: ELayerUuid,
    name?: string,
    texture?: EAssetUuid,
  ): EValidateSingleTextureBuilderError | undefined {
    return this.validateSingleTextureBuilder(layer, name, texture);
  }

  public validateSceneBuilder(
    layer?: ELayerUuid,
    name?: string,
  ): EValidateBasicBuilderError | undefined {
    return this.validateBasicBuilder(layer, name);
  }

  public validateTextBuilder(
    layer?: ELayerUuid,
    name?: string,
  ): EValidateBasicBuilderError | undefined {
    return this.validateBasicBuilder(layer, name);
  }

  public validateSingleTextureBuilder(
    layer?: ELayerUuid,
    name?: string,
    texture?: EAssetUuid,
  ): EValidateSingleTextureBuilderError | undefined {
    if (layer === undefined) {
      return { message: "Layer is required", field: "layer" };
    }

    const layerContext = this.isLayerContextExists(layer);
    if (!layerContext) {
      return { message: `Layer with UUID ${layer} must exist`, field: "layer" };
    }

    if (name === undefined || name === "") {
      return { message: "Name is required", field: "name" };
    }

    if (!this.isElementNameUnique(layerContext, name)) {
      return { message: `Name "${name}" is already in use in this layer.`, field: "name" };
    }

    if (texture === undefined) {
      return { message: "Texture is required", field: "texture" };
    }

    if (!this.isImageAssetExists(texture)) {
      return { message: `Texture with UUID ${texture} must exist`, field: "texture" };
    }
  }

  private validateBasicBuilder(
    layer?: ELayerUuid,
    name?: string,
  ): EValidateBasicBuilderError | undefined {
    if (layer === undefined) {
      return { message: "Layer is required", field: "layer" };
    }

    const layerContext = this.isLayerContextExists(layer);
    if (!layerContext) {
      return { message: `Layer with UUID ${layer} must exist`, field: "layer" };
    }

    if (name === undefined || name === "") {
      return { message: "Name is required", field: "name" };
    }

    if (!this.isElementNameUnique(layerContext, name)) {
      return { message: `Name "${name}" is already in use in this layer.`, field: "name" };
    }
  }

  private isLayerContextExists(layer: ELayerUuid): ELayerContext | undefined {
    return this.data.layerContexts.find((layerContext) => layerContext.layer.uuid === layer);
  }

  private isImageAssetExists(texture: EAssetUuid): EImageAsset | undefined {
    return this.data.assets.find(
      (asset) => asset.uuid === texture && asset.type === EAssetType.IMAGE,
    ) as EImageAsset | undefined;
  }

  private isElementNameUnique(layerContext: ELayerContext, name: string): boolean {
    return (
      layerContext.elements.every((element) => element.name !== name) &&
      layerContext.constraints.every((constraint) => constraint.name !== name)
    );
  }
}
