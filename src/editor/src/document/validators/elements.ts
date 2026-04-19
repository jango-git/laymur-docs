import type { EDocument, ELayerContext } from "../types";
import type { EFontAsset, EImageAsset } from "../types.assets";
import { EAssetType } from "../types.assets";
import type {
  EAnimatedImageElement,
  EGraphicsElement,
  EImageElement,
  ENineSliceElement,
  EProgressElement,
  ESceneElement,
  ETextElement,
} from "../types.elements";
import type {
  EAnyGraphicsDrawCommand,
  EAssetUUID,
  EColor,
  ELayerUUID,
  ETextChunk,
} from "../types.misc";
import { EGraphicsDrawCommandType } from "../types.misc";
import {
  isValidHexColor,
  isValidName,
  isValidNonNegativeNumber,
  isValidNormalizedNumber,
  isValidNumber,
  isValidPositiveNumber,
} from "./miscellaneous";

export interface EAnimatedImageElementError {
  message: string;
  field:
    | "layer"
    | "name"
    | "sequence"
    | "color"
    | "frameRate"
    | "timeScale"
    | "loopMode"
    | "playByDefault";
}

export interface EGraphicsElementError {
  message: string;
  field: "layer" | "name" | "color" | "resolution" | "drawSequence";
}

export interface EImageElementError {
  message: string;
  field: "layer" | "name" | "texture" | "color";
}

export interface ENineSliceElementError {
  message: string;
  field: "layer" | "name" | "texture" | "color" | "sliceBorders" | "sliceRegions" | "regionMode";
}

export interface EProgressElementError {
  message: string;
  field: "layer" | "name" | "texture" | "color" | "maskFunction" | "progress";
}

export interface ESceneElementError {
  message: string;
  field:
    | "layer"
    | "name"
    | "color"
    | "updateMode"
    | "resolutionFactor"
    | "clearColor"
    | "enableDepthBuffer";
}

export interface ETextElementError {
  message: string;
  field: "layer" | "name" | "color" | "content" | "resizeMode" | "maxLineWidth";
}

export class EStoreValidatorsElements {
  constructor(private readonly data: EDocument) {}

  public animatedImage(
    layer: ELayerUUID | undefined,
    element: Partial<Omit<EAnimatedImageElement, "type">>,
    softValidation = false,
  ): EAnimatedImageElementError | undefined {
    if (layer === undefined) {
      return { message: "layer is required", field: "layer" };
    }
    const layerContext = this.getLayerContext(layer);
    if (layerContext === undefined) {
      return { message: `layer with UUID ${layer} must exist`, field: "layer" };
    }

    const nameError = this.validateElementName(layerContext, element.name);
    if (nameError !== undefined) {
      return nameError;
    }

    if (element.sequence === undefined) {
      return { message: "sequence is required", field: "sequence" };
    }
    for (const textureUuid of element.sequence) {
      if (!this.isImageAssetExists(textureUuid)) {
        return { message: `texture with UUID ${textureUuid} must exist`, field: "sequence" };
      }
    }

    if (softValidation) {
      return undefined;
    }

    if (element.color === undefined) {
      return { message: "color is required", field: "color" };
    }
    if (!this.isValidColor(element.color)) {
      return { message: "color is not valid", field: "color" };
    }

    if (element.frameRate === undefined) {
      return { message: "frameRate is required", field: "frameRate" };
    }
    if (!isValidPositiveNumber(element.frameRate)) {
      return { message: "frameRate must be a positive number", field: "frameRate" };
    }

    if (element.timeScale === undefined) {
      return { message: "timeScale is required", field: "timeScale" };
    }
    if (!isValidPositiveNumber(element.timeScale)) {
      return { message: "timeScale must be a positive number", field: "timeScale" };
    }

    if (element.loopMode === undefined) {
      return { message: "loopMode is required", field: "loopMode" };
    }

    if (element.playByDefault === undefined) {
      return { message: "playByDefault is required", field: "playByDefault" };
    }
  }

