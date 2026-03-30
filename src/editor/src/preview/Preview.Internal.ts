/**
 * Preview.Internal.ts
 *
 * Types, constraint registry, and stateless helpers for Preview.ts.
 * All PREVIEW_CONSTRAINT_REGISTRY entries live here so that adding a new
 * constraint type only requires touching this file and constraint-registry.ts -
 * Preview.ts itself does not need to change.
 */

import type { UIFullscreenLayer, UIImage } from "laymur";
import {
  UIAspectConstraint,
  UIHeightConstraint,
  UIHorizontalDistanceConstraint,
  UIHorizontalProportionConstraint,
  UIResizePolicyCover,
  UIResizePolicyCross,
  UIResizePolicyCrossInverted,
  UIResizePolicyFit,
  UIResizePolicyFixedHeight,
  UIResizePolicyFixedWidth,
  UIResizePolicyNone,
  UIVerticalDistanceConstraint,
  UIVerticalProportionConstraint,
  UIWidthConstraint,
} from "laymur";
import type { UILayerDebug } from "laymur/debug";
import type { Texture } from "three";

export type FieldValues = Record<string, string | number>;

/**
 * An element that belongs to a layer - satisfies UIPlaneElement & UILayerElement.
 * Used for single-element constraints (width, height, aspect, size2d) that cannot
 * target the layer itself (noLayer: true in the constraint registry).
 */
export type LayerOwnedElement = UIImage;

/**
 * Any element that has 2D plane dimensions - includes owned elements and the layer itself.
 * Used for two-element constraints (distance, proportion) where the layer can act as
 * an anchor reference for the 'A' side.
 */
export type PlaneElement = UIImage | UIFullscreenLayer;

export interface ElementEntry {
  element: UIImage;
  texture: Texture;
}

export interface ConstraintHandle {
  instances: { destroy(): void }[];
  update(updatedValues: FieldValues): void;
  destroy(): void;
}

export interface LayerContext {
  layer: UIFullscreenLayer;
  debug: UILayerDebug;
  elementMap: Map<string, ElementEntry>;
  constraintMap: Map<string, ConstraintHandle>;
}

export interface PendingConstraint {
  id: string;
  layerId: string;
  constraintType: string;
  fieldValues: FieldValues;
}

/**
 * Single-element constraint entry: targets one owned element (noLayer: true).
 * Resolves to [UIImage].
 */
interface SingleElementConstraintEntry {
  kind: "single";
  resolveElements(
    fieldValues: FieldValues,
    elementMap: Map<string, ElementEntry>,
  ): LayerOwnedElement[] | null;
  create(elements: LayerOwnedElement[], fieldValues: FieldValues): ConstraintHandle;
}

/**
 * Two-element constraint entry: targets two elements where A may be the layer.
 * Resolves to [PlaneElement, PlaneElement].
 */
interface PairElementConstraintEntry {
  kind: "pair";
  resolveElements(
    fieldValues: FieldValues,
    elementMap: Map<string, ElementEntry>,
    layer?: UIFullscreenLayer,
  ): PlaneElement[] | null;
  create(elements: PlaneElement[], fieldValues: FieldValues): ConstraintHandle;
}

export type ConstraintRegistryEntry = SingleElementConstraintEntry | PairElementConstraintEntry;

export type ResizePolicy =
  | UIResizePolicyCover
  | UIResizePolicyCross
  | UIResizePolicyCrossInverted
  | UIResizePolicyFit
  | UIResizePolicyFixedHeight
  | UIResizePolicyFixedWidth
  | UIResizePolicyNone;

/**
 * PREVIEW_CONSTRAINT_REGISTRY
 *
 * Each entry handles one editor-level constraint type and maps it to one or more
 * library constraint instances (compound handle pattern).
 *
 * - resolveElements: returns the UI element(s) the constraint acts on, or null
 *   if a referenced element hasn't been added to the layer yet (→ pending queue)
 * - create: instantiates the constraint(s) and returns a ConstraintHandle with
 *   update() and destroy() methods
 *
 * To add a new constraint type: add an entry here + add a descriptor in
 * constraint-registry.ts. No other file needs to change.
 */
