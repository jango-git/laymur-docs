import rfdc from "rfdc";
import type { EAnyAsset } from "./types.assets";
import type { EAnyConstraint } from "./types.constraints";
import type { ELayerDebug } from "./types.debug";
import type { EAnyElement } from "./types.elements";
import type { EAnyLayer } from "./types.layers";

export interface ELayerContext {
  layer: EAnyLayer;
  debug: ELayerDebug;
  elements: EAnyElement[];
  constraints: EAnyConstraint[];
}

export interface EDocument {
  assets: EAnyAsset[];
  layerContexts: ELayerContext[];
}

export type PartialExceptUUIDField<T extends { uuid: string }> = Partial<Omit<T, "uuid">> &
  Required<Pick<T, "uuid">>;

export const clone = rfdc();
