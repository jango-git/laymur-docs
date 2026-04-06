import type { EAspectConstraintBuilder } from "./EAspectConstraintBuilder";
import type { EDistanceHorizontalConstraintBuilder } from "./EDistanceHorizontalConstraintBuilder";
import type { EDistanceVerticalConstraintBuilder } from "./EDistanceVerticalConstraintBuilder";
import type { EProportionHorizontalConstraintBuilder } from "./EProportionHorizontalConstraintBuilder";
import type { EProportionVerticalConstraintBuilder } from "./EProportionVerticalConstraintBuilder";
import type { ESizeHorizontalConstraintBuilder } from "./ESizeHorizontalConstraintBuilder";
import type { ESizeVerticalConstraintBuilder } from "./ESizeVerticalConstraintBuilder";

export type EAnyConstraintBuilder =
  | EAspectConstraintBuilder
  | EDistanceHorizontalConstraintBuilder
  | EDistanceVerticalConstraintBuilder
  | EProportionHorizontalConstraintBuilder
  | EProportionVerticalConstraintBuilder
  | ESizeHorizontalConstraintBuilder
  | ESizeVerticalConstraintBuilder;
