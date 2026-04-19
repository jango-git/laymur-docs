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
import { UUID } from "../document/types.misc";
import {
  ensureUniqueConstraint,
  findLayerUuidForConstraint,
  resolveConstraint,
  resolveElement,
  resolveLayerContext,
} from "./miscellaneous";

export function addConstraint(layerUuid: UUID, constraint: EAnyConstraint): void {
  ensureUniqueConstraint(constraint.uuid);
  const layerContext = resolveLayerContext(layerUuid);

  switch (constraint.type) {
    case EConstraintType.ASPECT: {
      const element = resolveElement(layerUuid, constraint.element);
      const constraint = new UIAspectConstraint(element, {
        name: constraint.name,
        aspect: constraint.aspect,
      });
      layerContext.constraints.set(constraint.uuid, constraint);
      break;
    }
    case EConstraintType.DISTANCE_HORIZONTAL: {
      const elementA = resolveElement(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const constraint = new UIHorizontalDistanceConstraint(elementA, elementB, {
        name: constraint.name,
        anchorA: constraint.anchorA,
        anchorB: constraint.anchorB,
        distance: constraint.distance,
      });
      layerContext.constraints.set(constraint.uuid, constraint);
      break;
    }
    case EConstraintType.DISTANCE_VERTICAL: {
      const elementA = resolveElement(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const constraint = new UIVerticalDistanceConstraint(elementA, elementB, {
        name: constraint.name,
        anchorA: constraint.anchorA,
        anchorB: constraint.anchorB,
        distance: constraint.distance,
      });
      layerContext.constraints.set(constraint.uuid, constraint);
      break;
    }
    case EConstraintType.PROPORTION_HORIZONTAL: {
      const elementA = resolveElement(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const constraint = new UIHorizontalProportionConstraint(elementA, elementB, {
        name: constraint.name,
        proportion: constraint.proportion,
      });
      layerContext.constraints.set(constraint.uuid, constraint);
      break;
    }
    case EConstraintType.PROPORTION_VERTICAL: {
      const elementA = resolveElement(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const constraint = new UIVerticalProportionConstraint(elementA, elementB, {
        name: constraint.name,
        proportion: constraint.proportion,
      });
      layerContext.constraints.set(constraint.uuid, constraint);
      break;
    }
    case EConstraintType.SIZE_HORIZONTAL: {
      const element = resolveElement(layerUuid, constraint.element);
      const constraint = new UIWidthConstraint(element, {
        name: constraint.name,
        width: constraint.size,
      });
      layerContext.constraints.set(constraint.uuid, constraint);
      break;
    }
    case EConstraintType.SIZE_VERTICAL: {
      const element = resolveElement(layerUuid, constraint.element);
      const constraint = new UIHeightConstraint(element, {
        name: constraint.name,
        height: constraint.size,
      });
      layerContext.constraints.set(constraint.uuid, constraint);
      break;
    }
  }
}

export function removeConstraint(layerUuid: UUID, uuid: UUID): void {
  resolveConstraint(layerUuid, uuid).destroy();
  resolveLayerContext(layerUuid).constraints.delete(uuid);
}

export function updateConstraint(constraint: EAnyConstraint): void {
  const layerUuid = findLayerUuidForConstraint(constraint.uuid);

  switch (constraint.type) {
    case EConstraintType.ASPECT: {
      const constraint = resolveConstraint(layerUuid, constraint.uuid) as UIAspectConstraint;
      constraint.name = constraint.name;
      constraint.aspect = constraint.aspect;
      break;
    }
    case EConstraintType.DISTANCE_HORIZONTAL: {
      const constraint = resolveConstraint(
        layerUuid,
        constraint.uuid,
      ) as UIHorizontalDistanceConstraint;
      constraint.name = constraint.name;
      constraint.anchorA = constraint.anchorA;
      constraint.anchorB = constraint.anchorB;
      constraint.distance = constraint.distance;
      break;
    }
    case EConstraintType.DISTANCE_VERTICAL: {
      const constraint = resolveConstraint(
        layerUuid,
        constraint.uuid,
      ) as UIVerticalDistanceConstraint;
      constraint.name = constraint.name;
      constraint.anchorA = constraint.anchorA;
      constraint.anchorB = constraint.anchorB;
      constraint.distance = constraint.distance;
      break;
    }
    case EConstraintType.PROPORTION_HORIZONTAL: {
      const constraint = resolveConstraint(
        layerUuid,
        constraint.uuid,
      ) as UIHorizontalProportionConstraint;
      constraint.name = constraint.name;
      constraint.proportion = constraint.proportion;
      break;
    }
    case EConstraintType.PROPORTION_VERTICAL: {
      const constraint = resolveConstraint(
        layerUuid,
        constraint.uuid,
      ) as UIVerticalProportionConstraint;
      constraint.name = constraint.name;
      constraint.proportion = constraint.proportion;
      break;
    }
    case EConstraintType.SIZE_HORIZONTAL: {
      const constraint = resolveConstraint(layerUuid, constraint.uuid) as UIWidthConstraint;
      constraint.name = constraint.name;
      constraint.width = constraint.size;
      break;
    }
    case EConstraintType.SIZE_VERTICAL: {
      const constraint = resolveConstraint(layerUuid, constraint.uuid) as UIHeightConstraint;
      constraint.name = constraint.name;
      constraint.height = constraint.size;
      break;
    }
  }
}
