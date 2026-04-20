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
import type { EConstraintUUID, ELayerUUID } from "../document/types.misc";
import {
  ensureUniqueConstraint,
  findLayerUuidForConstraint,
  resolveConstraint,
  resolveElement,
  resolveLayerContext,
  resolveUniversalConstraintTarget,
} from "./miscellaneous";

export function addConstraint(layerUuid: ELayerUUID, constraint: EAnyConstraint): void {
  ensureUniqueConstraint(constraint.uuid);
  const layerContext = resolveLayerContext(layerUuid);

  switch (constraint.type) {
    case EConstraintType.ASPECT: {
      const element = resolveElement(layerUuid, constraint.element);
      const instance = new UIAspectConstraint(element, {
        name: constraint.name,
        aspect: constraint.aspect,
      });
      layerContext.constraints.set(constraint.uuid, instance);
      break;
    }
    case EConstraintType.DISTANCE_HORIZONTAL: {
      const elementA = resolveUniversalConstraintTarget(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const instance = new UIHorizontalDistanceConstraint(elementA, elementB, {
        name: constraint.name,
        anchorA: constraint.anchorA,
        anchorB: constraint.anchorB,
        distance: constraint.distance,
      });
      layerContext.constraints.set(constraint.uuid, instance);
      break;
    }
    case EConstraintType.DISTANCE_VERTICAL: {
      const elementA = resolveUniversalConstraintTarget(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const instance = new UIVerticalDistanceConstraint(elementA, elementB, {
        name: constraint.name,
        anchorA: constraint.anchorA,
        anchorB: constraint.anchorB,
        distance: constraint.distance,
      });
      layerContext.constraints.set(constraint.uuid, instance);
      break;
    }
    case EConstraintType.PROPORTION_HORIZONTAL: {
      const elementA = resolveUniversalConstraintTarget(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const instance = new UIHorizontalProportionConstraint(elementA, elementB, {
        name: constraint.name,
        proportion: constraint.proportion,
      });
      layerContext.constraints.set(constraint.uuid, instance);
      break;
    }
    case EConstraintType.PROPORTION_VERTICAL: {
      const elementA = resolveUniversalConstraintTarget(layerUuid, constraint.elementA);
      const elementB = resolveElement(layerUuid, constraint.elementB);
      const instance = new UIVerticalProportionConstraint(elementA, elementB, {
        name: constraint.name,
        proportion: constraint.proportion,
      });
      layerContext.constraints.set(constraint.uuid, instance);
      break;
    }
    case EConstraintType.SIZE_HORIZONTAL: {
      const element = resolveElement(layerUuid, constraint.element);
      const instance = new UIWidthConstraint(element, {
        name: constraint.name,
        width: constraint.size,
      });
      layerContext.constraints.set(constraint.uuid, instance);
      break;
    }
    case EConstraintType.SIZE_VERTICAL: {
      const element = resolveElement(layerUuid, constraint.element);
      const instance = new UIHeightConstraint(element, {
        name: constraint.name,
        height: constraint.size,
      });
      layerContext.constraints.set(constraint.uuid, instance);
      break;
    }
  }
}

export function removeConstraint(layerUuid: ELayerUUID, uuid: EConstraintUUID): void {
  resolveConstraint(layerUuid, uuid).destroy();
  resolveLayerContext(layerUuid).constraints.delete(uuid);
}

export function updateConstraint(constraint: EAnyConstraint): void {
  const layerUuid = findLayerUuidForConstraint(constraint.uuid);

  switch (constraint.type) {
    case EConstraintType.ASPECT: {
      const instance = resolveConstraint(layerUuid, constraint.uuid) as UIAspectConstraint;
      instance.name = constraint.name;
      instance.aspect = constraint.aspect;
      break;
    }
    case EConstraintType.DISTANCE_HORIZONTAL: {
      const instance = resolveConstraint(
        layerUuid,
        constraint.uuid,
      ) as UIHorizontalDistanceConstraint;
      instance.name = constraint.name;
      instance.anchorA = constraint.anchorA;
      instance.anchorB = constraint.anchorB;
      instance.distance = constraint.distance;
      break;
    }
    case EConstraintType.DISTANCE_VERTICAL: {
      const instance = resolveConstraint(
        layerUuid,
        constraint.uuid,
      ) as UIVerticalDistanceConstraint;
      instance.name = constraint.name;
      instance.anchorA = constraint.anchorA;
      instance.anchorB = constraint.anchorB;
      instance.distance = constraint.distance;
      break;
    }
    case EConstraintType.PROPORTION_HORIZONTAL: {
      const instance = resolveConstraint(
        layerUuid,
        constraint.uuid,
      ) as UIHorizontalProportionConstraint;
      instance.name = constraint.name;
      instance.proportion = constraint.proportion;
      break;
    }
    case EConstraintType.PROPORTION_VERTICAL: {
      const instance = resolveConstraint(
        layerUuid,
        constraint.uuid,
      ) as UIVerticalProportionConstraint;
      instance.name = constraint.name;
      instance.proportion = constraint.proportion;
      break;
    }
    case EConstraintType.SIZE_HORIZONTAL: {
      const instance = resolveConstraint(layerUuid, constraint.uuid) as UIWidthConstraint;
      instance.name = constraint.name;
      instance.width = constraint.size;
      break;
    }
    case EConstraintType.SIZE_VERTICAL: {
      const instance = resolveConstraint(layerUuid, constraint.uuid) as UIHeightConstraint;
      instance.name = constraint.name;
      instance.height = constraint.size;
      break;
    }
  }
}
