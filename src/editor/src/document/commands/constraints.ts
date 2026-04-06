import type { EStoreSignalsConstraints } from "../signals";
import { EStoreDeltaOperation } from "../signals";
import type { EDocument, ELayerContext, PartialExceptUUID } from "../types";
import type {
  EAnyConstraint,
  EAspectConstraint,
  EHorizontalDistanceConstraint,
  EHorizontalProportionConstraint,
  EHorizontalSizeConstraint,
  EVerticalDistanceConstraint,
  EVerticalProportionConstraint,
  EVerticalSizeConstraint,
} from "../types.constraints";
import { EConstraintType } from "../types.constraints";
import type { EConstraintUuid, ELayerUuid } from "../types.misc";

export class EStoreCommandsConstraints {
  constructor(
    private readonly data: EDocument,
    private readonly signals: EStoreSignalsConstraints,
  ) {}

  public add(layerUuid: ELayerUuid, constraint: EAnyConstraint): void {
    this.getContext(layerUuid).constraints.push(constraint);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.ADD, layerUuid, constraint });
  }

  public remove(layerUuid: ELayerUuid, uuid: EConstraintUuid): void {
    const layerContext = this.getContext(layerUuid);
    const index = layerContext.constraints.findIndex((c) => c.uuid === uuid);
    if (index === -1) {
      throw new Error(`[EStoreCommandsConstraints] Constraint not found: (uuid: ${uuid})`);
    }
    layerContext.constraints.splice(index, 1);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REMOVE, layerUuid, uuid });
  }

  public reorder(layerUuid: ELayerUuid, uuids: EConstraintUuid[]): void {
    const layerContext = this.getContext(layerUuid);
    layerContext.constraints.sort((a, b) => uuids.indexOf(a.uuid) - uuids.indexOf(b.uuid));
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REORDER, layerUuid, uuids });
  }

  public writeAspect(data: PartialExceptUUID<EAspectConstraint>): void {
    const constraint = this.get<EAspectConstraint>(data.uuid, EConstraintType.ASPECT);
    if (data.name !== undefined) {
      constraint.name = data.name;
    }
    if (data.element !== undefined) {
      constraint.element = data.element;
    }
    if (data.aspect !== undefined) {
      constraint.aspect = data.aspect;
    }
    this.signals["emitItem"]({ constraint });
  }

  public writeHorizontalDistance(data: PartialExceptUUID<EHorizontalDistanceConstraint>): void {
    const constraint = this.get<EHorizontalDistanceConstraint>(
      data.uuid,
      EConstraintType.DISTANCE_HORIZONTAL,
    );
    if (data.name !== undefined) {
      constraint.name = data.name;
    }
    if (data.elementA !== undefined) {
      constraint.elementA = data.elementA;
    }
    if (data.elementB !== undefined) {
      constraint.elementB = data.elementB;
    }
    if (data.anchorA !== undefined) {
      constraint.anchorA = data.anchorA;
    }
    if (data.anchorB !== undefined) {
      constraint.anchorB = data.anchorB;
    }
    if (data.distance !== undefined) {
      constraint.distance = data.distance;
    }
    this.signals["emitItem"]({ constraint });
  }

  public writeVerticalDistance(data: PartialExceptUUID<EVerticalDistanceConstraint>): void {
    const constraint = this.get<EVerticalDistanceConstraint>(
      data.uuid,
      EConstraintType.DISTANCE_VERTICAL,
    );
    if (data.name !== undefined) {
      constraint.name = data.name;
    }
    if (data.elementA !== undefined) {
      constraint.elementA = data.elementA;
    }
    if (data.elementB !== undefined) {
      constraint.elementB = data.elementB;
    }
    if (data.anchorA !== undefined) {
      constraint.anchorA = data.anchorA;
    }
    if (data.anchorB !== undefined) {
      constraint.anchorB = data.anchorB;
    }
    if (data.distance !== undefined) {
      constraint.distance = data.distance;
    }
    this.signals["emitItem"]({ constraint });
  }

  public writeHorizontalProportion(data: PartialExceptUUID<EHorizontalProportionConstraint>): void {
    const constraint = this.get<EHorizontalProportionConstraint>(
      data.uuid,
      EConstraintType.PROPORTION_HORIZONTAL,
    );
    if (data.name !== undefined) {
      constraint.name = data.name;
    }
    if (data.elementA !== undefined) {
      constraint.elementA = data.elementA;
    }
    if (data.elementB !== undefined) {
      constraint.elementB = data.elementB;
    }
    if (data.proportion !== undefined) {
      constraint.proportion = data.proportion;
    }
    this.signals["emitItem"]({ constraint });
  }

  public writeVerticalProportion(data: PartialExceptUUID<EVerticalProportionConstraint>): void {
    const constraint = this.get<EVerticalProportionConstraint>(
      data.uuid,
      EConstraintType.PROPORTION_VERTICAL,
    );
    if (data.name !== undefined) {
      constraint.name = data.name;
    }
    if (data.elementA !== undefined) {
      constraint.elementA = data.elementA;
    }
    if (data.elementB !== undefined) {
      constraint.elementB = data.elementB;
    }
    if (data.proportion !== undefined) {
      constraint.proportion = data.proportion;
    }
    this.signals["emitItem"]({ constraint });
  }

  public writeHorizontalSize(data: PartialExceptUUID<EHorizontalSizeConstraint>): void {
    const constraint = this.get<EHorizontalSizeConstraint>(
      data.uuid,
      EConstraintType.SIZE_HORIZONTAL,
    );
    if (data.name !== undefined) {
      constraint.name = data.name;
    }
    if (data.element !== undefined) {
      constraint.element = data.element;
    }
    if (data.size !== undefined) {
      constraint.size = data.size;
    }
    this.signals["emitItem"]({ constraint });
  }

  public writeVerticalSize(data: PartialExceptUUID<EVerticalSizeConstraint>): void {
    const constraint = this.get<EVerticalSizeConstraint>(data.uuid, EConstraintType.SIZE_VERTICAL);
    if (data.name !== undefined) {
      constraint.name = data.name;
    }
    if (data.element !== undefined) {
      constraint.element = data.element;
    }
    if (data.size !== undefined) {
      constraint.size = data.size;
    }
    this.signals["emitItem"]({ constraint });
  }

  private getContext(layerUuid: ELayerUuid): ELayerContext {
    const layerContext = this.data.layerContexts.find((c) => c.layer.uuid === layerUuid);
    if (!layerContext) {
      throw new Error(`[EStoreCommandsConstraints] Layer not found: (uuid: ${layerUuid})`);
    }
    return layerContext;
  }

  private get<T extends EAnyConstraint>(uuid: EConstraintUuid, type: EConstraintType): T {
    for (const { constraints } of this.data.layerContexts) {
      for (const constraint of constraints) {
        if (constraint.type === type && constraint.uuid === uuid) {
          return constraint as T;
        }
      }
    }
    throw new Error(
      `[EStoreCommandsConstraints] Constraint not found: (uuid: ${uuid}, type: ${type})`,
    );
  }
}