export const PREVIEW_CONSTRAINT_REGISTRY: Record<string, ConstraintRegistryEntry> = {
  horizontal: {
    kind: "pair",
    resolveElements(fieldValues, elementMap, layer): PlaneElement[] | null {
      const elementAId = fieldValues.elementA as string;
      const elementBId = fieldValues.elementB as string;
      const elementA: PlaneElement | undefined =
        elementAId === "layer" ? layer : elementMap.get(elementAId)?.element;
      const elementB = elementMap.get(elementBId)?.element;
      return elementA !== undefined && elementB !== undefined ? [elementA, elementB] : null;
    },
    create([elementA, elementB]: PlaneElement[], fieldValues: FieldValues): ConstraintHandle {
      const constraint = new UIHorizontalDistanceConstraint(elementA, elementB, {
        distance: fieldValues.distance as number,
        anchorA: fieldValues.anchorA as number,
        anchorB: fieldValues.anchorB as number,
      });
      return {
        instances: [constraint],
        update(updatedValues: FieldValues): void {
          constraint.distance = updatedValues.distance as number;
          constraint.anchorA = updatedValues.anchorA as number;
          constraint.anchorB = updatedValues.anchorB as number;
        },
        destroy(): void {
          constraint.destroy();
        },
      };
    },
  },

  vertical: {
    kind: "pair",
    resolveElements(fieldValues, elementMap, layer): PlaneElement[] | null {
      const elementAId = fieldValues.elementA as string;
      const elementBId = fieldValues.elementB as string;
      const elementA: PlaneElement | undefined =
        elementAId === "layer" ? layer : elementMap.get(elementAId)?.element;
      const elementB = elementMap.get(elementBId)?.element;
      return elementA !== undefined && elementB !== undefined ? [elementA, elementB] : null;
    },
    create([elementA, elementB]: PlaneElement[], fieldValues: FieldValues): ConstraintHandle {
      const constraint = new UIVerticalDistanceConstraint(elementA, elementB, {
        distance: fieldValues.distance as number,
        anchorA: fieldValues.anchorA as number,
        anchorB: fieldValues.anchorB as number,
      });
      return {
        instances: [constraint],
        update(updatedValues: FieldValues): void {
          constraint.distance = updatedValues.distance as number;
          constraint.anchorA = updatedValues.anchorA as number;
          constraint.anchorB = updatedValues.anchorB as number;
        },
        destroy(): void {
          constraint.destroy();
        },
      };
    },
  },

  aspect: {
    kind: "single",
    resolveElements(fieldValues, elementMap): LayerOwnedElement[] | null {
      const element = elementMap.get(fieldValues.elementA as string)?.element;
      return element !== undefined ? [element] : null;
    },
    create([element]: LayerOwnedElement[], fieldValues: FieldValues): ConstraintHandle {
      const constraint = new UIAspectConstraint(element, { aspect: fieldValues.value as number });
      return {
        instances: [constraint],
        update(updatedValues: FieldValues): void {
          constraint.aspect = updatedValues.value as number;
        },
        destroy(): void {
          constraint.destroy();
        },
      };
    },
  },

  width: {
    kind: "single",
    resolveElements(fieldValues, elementMap): LayerOwnedElement[] | null {
      const element = elementMap.get(fieldValues.elementA as string)?.element;
      return element !== undefined ? [element] : null;
    },
    create([element]: LayerOwnedElement[], fieldValues: FieldValues): ConstraintHandle {
      const constraint = new UIWidthConstraint(element, { width: fieldValues.value as number });
      return {
        instances: [constraint],
        update(updatedValues: FieldValues): void {
          constraint.width = updatedValues.value as number;
        },
        destroy(): void {
          constraint.destroy();
        },
      };
    },
  },

  height: {
    kind: "single",
    resolveElements(fieldValues, elementMap): LayerOwnedElement[] | null {
      const element = elementMap.get(fieldValues.elementA as string)?.element;
      return element !== undefined ? [element] : null;
    },
    create([element]: LayerOwnedElement[], fieldValues: FieldValues): ConstraintHandle {
      const constraint = new UIHeightConstraint(element, { height: fieldValues.value as number });
      return {
        instances: [constraint],
        update(updatedValues: FieldValues): void {
          constraint.height = updatedValues.value as number;
        },
        destroy(): void {
          constraint.destroy();
        },
      };
    },
  },

  horizontalProportion: {
    kind: "pair",
    resolveElements(fieldValues, elementMap): PlaneElement[] | null {
      const elementA = elementMap.get(fieldValues.elementA as string)?.element;
      const elementB = elementMap.get(fieldValues.elementB as string)?.element;
      return elementA !== undefined && elementB !== undefined ? [elementA, elementB] : null;
    },
    create([elementA, elementB]: PlaneElement[], fieldValues: FieldValues): ConstraintHandle {
      const constraint = new UIHorizontalProportionConstraint(elementA, elementB, {
        proportion: fieldValues.value as number,
      });
      return {
        instances: [constraint],
        update(updatedValues: FieldValues): void {
          constraint.proportion = updatedValues.value as number;
        },
        destroy(): void {
          constraint.destroy();
        },
      };
    },
  },

  verticalProportion: {
    kind: "pair",
    resolveElements(fieldValues, elementMap): PlaneElement[] | null {
      const elementA = elementMap.get(fieldValues.elementA as string)?.element;
      const elementB = elementMap.get(fieldValues.elementB as string)?.element;
      return elementA !== undefined && elementB !== undefined ? [elementA, elementB] : null;
    },
    create([elementA, elementB]: PlaneElement[], fieldValues: FieldValues): ConstraintHandle {
      const constraint = new UIVerticalProportionConstraint(elementA, elementB, {
        proportion: fieldValues.value as number,
      });
      return {
        instances: [constraint],
        update(updatedValues: FieldValues): void {
          constraint.proportion = updatedValues.value as number;
        },
        destroy(): void {
          constraint.destroy();
        },
      };
    },
  },

  size2d: {
    kind: "single",
    resolveElements(fieldValues, elementMap): LayerOwnedElement[] | null {
      const element = elementMap.get(fieldValues.elementA as string)?.element;
      return element !== undefined ? [element] : null;
    },
    create([element]: LayerOwnedElement[], fieldValues: FieldValues): ConstraintHandle {
      const widthConstraint = new UIWidthConstraint(element, {
        width: fieldValues.width as number,
      });
      const heightConstraint = new UIHeightConstraint(element, {
        height: fieldValues.height as number,
      });
      return {
        instances: [widthConstraint, heightConstraint],
        update(updatedValues: FieldValues): void {
          widthConstraint.width = updatedValues.width as number;
          heightConstraint.height = updatedValues.height as number;
        },
        destroy(): void {
          widthConstraint.destroy();
          heightConstraint.destroy();
        },
      };
    },
  },

  distance2d: {
    kind: "pair",
    resolveElements(fieldValues, elementMap, layer): PlaneElement[] | null {
      const elementAId = fieldValues.elementA as string;
      const elementBId = fieldValues.elementB as string;
      const elementA: PlaneElement | undefined =
        elementAId === "layer" ? layer : elementMap.get(elementAId)?.element;
      const elementB = elementMap.get(elementBId)?.element;
      return elementA !== undefined && elementB !== undefined ? [elementA, elementB] : null;
    },
    create([elementA, elementB]: PlaneElement[], fieldValues: FieldValues): ConstraintHandle {
      const horizontalConstraint = new UIHorizontalDistanceConstraint(elementA, elementB, {
        distance: fieldValues.hDistance as number,
        anchorA: fieldValues.hAnchorA as number,
        anchorB: fieldValues.hAnchorB as number,
      });
      const verticalConstraint = new UIVerticalDistanceConstraint(elementA, elementB, {
        distance: fieldValues.vDistance as number,
        anchorA: fieldValues.vAnchorA as number,
        anchorB: fieldValues.vAnchorB as number,
      });
      return {
        instances: [horizontalConstraint, verticalConstraint],
        update(updatedValues: FieldValues): void {
          horizontalConstraint.distance = updatedValues.hDistance as number;
          horizontalConstraint.anchorA = updatedValues.hAnchorA as number;
          horizontalConstraint.anchorB = updatedValues.hAnchorB as number;
          verticalConstraint.distance = updatedValues.vDistance as number;
          verticalConstraint.anchorA = updatedValues.vAnchorA as number;
          verticalConstraint.anchorB = updatedValues.vAnchorB as number;
        },
        destroy(): void {
          horizontalConstraint.destroy();
          verticalConstraint.destroy();
        },
      };
    },
  },

  proportion2d: {
    kind: "pair",
    resolveElements(fieldValues, elementMap): PlaneElement[] | null {
      const elementA = elementMap.get(fieldValues.elementA as string)?.element;
      const elementB = elementMap.get(fieldValues.elementB as string)?.element;
      return elementA !== undefined && elementB !== undefined ? [elementA, elementB] : null;
    },
    create([elementA, elementB]: PlaneElement[], fieldValues: FieldValues): ConstraintHandle {
      const horizontalConstraint = new UIHorizontalProportionConstraint(elementA, elementB, {
        proportion: fieldValues.hProportion as number,
      });
      const verticalConstraint = new UIVerticalProportionConstraint(elementA, elementB, {
        proportion: fieldValues.vProportion as number,
      });
      return {
        instances: [horizontalConstraint, verticalConstraint],
        update(updatedValues: FieldValues): void {
          horizontalConstraint.proportion = updatedValues.hProportion as number;
          verticalConstraint.proportion = updatedValues.vProportion as number;
        },
        destroy(): void {
          horizontalConstraint.destroy();
          verticalConstraint.destroy();
        },
      };
    },
  },
};

