import type { EAnyConstraint } from "../../../../../document/types.constraints";
import { EConstraintType } from "../../../../../document/types.constraints";
import type { EElementUUID } from "../../../../../document/types.misc";

export function generateConstraintStatement(
  constraint: EAnyConstraint,
  ref: (uuid: EElementUUID) => string,
): { code: string; imports: string[] } {
  switch (constraint.type) {
    case EConstraintType.ASPECT:
      return {
        code: `new UIAspectConstraint(${ref(constraint.element)}, { aspect: ${constraint.aspect} });`,
        imports: ["UIAspectConstraint"],
      };
    case EConstraintType.DISTANCE_HORIZONTAL:
      return {
        code: `new UIHorizontalDistanceConstraint(${ref(constraint.elementA)}, ${ref(constraint.elementB)}, { anchorA: ${constraint.anchorA}, anchorB: ${constraint.anchorB}, distance: ${constraint.distance} });`,
        imports: ["UIHorizontalDistanceConstraint"],
      };
    case EConstraintType.DISTANCE_VERTICAL:
      return {
        code: `new UIVerticalDistanceConstraint(${ref(constraint.elementA)}, ${ref(constraint.elementB)}, { anchorA: ${constraint.anchorA}, anchorB: ${constraint.anchorB}, distance: ${constraint.distance} });`,
        imports: ["UIVerticalDistanceConstraint"],
      };
    case EConstraintType.PROPORTION_HORIZONTAL:
      return {
        code: `new UIHorizontalProportionConstraint(${ref(constraint.elementA)}, ${ref(constraint.elementB)}, { proportion: ${constraint.proportion} });`,
        imports: ["UIHorizontalProportionConstraint"],
      };
    case EConstraintType.PROPORTION_VERTICAL:
      return {
        code: `new UIVerticalProportionConstraint(${ref(constraint.elementA)}, ${ref(constraint.elementB)}, { proportion: ${constraint.proportion} });`,
        imports: ["UIVerticalProportionConstraint"],
      };
    case EConstraintType.SIZE_HORIZONTAL:
      return {
        code: `new UIWidthConstraint(${ref(constraint.element)}, { width: ${constraint.size} });`,
        imports: ["UIWidthConstraint"],
      };
    case EConstraintType.SIZE_VERTICAL:
      return {
        code: `new UIHeightConstraint(${ref(constraint.element)}, { height: ${constraint.size} });`,
        imports: ["UIHeightConstraint"],
      };
  }
}
