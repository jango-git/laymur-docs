import type { EDocument, ELayerContext } from "../types";
import type {
  EAspectConstraint,
  EHorizontalDistanceConstraint,
  EHorizontalProportionConstraint,
  EHorizontalSizeConstraint,
  EVerticalDistanceConstraint,
  EVerticalProportionConstraint,
  EVerticalSizeConstraint,
} from "../types.constraints";
import type { EElementUUID, ELayerUUID } from "../types.misc";
import { isValidName, isValidPositiveNumber } from "./miscellaneous";

export interface EAspectConstraintError {
  message: string;
  field: "layer" | "element" | "name" | "aspect";
}

export interface ESizeConstraintError {
  message: string;
  field: "layer" | "element" | "name" | "size";
}

export interface EDistanceConstraintError {
  message: string;
  field: "layer" | "elementA" | "elementB" | "name" | "anchorA" | "anchorB" | "distance";
}

export interface EProportionConstraintError {
  message: string;
  field: "layer" | "elementA" | "elementB" | "name" | "proportion";
}

export type EValidateConstraintAspectError = EAspectConstraintError;

export class EStoreValidatorsConstraints {
  constructor(private readonly data: EDocument) {}

  public aspect(
    layer: ELayerUUID | undefined,
    constraint: Partial<Omit<EAspectConstraint, "type">>,
    softValidation = false,
  ): EAspectConstraintError | undefined {
    if (layer === undefined) {
      return { message: "layer is required", field: "layer" };
    }
    const layerContext = this.getLayerContext(layer);
    if (layerContext === undefined) {
      return { message: `layer with UUID ${layer} must exist`, field: "layer" };
    }

    const elementError = this.validateSingleElement(layerContext, constraint.element);
    if (elementError !== undefined) {
      return elementError;
    }

    if (softValidation) {
      return undefined;
    }

    const nameError = this.validateName(layerContext, constraint.name);
    if (nameError !== undefined) {
      return nameError;
    }

    if (constraint.aspect === undefined) {
      return { message: "aspect is required", field: "aspect" };
    }
    if (!isValidPositiveNumber(constraint.aspect)) {
      return { message: "aspect must be a positive number", field: "aspect" };
    }
  }

  public sizeHorizontal(
    layer: ELayerUUID | undefined,
    constraint: Partial<Omit<EHorizontalSizeConstraint, "type">>,
    softValidation = false,
  ): ESizeConstraintError | undefined {
    if (layer === undefined) {
      return { message: "layer is required", field: "layer" };
    }
    const layerContext = this.getLayerContext(layer);
    if (layerContext === undefined) {
      return { message: `layer with UUID ${layer} must exist`, field: "layer" };
    }

    const elementError = this.validateSingleElement(layerContext, constraint.element);
    if (elementError !== undefined) {
      return elementError;
    }

    if (softValidation) {
      return undefined;
    }

    const nameError = this.validateName(layerContext, constraint.name);
    if (nameError !== undefined) {
      return nameError;
    }

    if (constraint.size === undefined) {
      return { message: "size is required", field: "size" };
    }
    if (!isValidPositiveNumber(constraint.size)) {
      return { message: "size must be a positive number", field: "size" };
    }
  }

  public sizeVertical(
    layer: ELayerUUID | undefined,
    constraint: Partial<Omit<EVerticalSizeConstraint, "type">>,
    softValidation = false,
  ): ESizeConstraintError | undefined {
    return this.sizeHorizontal(layer, constraint, softValidation);
  }

  public distanceHorizontal(
    layer: ELayerUUID | undefined,
    constraint: Partial<Omit<EHorizontalDistanceConstraint, "type">>,
    softValidation = false,
  ): EDistanceConstraintError | undefined {
    if (layer === undefined) {
      return { message: "layer is required", field: "layer" };
    }
    const layerContext = this.getLayerContext(layer);
    if (layerContext === undefined) {
      return { message: `layer with UUID ${layer} must exist`, field: "layer" };
    }

    const elementsError = this.validateTwoElements(
      layerContext,
      constraint.elementA,
      constraint.elementB,
    );
    if (elementsError !== undefined) {
      return elementsError;
    }

    if (softValidation) {
      return undefined;
    }

    const nameError = this.validateName(layerContext, constraint.name);
    if (nameError !== undefined) {
      return nameError;
    }

    if (constraint.anchorA === undefined) {
      return { message: "anchorA is required", field: "anchorA" };
    }
    if (constraint.anchorB === undefined) {
      return { message: "anchorB is required", field: "anchorB" };
    }
    if (constraint.distance === undefined) {
      return { message: "distance is required", field: "distance" };
    }
  }