export function buildPolicy(
  policyType: string,
  policyParams: Record<string, number>,
): ResizePolicy {
  switch (policyType) {
    case "cover":
      return new UIResizePolicyCover(policyParams.rectWidth, policyParams.rectHeight);
    case "fit":
      return new UIResizePolicyFit(policyParams.rectWidth, policyParams.rectHeight);
    case "cross":
      return new UIResizePolicyCross(
        policyParams.fixedWidthLandscape,
        policyParams.fixedHeightPortrait,
      );
    case "crossInverted":
      return new UIResizePolicyCrossInverted(
        policyParams.fixedWidthLandscape,
        policyParams.fixedHeightPortrait,
      );
    case "fixedWidth":
      return new UIResizePolicyFixedWidth(
        policyParams.fixedWidthLandscape,
        policyParams.fixedWidthPortrait,
      );
    case "fixedHeight":
      return new UIResizePolicyFixedHeight(
        policyParams.fixedHeightLandscape,
        policyParams.fixedHeightPortrait,
      );
    case "none":
    default:
      return new UIResizePolicyNone();
  }
}

/**
 * Dispatches to the correct resolveElements/create overload based on entry kind.
 * Returns null if elements are not yet available (constraint should be deferred).
 */
export function resolveAndCreate(
  entry: ConstraintRegistryEntry,
  fieldValues: FieldValues,
  layerCtx: LayerContext,
): ConstraintHandle | null {
  if (entry.kind === "single") {
    const elements = entry.resolveElements(fieldValues, layerCtx.elementMap);
    return elements !== null ? entry.create(elements, fieldValues) : null;
  }
  const elements = entry.resolveElements(fieldValues, layerCtx.elementMap, layerCtx.layer);
  return elements !== null ? entry.create(elements, fieldValues) : null;
}
