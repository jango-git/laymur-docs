import { EConstraintType } from "../../../document/types.constraints";
import type { EConstraintUUID, ELayerUUID } from "../../../document/types.misc";
import { EAspectConstraintBuilder } from "../../builders/constraints/EAspectConstraintBuilder";
import { EDistanceHorizontalConstraintBuilder } from "../../builders/constraints/EDistanceHorizontalConstraintBuilder";
import { EDistanceVerticalConstraintBuilder } from "../../builders/constraints/EDistanceVerticalConstraintBuilder";
import { EProportionHorizontalConstraintBuilder } from "../../builders/constraints/EProportionHorizontalConstraintBuilder";
import { EProportionVerticalConstraintBuilder } from "../../builders/constraints/EProportionVerticalConstraintBuilder";
import { ESizeHorizontalConstraintBuilder } from "../../builders/constraints/ESizeHorizontalConstraintBuilder";
import { ESizeVerticalConstraintBuilder } from "../../builders/constraints/ESizeVerticalConstraintBuilder";
import type { EAnyConstraintBuilder } from "../../builders/constraints/types";
import { EAspectConstraintCard } from "../../cards/constraints/EAspectConstraintCard";
import { EHorizontalDistanceConstraintCard } from "../../cards/constraints/EHorizontalDistanceConstraintCard";
import { EHorizontalProportionConstraintCard } from "../../cards/constraints/EHorizontalProportionConstraintCard";
import { EHorizontalSizeConstraintCard } from "../../cards/constraints/EHorizontalSizeConstraintCard";
import { EVerticalDistanceConstraintCard } from "../../cards/constraints/EVerticalDistanceConstraintCard";
import { EVerticalProportionConstraintCard } from "../../cards/constraints/EVerticalProportionConstraintCard";
import { EVerticalSizeConstraintCard } from "../../cards/constraints/EVerticalSizeConstraintCard";

export interface ConstraintEntry {
  label: string;
  type: EConstraintType;
  createBuilder: (container: HTMLDivElement) => EAnyConstraintBuilder;
  createCard: (container: HTMLElement, uuid: EConstraintUUID, layerUuid: ELayerUUID) => void;
}

export const CONSTRAINT_REGISTRY: readonly ConstraintEntry[] = [
  {
    label: "Aspect",
    type: EConstraintType.ASPECT,
    createBuilder: (container) => new EAspectConstraintBuilder(container),
    createCard: (container, uuid, layerUuid) =>
      new EAspectConstraintCard(container, uuid, layerUuid),
  },
  {
    label: "Distance Horizontal",
    type: EConstraintType.DISTANCE_HORIZONTAL,
    createBuilder: (container) => new EDistanceHorizontalConstraintBuilder(container),
    createCard: (container, uuid, layerUuid) =>
      new EHorizontalDistanceConstraintCard(container, uuid, layerUuid),
  },
  {
    label: "Distance Vertical",
    type: EConstraintType.DISTANCE_VERTICAL,
    createBuilder: (container) => new EDistanceVerticalConstraintBuilder(container),
    createCard: (container, uuid, layerUuid) =>
      new EVerticalDistanceConstraintCard(container, uuid, layerUuid),
  },
  {
    label: "Proportion Horizontal",
    type: EConstraintType.PROPORTION_HORIZONTAL,
    createBuilder: (container) => new EProportionHorizontalConstraintBuilder(container),
    createCard: (container, uuid, layerUuid) =>
      new EHorizontalProportionConstraintCard(container, uuid, layerUuid),
  },
  {
    label: "Proportion Vertical",
    type: EConstraintType.PROPORTION_VERTICAL,
    createBuilder: (container) => new EProportionVerticalConstraintBuilder(container),
    createCard: (container, uuid, layerUuid) =>
      new EVerticalProportionConstraintCard(container, uuid, layerUuid),
  },
  {
    label: "Size Horizontal",
    type: EConstraintType.SIZE_HORIZONTAL,
    createBuilder: (container) => new ESizeHorizontalConstraintBuilder(container),
    createCard: (container, uuid, layerUuid) =>
      new EHorizontalSizeConstraintCard(container, uuid, layerUuid),
  },
  {
    label: "Size Vertical",
    type: EConstraintType.SIZE_VERTICAL,
    createBuilder: (container) => new ESizeVerticalConstraintBuilder(container),
    createCard: (container, uuid, layerUuid) =>
      new EVerticalSizeConstraintCard(container, uuid, layerUuid),
  },
];

export const DEFAULT_BUILDER_TYPE = EConstraintType.ASPECT;
