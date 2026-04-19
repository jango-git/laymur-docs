import { Texture } from "three";
import type { EAnyBridgeMessage } from "../bridge/types";
import { EBridgeMessageType } from "../bridge/types";
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
import { EStoreDeltaOperation } from "../document/signals";
import type { EDocument } from "../document/types";
import { ASSET_DATABASE, LAYER_DATABASE, loadAsset, resetLayerContextActive } from "./internal";
import { removeAsset, updateAsset } from "./receiving.assets";
import { addConstraint, removeConstraint, updateConstraint } from "./receiving.constraints";
import { addElement, removeElement, updateElement } from "./receiving.elements";
import { addLayerContext, removeLayerContext, updateLayer } from "./receiving.layers";

interface ESequenceMessage {
  event: MessageEvent<EAnyBridgeMessage>;
  epoch: number;
}

const SEQUENCE: ESequenceMessage[] = [];

let SEQUENCE_PROCESSING = false;
let SEQUENCE_EPOCH = 0;

export async function receiveMessage(
  receivedEvent: MessageEvent<EAnyBridgeMessage>,
): Promise<void> {
  SEQUENCE.push({ event: receivedEvent, epoch: SEQUENCE_EPOCH });

  if (SEQUENCE_PROCESSING) {
    return;
  }

  SEQUENCE_PROCESSING = true;

  while (SEQUENCE.length > 0) {
    const { event, epoch } = SEQUENCE.shift() as ESequenceMessage;

    if (epoch !== SEQUENCE_EPOCH) {
      continue;
    }

    await handleMessage(event);

    if (epoch !== SEQUENCE_EPOCH) {
      break;
    }
  }

  SEQUENCE_PROCESSING = false;
}

async function handleMessage(event: MessageEvent<EAnyBridgeMessage>): Promise<void> {
  const message = event.data;

  switch (message.type) {
    case EBridgeMessageType.SETUP:
      await handleMessageSetup(message.payload);
      break;
    case EBridgeMessageType.ASSETS_LIST_CHANGED:
      await handleMessageAssetsListChanged(message.payload);
      break;
    case EBridgeMessageType.ASSETS_ITEM_CHANGED:
      await handleMessageAssetsItemChanged(message.payload);
      break;
    case EBridgeMessageType.LAYERS_LIST_CHANGED:
      handleMessageLayersListChanged(message.payload);
      break;
    case EBridgeMessageType.LAYERS_ITEM_CHANGED:
      handleMessageLayersItemChanged(message.payload);
      break;
    case EBridgeMessageType.ELEMENTS_LIST_CHANGED:
      handleMessageElementsListChanged(message.payload);
      break;
    case EBridgeMessageType.ELEMENTS_ITEM_CHANGED:
      handleMessageElementsItemChanged(message.payload);
      break;
    case EBridgeMessageType.CONSTRAINTS_LIST_CHANGED:
      handleMessageConstraintsListChanged(message.payload);
      break;
    case EBridgeMessageType.CONSTRAINTS_ITEM_CHANGED:
      handleMessageConstraintsItemChanged(message.payload);
      break;
  }
}

// ── Setup ────────────────────────────────────────────────────────────────────

async function handleMessageSetup(payload: EDocument): Promise<void> {
  SEQUENCE_EPOCH += 1;
  SEQUENCE.length = 0;

  resetLayerContextActive();

  for (const layerContext of LAYER_DATABASE.values()) {
    layerContext.debug.destroy();
    for (const constraint of layerContext.constraints.values()) {
      constraint.destroy();
    }
    for (const element of layerContext.elements.values()) {
      element.destroy();
    }
    layerContext.layer.destroy();
  }
  LAYER_DATABASE.clear();

  for (const asset of ASSET_DATABASE.values()) {
    if (asset instanceof Texture) {
      asset.dispose();
    } else {
      document.fonts.delete(asset);
    }
  }
  ASSET_DATABASE.clear();

  for (const asset of payload.assets) {
    await loadAsset(asset);
  }

  for (const layerContext of payload.layerContexts) {
    addLayerContext(layerContext);
  }
}

// ── Assets ───────────────────────────────────────────────────────────────────

async function handleMessageAssetsListChanged(payload: EStoreDeltaAssets): Promise<void> {
  switch (payload.operation) {
    case EStoreDeltaOperation.ADD:
      await loadAsset(payload.asset);
      break;
    case EStoreDeltaOperation.REMOVE:
      removeAsset(payload.uuid);
      break;
    case EStoreDeltaOperation.REORDER:
      break;
  }
}

async function handleMessageAssetsItemChanged(payload: EStoreDeltaAsset): Promise<void> {
  await updateAsset(payload.asset);
}

// ── Layers ───────────────────────────────────────────────────────────────────

function handleMessageLayersListChanged(payload: EStoreDeltaLayerList): void {
  switch (payload.operation) {
    case EStoreDeltaOperation.ADD:
      addLayerContext(payload.layerContext);
      break;
    case EStoreDeltaOperation.REMOVE:
      removeLayerContext(payload.uuid);
      break;
    case EStoreDeltaOperation.REORDER:
      break;
  }
}

function handleMessageLayersItemChanged(payload: EStoreDeltaLayer): void {
  updateLayer(payload.layer);
}

// Elements

function handleMessageElementsListChanged(payload: EStoreDeltaElements): void {
  switch (payload.operation) {
    case EStoreDeltaOperation.ADD:
      addElement(payload.layerUuid, payload.element);
      break;
    case EStoreDeltaOperation.REMOVE:
      removeElement(payload.layerUuid, payload.uuid);
      break;
    case EStoreDeltaOperation.REORDER:
      break;
  }
}

function handleMessageElementsItemChanged(payload: EStoreDeltaElement): void {
  updateElement(payload.element);
}

// Constraints

function handleMessageConstraintsListChanged(payload: EStoreDeltaConstraints): void {
  switch (payload.operation) {
    case EStoreDeltaOperation.ADD:
      addConstraint(payload.layerUuid, payload.constraint);
      break;
    case EStoreDeltaOperation.REMOVE:
      removeConstraint(payload.layerUuid, payload.uuid);
      break;
    case EStoreDeltaOperation.REORDER:
      break;
  }
}

function handleMessageConstraintsItemChanged(payload: EStoreDeltaConstraint): void {
  updateConstraint(payload.constraint);
}
