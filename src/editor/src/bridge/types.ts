import type {
  EStoreDeltaAsset,
  EStoreDeltaAssets,
  EStoreDeltaConstraint,
  EStoreDeltaConstraints,
  EStoreDeltaElement,
  EStoreDeltaElements,
  EStoreDeltaLayer,
  EStoreDeltaLayerList,
} from "../document/signals";
import type { EDocument } from "../document/types";

export enum EBridgeMessageType {
  SETUP = "SETUP",
  ASSETS_LIST_CHANGED = "ASSETS_LIST_CHANGED",
  ASSETS_ITEM_CHANGED = "ASSETS_ITEM_CHANGED",
  LAYERS_LIST_CHANGED = "LAYERS_LIST_CHANGED",
  LAYERS_ITEM_CHANGED = "LAYERS_ITEM_CHANGED",
  ELEMENTS_LIST_CHANGED = "ELEMENTS_LIST_CHANGED",
  ELEMENTS_ITEM_CHANGED = "ELEMENTS_ITEM_CHANGED",
  CONSTRAINTS_LIST_CHANGED = "CONSTRAINTS_LIST_CHANGED",
  CONSTRAINTS_ITEM_CHANGED = "CONSTRAINTS_ITEM_CHANGED",
}

interface EBridgeMessage {
  type: EBridgeMessageType;
  payload: unknown;
}

export interface EBridgeMessageSetup extends EBridgeMessage {
  type: EBridgeMessageType.SETUP;
  payload: EDocument;
}

export interface EBridgeMessageAssetsListChanged extends EBridgeMessage {
  type: EBridgeMessageType.ASSETS_LIST_CHANGED;
  payload: EStoreDeltaAssets;
}

export interface EBridgeMessageAssetsItemChanged extends EBridgeMessage {
  type: EBridgeMessageType.ASSETS_ITEM_CHANGED;
  payload: EStoreDeltaAsset;
}

export interface EBridgeMessageLayersListChanged extends EBridgeMessage {
  type: EBridgeMessageType.LAYERS_LIST_CHANGED;
  payload: EStoreDeltaLayerList;
}

export interface EBridgeMessageLayersItemChanged extends EBridgeMessage {
  type: EBridgeMessageType.LAYERS_ITEM_CHANGED;
  payload: EStoreDeltaLayer;
}

export interface EBridgeMessageElementsListChanged extends EBridgeMessage {
  type: EBridgeMessageType.ELEMENTS_LIST_CHANGED;
  payload: EStoreDeltaElements;
}

export interface EBridgeMessageElementsItemChanged extends EBridgeMessage {
  type: EBridgeMessageType.ELEMENTS_ITEM_CHANGED;
  payload: EStoreDeltaElement;
}

export interface EBridgeMessageConstraintsListChanged extends EBridgeMessage {
  type: EBridgeMessageType.CONSTRAINTS_LIST_CHANGED;
  payload: EStoreDeltaConstraints;
}

export interface EBridgeMessageConstraintsItemChanged extends EBridgeMessage {
  type: EBridgeMessageType.CONSTRAINTS_ITEM_CHANGED;
  payload: EStoreDeltaConstraint;
}

export type EAnyBridgeMessage =
  | EBridgeMessageSetup
  | EBridgeMessageAssetsListChanged
  | EBridgeMessageAssetsItemChanged
  | EBridgeMessageLayersListChanged
  | EBridgeMessageLayersItemChanged
  | EBridgeMessageElementsListChanged
  | EBridgeMessageElementsItemChanged
  | EBridgeMessageConstraintsListChanged
  | EBridgeMessageConstraintsItemChanged;
