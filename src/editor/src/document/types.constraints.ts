import type { EConstraintUUID, EElementUUID, ELayerUUID } from "./types.misc";

export enum EConstraintType {
  ASPECT = "ASPECT",
  DISTANCE_HORIZONTAL = "DISTANCE_HORIZONTAL",
  DISTANCE_VERTICAL = "DISTANCE_VERTICAL",
  PROPORTION_HORIZONTAL = "PROPORTION_HORIZONTAL",
  PROPORTION_VERTICAL = "PROPORTION_VERTICAL",
  SIZE_HORIZONTAL = "SIZE_HORIZONTAL",
  SIZE_VERTICAL = "SIZE_VERTICAL",
}

interface EConstraint {
  uuid: EConstraintUUID;
  type: EConstraintType;
  name: string;
}

export interface EAspectConstraint extends EConstraint {
  type: EConstraintType.ASPECT;
  element: EElementUUID;
  aspect: number;
}

export interface EHorizontalDistanceConstraint extends EConstraint {
  type: EConstraintType.DISTANCE_HORIZONTAL;
  elementA: ELayerUUID | EElementUUID;
  elementB: EElementUUID;
  anchorA: number;
  anchorB: number;
  distance: number;
}

export interface EVerticalDistanceConstraint extends EConstraint {
  type: EConstraintType.DISTANCE_VERTICAL;
  elementA: ELayerUUID | EElementUUID;
  elementB: EElementUUID;
  anchorA: number;
  anchorB: number;
  distance: number;
}

export interface EHorizontalProportionConstraint extends EConstraint {
  type: EConstraintType.PROPORTION_HORIZONTAL;
  elementA: ELayerUUID | EElementUUID;
  elementB: EElementUUID;
  proportion: number;
}

export interface EVerticalProportionConstraint extends EConstraint {
  type: EConstraintType.PROPORTION_VERTICAL;
  elementA: ELayerUUID | EElementUUID;
  elementB: EElementUUID;
  proportion: number;
}

export interface EHorizontalSizeConstraint extends EConstraint {
  type: EConstraintType.SIZE_HORIZONTAL;
  element: EElementUUID;
  size: number;
}

export interface EVerticalSizeConstraint extends EConstraint {
  type: EConstraintType.SIZE_VERTICAL;
  element: EElementUUID;
  size: number;
}

export type EAnyConstraint =
  | EAspectConstraint
  | EHorizontalDistanceConstraint
  | EVerticalDistanceConstraint
  | EHorizontalProportionConstraint
  | EVerticalProportionConstraint
  | EHorizontalSizeConstraint
  | EVerticalSizeConstraint;