  public graphics(
    layer: ELayerUUID | undefined,
    element: Partial<Omit<EGraphicsElement, "type">>,
    softValidation = false,
  ): EGraphicsElementError | undefined {
    if (layer === undefined) {
      return { message: "layer is required", field: "layer" };
    }
    const layerContext = this.getLayerContext(layer);
    if (layerContext === undefined) {
      return { message: `layer with UUID ${layer} must exist`, field: "layer" };
    }

    const nameError = this.validateElementName(layerContext, element.name);
    if (nameError !== undefined) {
      return nameError;
    }

    if (softValidation) {
      return undefined;
    }

    if (element.color === undefined) {
      return { message: "color is required", field: "color" };
    }
    if (!this.isValidColor(element.color)) {
      return { message: "color is not valid", field: "color" };
    }

    if (element.resolution === undefined) {
      return { message: "resolution is required", field: "resolution" };
    }
    const [resolutionWidth, resolutionHeight] = element.resolution;
    if (!isValidPositiveNumber(resolutionWidth) || !isValidPositiveNumber(resolutionHeight)) {
      return { message: "resolution dimensions must be positive numbers", field: "resolution" };
    }

    if (element.drawSequence === undefined) {
      return { message: "drawSequence is required", field: "drawSequence" };
    }
    for (const command of element.drawSequence) {
      if (!this.isValidDrawCommand(command)) {
        return { message: "drawSequence contains an invalid command", field: "drawSequence" };
      }
    }
  }

  public image(
    layer: ELayerUUID | undefined,
    element: Partial<Omit<EImageElement, "type">>,
    softValidation = false,
  ): EImageElementError | undefined {
    if (layer === undefined) {
      return { message: "layer is required", field: "layer" };
    }
    const layerContext = this.getLayerContext(layer);
    if (layerContext === undefined) {
      return { message: `layer with UUID ${layer} must exist`, field: "layer" };
    }

    const nameError = this.validateElementName(layerContext, element.name);
    if (nameError !== undefined) {
      return nameError;
    }

    if (element.texture === undefined) {
      return { message: "texture is required", field: "texture" };
    }
    if (!this.isImageAssetExists(element.texture)) {
      return { message: `texture with UUID ${element.texture} must exist`, field: "texture" };
    }

    if (softValidation) {
      return undefined;
    }

    if (element.color === undefined) {
      return { message: "color is required", field: "color" };
    }
    if (!this.isValidColor(element.color)) {
      return { message: "color is not valid", field: "color" };
    }
  }

  public nineSlice(
    layer: ELayerUUID | undefined,
    element: Partial<Omit<ENineSliceElement, "type">>,
    softValidation = false,
  ): ENineSliceElementError | undefined {
    if (layer === undefined) {
      return { message: "layer is required", field: "layer" };
    }
    const layerContext = this.getLayerContext(layer);
    if (layerContext === undefined) {
      return { message: `layer with UUID ${layer} must exist`, field: "layer" };
    }

    const nameError = this.validateElementName(layerContext, element.name);
    if (nameError !== undefined) {
      return nameError;
    }

    if (element.texture === undefined) {
      return { message: "texture is required", field: "texture" };
    }
    if (!this.isImageAssetExists(element.texture)) {
      return { message: `texture with UUID ${element.texture} must exist`, field: "texture" };
    }

    if (softValidation) {
      return undefined;
    }

    if (element.color === undefined) {
      return { message: "color is required", field: "color" };
    }
    if (!this.isValidColor(element.color)) {
      return { message: "color is not valid", field: "color" };
    }

    if (element.sliceBorders === undefined) {
      return { message: "sliceBorders is required", field: "sliceBorders" };
    }
    if (element.sliceBorders.some((border) => !isValidPositiveNumber(border))) {
      return { message: "sliceBorders values must be positive numbers", field: "sliceBorders" };
    }

    if (element.sliceRegions === undefined) {
      return { message: "sliceRegions is required", field: "sliceRegions" };
    }
    if (element.sliceRegions.some((region) => !isValidPositiveNumber(region))) {
      return { message: "sliceRegions values must be positive numbers", field: "sliceRegions" };
    }

    if (element.regionMode === undefined) {
      return { message: "regionMode is required", field: "regionMode" };
    }
  }

