import rfdc from "rfdc";
import type { EAnyAsset } from "./types.assets";
import type { EAnyConstraint } from "./types.constraints";
import type { EAnyElement } from "./types.elements";
import type { EAnyLayer } from "./types.layers";
import type { EAnyUUID } from "./types.misc";
export interface ELayerContext {
  layer: EAnyLayer;
  elements: EAnyElement[];
  constraints: EAnyConstraint[];
}

export interface EDocument {
  assets: EAnyAsset[];
  layerContexts: ELayerContext[];
}

export type PartialExceptUUIDField<T extends { uuid: EAnyUUID }> = Partial<Omit<T, "uuid">> &
  Required<Pick<T, "uuid">>;

export const clone = rfdc();
