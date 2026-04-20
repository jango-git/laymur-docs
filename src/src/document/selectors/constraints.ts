import type { EDocument } from "../types";
import { clone } from "../types";
import type { EAnyConstraint } from "../types.constraints";
import { EConstraintType } from "../types.constraints";
import type { EConstraintUUID, EElementUUID, ELayerUUID } from "../types.misc";

export class EStoreSelectorsConstraints {
  constructor(private readonly data: EDocument) {}

  public selectAll(layerUuid: ELayerUUID): EAnyConstraint[] {
    const layerContext = this.data.layerContexts.find(
      (context) => context.layer.uuid === layerUuid,
    );
    return layerContext ? clone(layerContext.constraints) : [];
  }

  public select(uuid: EConstraintUUID): EAnyConstraint | undefined {
    for (const { constraints } of this.data.layerContexts) {
      const result = constraints.find((constraint) => constraint.uuid === uuid);
      if (result) {
        return clone(result);
      }
    }
    return undefined;
  }

  public selectLinked(elementUuid: EElementUUID): EAnyConstraint[] {
    const ownerLayerContext = this.data.layerContexts.find((context) =>
      context.elements.some((element) => element.uuid === elementUuid),
    );
    if (!ownerLayerContext) {
      return [];
    }
    const result: EAnyConstraint[] = [];
    for (const constraint of ownerLayerContext.constraints) {
      if (
        (constraint.type === EConstraintType.ASPECT ||
          constraint.type === EConstraintType.SIZE_HORIZONTAL ||
          constraint.type === EConstraintType.SIZE_VERTICAL) &&
        constraint.element === elementUuid
      ) {
        result.push(constraint);
      } else if (
        (constraint.type === EConstraintType.DISTANCE_HORIZONTAL ||
          constraint.type === EConstraintType.DISTANCE_VERTICAL ||
          constraint.type === EConstraintType.PROPORTION_HORIZONTAL ||
          constraint.type === EConstraintType.PROPORTION_VERTICAL) &&
        (constraint.elementA === elementUuid || constraint.elementB === elementUuid)
      ) {
        result.push(constraint);
      }
    }
    return clone(result);
  }

  public selectLayerInfo(layerUuid: ELayerUUID): { uuid: ELayerUUID; name: string } | undefined {
    const layerContext = this.data.layerContexts.find(
      (context) => context.layer.uuid === layerUuid,
    );
    return layerContext
      ? { uuid: layerContext.layer.uuid, name: layerContext.layer.name }
      : undefined;
  }
}