  public progress(
    layer: ELayerUUID | undefined,
    element: Partial<Omit<EProgressElement, "type">>,
    softValidation = false,
  ): EProgressElementError | undefined {
    if (layer === undefined) {
      return { message: "layer is required", field: "layer" };
    }
    const layerContext = this.getLayerContext(layer);
    if (layerContext === undefined) {
      return { message: `layer with UUID ${layer} must exist`, field: "layer" };
    }

    const nameError = this.validateElementName(layerContext, element.name);
    if (nameError !== undefined) {
      return nameError;
    }

    if (element.texture === undefined) {
      return { message: "texture is required", field: "texture" };
    }
    if (!this.isImageAssetExists(element.texture)) {
      return { message: `texture with UUID ${element.texture} must exist`, field: "texture" };
    }

    if (softValidation) {
      return undefined;
    }

    if (element.color === undefined) {
      return { message: "color is required", field: "color" };
    }
    if (!this.isValidColor(element.color)) {
      return { message: "color is not valid", field: "color" };
    }

    if (element.maskFunction === undefined) {
      return { message: "maskFunction is required", field: "maskFunction" };
    }

    if (element.progress === undefined) {
      return { message: "progress is required", field: "progress" };
    }
    if (!isValidNormalizedNumber(element.progress)) {
      return { message: "progress must be a number between 0 and 1", field: "progress" };
    }
  }

  public scene(
    layer: ELayerUUID | undefined,
    element: Partial<Omit<ESceneElement, "type">>,
    softValidation = false,
  ): ESceneElementError | undefined {
    if (layer === undefined) {
      return { message: "layer is required", field: "layer" };
    }
    const layerContext = this.getLayerContext(layer);
    if (layerContext === undefined) {
      return { message: `layer with UUID ${layer} must exist`, field: "layer" };
    }

    const nameError = this.validateElementName(layerContext, element.name);
    if (nameError !== undefined) {
      return nameError;
    }

    if (softValidation) {
      return undefined;
    }

    if (element.color === undefined) {
      return { message: "color is required", field: "color" };
    }
    if (!this.isValidColor(element.color)) {
      return { message: "color is not valid", field: "color" };
    }

    if (element.updateMode === undefined) {
      return { message: "updateMode is required", field: "updateMode" };
    }

    if (element.resolutionFactor === undefined) {
      return { message: "resolutionFactor is required", field: "resolutionFactor" };
    }
    if (!isValidPositiveNumber(element.resolutionFactor)) {
      return { message: "resolutionFactor must be a positive number", field: "resolutionFactor" };
    }

    if (element.clearColor === undefined) {
      return { message: "clearColor is required", field: "clearColor" };
    }
    if (!this.isValidColor(element.clearColor)) {
      return { message: "clearColor is not valid", field: "clearColor" };
    }

    if (element.enableDepthBuffer === undefined) {
      return { message: "enableDepthBuffer is required", field: "enableDepthBuffer" };
    }
  }

  public text(
    layer: ELayerUUID | undefined,
    element: Partial<Omit<ETextElement, "type">>,
    softValidation = false,
  ): ETextElementError | undefined {
    if (layer === undefined) {
      return { message: "layer is required", field: "layer" };
    }
    const layerContext = this.getLayerContext(layer);
    if (layerContext === undefined) {
      return { message: `layer with UUID ${layer} must exist`, field: "layer" };
    }

    const nameError = this.validateElementName(layerContext, element.name);
    if (nameError !== undefined) {
      return nameError;
    }

    if (softValidation) {
      return undefined;
    }

    if (element.color === undefined) {
      return { message: "color is required", field: "color" };
    }
    if (!this.isValidColor(element.color)) {
      return { message: "color is not valid", field: "color" };
    }

    if (element.content === undefined) {
      return { message: "content is required", field: "content" };
    }
    for (const chunk of element.content) {
      if (!this.isValidTextChunk(chunk)) {
        return { message: "content contains an invalid chunk", field: "content" };
      }
    }

    if (element.resizeMode === undefined) {
      return { message: "resizeMode is required", field: "resizeMode" };
    }

    if (element.maxLineWidth === undefined) {
      return { message: "maxLineWidth is required", field: "maxLineWidth" };
    }
    if (!isValidPositiveNumber(element.maxLineWidth)) {
      return { message: "maxLineWidth must be a positive number", field: "maxLineWidth" };
    }
  }

