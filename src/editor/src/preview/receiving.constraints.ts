import {
  UIAspectConstraint,
  UIHeightConstraint,
  UIHorizontalDistanceConstraint,
  UIHorizontalProportionConstraint,
  UIVerticalDistanceConstraint,
  UIVerticalProportionConstraint,
  UIWidthConstraint,
} from "laymur";
import type { EAnyConstraint } from "../document/types.constraints";
import { EConstraintType } from "../document/types.constraints";
import {
  ensureUniqueConstraint,
  findLayerUuidForConstraint,
  resolveConstraint,
  resolveElement,
  resolveLayerContext,
} from "./internal";

export function addConstraint(layerUuid: string, constraint: EAnyConstraint): void {
  ensureUniqueConstraint(constraint.uuid);
  const ctx = resolveLayerContext(layerUuid);

  switch (constraint.type) {
    case EConstraintType.ASPECT: {
      const element = resolveElement(layerUuid, constraint.element);
      const c = new UIAspectConstraint(element, {
        name: constraint.name,
        aspect: constraint.aspect,
      });
      ctx.constraints.set(constraint.uuid, c);
      break;
    }
    case EConstraintType.DISTANCE_HORIZONTAL: {
      const elementA = resolveElement(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const c = new UIHorizontalDistanceConstraint(elementA, elementB, {
        name: constraint.name,
        anchorA: constraint.anchorA,
        anchorB: constraint.anchorB,
        distance: constraint.distance,
      });
      ctx.constraints.set(constraint.uuid, c);
      break;
    }
    case EConstraintType.DISTANCE_VERTICAL: {
      const elementA = resolveElement(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const c = new UIVerticalDistanceConstraint(elementA, elementB, {
        name: constraint.name,
        anchorA: constraint.anchorA,
        anchorB: constraint.anchorB,
        distance: constraint.distance,
      });
      ctx.constraints.set(constraint.uuid, c);
      break;
    }
    case EConstraintType.PROPORTION_HORIZONTAL: {
      const elementA = resolveElement(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const c = new UIHorizontalProportionConstraint(elementA, elementB, {
        name: constraint.name,
        proportion: constraint.proportion,
      });
      ctx.constraints.set(constraint.uuid, c);
      break;
    }
    case EConstraintType.PROPORTION_VERTICAL: {
      const elementA = resolveElement(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const c = new UIVerticalProportionConstraint(elementA, elementB, {
        name: constraint.name,
        proportion: constraint.proportion,
      });
      ctx.constraints.set(constraint.uuid, c);
      break;
    }
    case EConstraintType.SIZE_HORIZONTAL: {
      const element = resolveElement(layerUuid, constraint.element);
      const c = new UIWidthConstraint(element, { name: constraint.name, width: constraint.size });
      ctx.constraints.set(constraint.uuid, c);
      break;
    }
    case EConstraintType.SIZE_VERTICAL: {
      const element = resolveElement(layerUuid, constraint.element);
      const c = new UIHeightConstraint(element, { name: constraint.name, height: constraint.size });
      ctx.constraints.set(constraint.uuid, c);
      break;
    }
  }
}

export function updateConstraint(constraint: EAnyConstraint): void {
  const layerUuid = findLayerUuidForConstraint(constraint.uuid);

  switch (constraint.type) {
    case EConstraintType.ASPECT: {
      const c = resolveConstraint(layerUuid, constraint.uuid) as UIAspectConstraint;
      c.name = constraint.name;
      c.aspect = constraint.aspect;
      break;
    }
    case EConstraintType.DISTANCE_HORIZONTAL: {
      const c = resolveConstraint(layerUuid, constraint.uuid) as UIHorizontalDistanceConstraint;
      c.name = constraint.name;
      c.anchorA = constraint.anchorA;
      c.anchorB = constraint.anchorB;
      c.distance = constraint.distance;
      break;
    }
    case EConstraintType.DISTANCE_VERTICAL: {
      const c = resolveConstraint(layerUuid, constraint.uuid) as UIVerticalDistanceConstraint;
      c.name = constraint.name;
      c.anchorA = constraint.anchorA;
      c.anchorB = constraint.anchorB;
      c.distance = constraint.distance;
      break;
    }
    case EConstraintType.PROPORTION_HORIZONTAL: {
      const c = resolveConstraint(layerUuid, constraint.uuid) as UIHorizontalProportionConstraint;
      c.name = constraint.name;
      c.proportion = constraint.proportion;
      break;
    }
    case EConstraintType.PROPORTION_VERTICAL: {
      const c = resolveConstraint(layerUuid, constraint.uuid) as UIVerticalProportionConstraint;
      c.name = constraint.name;
      c.proportion = constraint.proportion;
      break;
    }
    case EConstraintType.SIZE_HORIZONTAL: {
      const c = resolveConstraint(layerUuid, constraint.uuid) as UIWidthConstraint;
      c.name = constraint.name;
      c.width = constraint.size;
      break;
    }
    case EConstraintType.SIZE_VERTICAL: {
      const c = resolveConstraint(layerUuid, constraint.uuid) as UIHeightConstraint;
      c.name = constraint.name;
      c.height = constraint.size;
      break;
    }
  }
}

export function removeConstraint(layerUuid: string, constraintUuid: string): void {
  resolveConstraint(layerUuid, constraintUuid).destroy();
  resolveLayerContext(layerUuid).constraints.delete(constraintUuid);
}
