import { consoleDebug } from "../../miscellaneous/debug.print";
import { EStoreDeltaOperation } from "../signals";
import type { EStoreSignalsConstraints } from "../signals/constraints";
import type { EDocument, ELayerContext, PartialExceptUUIDField } from "../types";
import { clone } from "../types";
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
import type { UUID } from "../types.misc";

export class EStoreCommandsConstraints {
  constructor(
    private readonly data: EDocument,
    private readonly signals: EStoreSignalsConstraints,
  ) {}

  public add(layerUuid: UUID, constraint: EAnyConstraint): void {
    const stored = clone(constraint);
    this.getContext(layerUuid).constraints.push(stored);
    consoleDebug("[EStoreCommandsConstraints] command 'add' was evaluated", constraint);
    this.signals["emitList"]({
      operation: EStoreDeltaOperation.ADD,
      layerUuid,
      constraint: clone(stored),
    });
  }

  public remove(layerUuid: UUID, uuid: UUID): void {
    const layerContext = this.getContext(layerUuid);
    const index = layerContext.constraints.findIndex((constraint) => constraint.uuid === uuid);
    if (index === -1) {
      throw new Error(`[EStoreCommandsConstraints] Constraint not found: (uuid: ${uuid})`);
    }
    layerContext.constraints.splice(index, 1);
    consoleDebug("[EStoreCommandsConstraints] command 'remove' was evaluated", uuid);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REMOVE, layerUuid, uuid });
  }

  public reorder(layerUuid: UUID, uuids: UUID[]): void {
    const layerContext = this.getContext(layerUuid);
    const uuidsCopy = clone(uuids);
    layerContext.constraints.sort(
      (first, second) => uuidsCopy.indexOf(first.uuid) - uuidsCopy.indexOf(second.uuid),
    );
    consoleDebug("[EStoreCommandsConstraints] command 'reorder' was evaluated", uuids);
    this.signals["emitList"]({
      operation: EStoreDeltaOperation.REORDER,
      layerUuid,
      uuids: clone(uuidsCopy),
    });
  }

  public writeAspect(data: PartialExceptUUIDField<EAspectConstraint>): void {
    const copy = clone(data);
    const constraint = this.get<EAspectConstraint>(copy.uuid, EConstraintType.ASPECT);
    if (copy.name !== undefined) {
      constraint.name = copy.name;
    }
    if (copy.element !== undefined) {
      constraint.element = copy.element;
    }
    if (copy.aspect !== undefined) {
      constraint.aspect = copy.aspect;
    }
    consoleDebug("[EStoreCommandsConstraints] command 'writeAspect' was evaluated", data);
    this.signals["emitItem"]({ constraint: clone(constraint) });
  }

  public writeHorizontalDistance(
    data: PartialExceptUUIDField<EHorizontalDistanceConstraint>,
  ): void {
    const copy = clone(data);
    const constraint = this.get<EHorizontalDistanceConstraint>(
      copy.uuid,
      EConstraintType.DISTANCE_HORIZONTAL,
    );
    if (copy.name !== undefined) {
      constraint.name = copy.name;
    }
    if (copy.elementA !== undefined) {
      constraint.elementA = copy.elementA;
    }
    if (copy.elementB !== undefined) {
      constraint.elementB = copy.elementB;
    }
    if (copy.anchorA !== undefined) {
      constraint.anchorA = copy.anchorA;
    }
    if (copy.anchorB !== undefined) {
      constraint.anchorB = copy.anchorB;
    }
    if (copy.distance !== undefined) {
      constraint.distance = copy.distance;
    }
    consoleDebug(
      "[EStoreCommandsConstraints] command 'writeHorizontalDistance' was evaluated",
      data,
    );
    this.signals["emitItem"]({ constraint: clone(constraint) });
  }

  public writeVerticalDistance(data: PartialExceptUUIDField<EVerticalDistanceConstraint>): void {
    const copy = clone(data);
    const constraint = this.get<EVerticalDistanceConstraint>(
      copy.uuid,
      EConstraintType.DISTANCE_VERTICAL,
    );
    if (copy.name !== undefined) {
      constraint.name = copy.name;
    }
    if (copy.elementA !== undefined) {
      constraint.elementA = copy.elementA;
    }
    if (copy.elementB !== undefined) {
      constraint.elementB = copy.elementB;
    }
    if (copy.anchorA !== undefined) {
      constraint.anchorA = copy.anchorA;
    }
    if (copy.anchorB !== undefined) {
      constraint.anchorB = copy.anchorB;
    }
    if (copy.distance !== undefined) {
      constraint.distance = copy.distance;
    }
    consoleDebug("[EStoreCommandsConstraints] command 'writeVerticalDistance' was evaluated", data);
    this.signals["emitItem"]({ constraint: clone(constraint) });
  }

  public writeHorizontalProportion(
    data: PartialExceptUUIDField<EHorizontalProportionConstraint>,
  ): void {
    const copy = clone(data);
    const constraint = this.get<EHorizontalProportionConstraint>(
      copy.uuid,
      EConstraintType.PROPORTION_HORIZONTAL,
    );
    if (copy.name !== undefined) {
      constraint.name = copy.name;
    }
    if (copy.elementA !== undefined) {
      constraint.elementA = copy.elementA;
    }
    if (copy.elementB !== undefined) {
      constraint.elementB = copy.elementB;
    }
    if (copy.proportion !== undefined) {
      constraint.proportion = copy.proportion;
    }
    consoleDebug(
      "[EStoreCommandsConstraints] command 'writeHorizontalProportion' was evaluated",
      data,
    );
    this.signals["emitItem"]({ constraint: clone(constraint) });
  }

  public writeVerticalProportion(
    data: PartialExceptUUIDField<EVerticalProportionConstraint>,
  ): void {
    const copy = clone(data);
    const constraint = this.get<EVerticalProportionConstraint>(
      copy.uuid,
      EConstraintType.PROPORTION_VERTICAL,
    );
    if (copy.name !== undefined) {
      constraint.name = copy.name;
    }
    if (copy.elementA !== undefined) {
      constraint.elementA = copy.elementA;
    }
    if (copy.elementB !== undefined) {
      constraint.elementB = copy.elementB;
    }
    if (copy.proportion !== undefined) {
      constraint.proportion = copy.proportion;
    }
    consoleDebug(
      "[EStoreCommandsConstraints] command 'writeVerticalProportion' was evaluated",
      data,
    );
    this.signals["emitItem"]({ constraint: clone(constraint) });
  }

  public writeHorizontalSize(data: PartialExceptUUIDField<EHorizontalSizeConstraint>): void {
    const copy = clone(data);
    const constraint = this.get<EHorizontalSizeConstraint>(
      copy.uuid,
      EConstraintType.SIZE_HORIZONTAL,
    );
    if (copy.name !== undefined) {
      constraint.name = copy.name;
    }
    if (copy.element !== undefined) {
      constraint.element = copy.element;
    }
    if (copy.size !== undefined) {
      constraint.size = copy.size;
    }
    consoleDebug("[EStoreCommandsConstraints] command 'writeHorizontalSize' was evaluated", data);
    this.signals["emitItem"]({ constraint: clone(constraint) });
  }

  public writeVerticalSize(data: PartialExceptUUIDField<EVerticalSizeConstraint>): void {
    const copy = clone(data);
    const constraint = this.get<EVerticalSizeConstraint>(copy.uuid, EConstraintType.SIZE_VERTICAL);
    if (copy.name !== undefined) {
      constraint.name = copy.name;
    }
    if (copy.element !== undefined) {
      constraint.element = copy.element;
    }
    if (copy.size !== undefined) {
      constraint.size = copy.size;
    }
    consoleDebug("[EStoreCommandsConstraints] command 'writeVerticalSize' was evaluated", data);
    this.signals["emitItem"]({ constraint: clone(constraint) });
  }

  private getContext(layerUuid: UUID): ELayerContext {
    const layerContext = this.data.layerContexts.find(
      (context) => context.layer.uuid === layerUuid,
    );
    if (!layerContext) {
      throw new Error(`[EStoreCommandsConstraints] Layer not found: (uuid: ${layerUuid})`);
    }
    return layerContext;
  }

  private get<T extends EAnyConstraint>(uuid: UUID, type: EConstraintType): T {
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