  private validateElementName(
    layerContext: ELayerContext,
    name: string | undefined,
  ): { message: string; field: "name" } | undefined {
    if (name === undefined || name === "") {
      return { message: "name is required", field: "name" };
    }
    if (!isValidName(name)) {
      return { message: `name "${name}" not valid`, field: "name" };
    }
    if (!this.isElementNameUnique(layerContext, name)) {
      return { message: `name "${name}" is already in use in this layer`, field: "name" };
    }
  }

  private isValidColor(color: EColor): boolean {
    return isValidHexColor(color.color) && isValidNormalizedNumber(color.alpha);
  }

  private isValidDrawCommand(command: EAnyGraphicsDrawCommand): boolean {
    switch (command.type) {
      case EGraphicsDrawCommandType.ARC:
        return (
          isValidNumber(command.x) &&
          isValidNumber(command.y) &&
          isValidPositiveNumber(command.radius) &&
          isValidNumber(command.startAngle) &&
          isValidNumber(command.endAngle) &&
          this.isValidColor(command.color)
        );
      case EGraphicsDrawCommandType.CIRCLE:
        return (
          isValidNumber(command.x) &&
          isValidNumber(command.y) &&
          isValidPositiveNumber(command.radius) &&
          this.isValidColor(command.color)
        );
      case EGraphicsDrawCommandType.POLYLINE:
        return (
          command.points.every(([x, y]) => isValidNumber(x) && isValidNumber(y)) &&
          this.isValidColor(command.color) &&
          isValidPositiveNumber(command.lineWidth)
        );
      case EGraphicsDrawCommandType.RECT:
        return (
          isValidNumber(command.x) &&
          isValidNumber(command.y) &&
          isValidPositiveNumber(command.width) &&
          isValidPositiveNumber(command.height) &&
          this.isValidColor(command.color)
        );
    }
  }

  private isValidTextChunk(chunk: ETextChunk): boolean {
    const style = chunk.style;
    return (
      this.isValidColor(style.color) &&
      this.isFontAssetExists(style.font) &&
      isValidPositiveNumber(style.fontSize) &&
      isValidPositiveNumber(style.lineHeight) &&
      isValidNumber(style.shadowOffsetX) &&
      isValidNumber(style.shadowOffsetY) &&
      isValidNonNegativeNumber(style.shadowBlur) &&
      this.isValidColor(style.shadowColor) &&
      this.isValidColor(style.strokeColor) &&
      isValidPositiveNumber(style.strokeThickness)
    );
  }

  private getLayerContext(layer: ELayerUUID): ELayerContext | undefined {
    return this.data.layerContexts.find((layerContext) => layerContext.layer.uuid === layer);
  }

  private isImageAssetExists(uuid: EAssetUUID): boolean {
    return this.data.assets.some(
      (asset): asset is EImageAsset => asset.uuid === uuid && asset.type === EAssetType.IMAGE,
    );
  }

  private isFontAssetExists(uuid: EAssetUUID): boolean {
    return this.data.assets.some(
      (asset): asset is EFontAsset => asset.uuid === uuid && asset.type === EAssetType.FONT,
    );
  }

  private isElementNameUnique(layerContext: ELayerContext, name: string): boolean {
    return (
      layerContext.elements.every((element) => element.name !== name) &&
      layerContext.constraints.every((constraint) => constraint.name !== name)
    );
  }
}