  public distanceVertical(
    layer: ELayerUUID | undefined,
    constraint: Partial<Omit<EVerticalDistanceConstraint, "type">>,
    softValidation = false,
  ): EDistanceConstraintError | undefined {
    return this.distanceHorizontal(layer, constraint, softValidation);
  }

  public proportionHorizontal(
    layer: ELayerUUID | undefined,
    constraint: Partial<Omit<EHorizontalProportionConstraint, "type">>,
    softValidation = false,
  ): EProportionConstraintError | undefined {
    if (layer === undefined) {
      return { message: "layer is required", field: "layer" };
    }
    const layerContext = this.getLayerContext(layer);
    if (layerContext === undefined) {
      return { message: `layer with UUID ${layer} must exist`, field: "layer" };
    }

    const elementsError = this.validateTwoElements(
      layerContext,
      constraint.elementA,
      constraint.elementB,
    );
    if (elementsError !== undefined) {
      return elementsError;
    }

    if (softValidation) {
      return undefined;
    }

    const nameError = this.validateName(layerContext, constraint.name);
    if (nameError !== undefined) {
      return nameError;
    }

    if (constraint.proportion === undefined) {
      return { message: "proportion is required", field: "proportion" };
    }
    if (!isValidPositiveNumber(constraint.proportion)) {
      return { message: "proportion must be a positive number", field: "proportion" };
    }
  }

  public proportionVertical(
    layer: ELayerUUID | undefined,
    constraint: Partial<Omit<EVerticalProportionConstraint, "type">>,
    softValidation = false,
  ): EProportionConstraintError | undefined {
    return this.proportionHorizontal(layer, constraint, softValidation);
  }

  private validateSingleElement(
    layerContext: ELayerContext,
    element: EElementUUID | undefined,
  ): { message: string; field: "element" } | undefined {
    if (element === undefined) {
      return { message: "element is required", field: "element" };
    }
    if (!layerContext.elements.some((candidate) => candidate.uuid === element)) {
      return { message: "element must be on the same layer", field: "element" };
    }
  }

  private validateTwoElements(
    layerContext: ELayerContext,
    elementA: ELayerUUID | EElementUUID | undefined,
    elementB: ELayerUUID | EElementUUID | undefined,
  ): { message: string; field: "elementA" | "elementB" } | undefined {
    if (elementA === undefined) {
      return { message: "elementA is required", field: "elementA" };
    }
    if (elementB === undefined) {
      return { message: "elementB is required", field: "elementB" };
    }
    if (elementA === elementB) {
      return { message: "elementA and elementB must be different", field: "elementB" };
    }
    if (!this.isValidLayerOrElement(layerContext, elementA)) {
      return { message: "elementA must be on the same layer", field: "elementA" };
    }
    if (!this.isValidLayerOrElement(layerContext, elementB)) {
      return { message: "elementB must be on the same layer", field: "elementB" };
    }
  }

  private validateName(
    layerContext: ELayerContext,
    name: string | undefined,
  ): { message: string; field: "name" } | undefined {
    if (name === undefined || name === "") {
      return undefined;
    }

    if (!isValidName(name)) {
      return { message: `name "${name}" not valid`, field: "name" };
    }
    if (!this.isConstraintNameUnique(layerContext, name)) {
      return { message: `name "${name}" is already in use in this layer.`, field: "name" };
    }
  }

  private getLayerContext(layer: ELayerUUID): ELayerContext | undefined {
    return this.data.layerContexts.find((layerContext) => layerContext.layer.uuid === layer);
  }

  private isValidLayerOrElement(
    layerContext: ELayerContext,
    uuid: ELayerUUID | EElementUUID,
  ): boolean {
    return (
      layerContext.elements.some((element) => element.uuid === uuid) ||
      this.data.layerContexts.some((context) => context.layer.uuid === uuid)
    );
  }

  private isConstraintNameUnique(layerContext: ELayerContext, name: string): boolean {
    return (
      layerContext.elements.every((element) => element.name !== name) &&
      layerContext.constraints.every((constraint) => constraint.name !== name)
    );
  }
}
