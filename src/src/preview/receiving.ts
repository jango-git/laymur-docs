import type { UILayerDebug } from "laymur/debug";
import { Texture } from "three";
import type { EAnyBridgeMessage } from "../bridge/types";
import { EBridgeMessageType } from "../bridge/types";
import { EStoreDeltaOperation } from "../document/signals";
import type { EStoreDeltaAsset, EStoreDeltaAssetList } from "../document/signals/assets";
import type {
  EStoreDeltaConstraint,
  EStoreDeltaConstraintList,
} from "../document/signals/constraints";
import type { EStoreDeltaElement, EStoreDeltaElementList } from "../document/signals/elements";
import type { EStoreDeltaLayer, EStoreDeltaLayerList } from "../document/signals/layers";
import type { EDocument } from "../document/types";
import type { ELayerUUID } from "../document/types.misc";
import { consoleError } from "../miscellaneous/debug.print";
import type { EUIDebugState } from "../ui-state/EUIState.Internal";
import {
  ASSET_DATABASE,
  getLayerContextActive,
  LAYER_DATABASE,
  resetLayerContextActive,
  setLayerContextActive,
} from "./miscellaneous";
import { addAsset, removeAsset, updateAsset } from "./receiving.assets";
import { addConstraint, removeConstraint, updateConstraint } from "./receiving.constraints";
import { addElement, removeElement, reorderElements, updateElement } from "./receiving.elements";
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

    // Keep draining the queue. A setup processed during the await bumps the
    // epoch and clears stale messages, but valid newer-epoch ones queued
    // meanwhile (e.g. the ACTIVE_LAYER_CHANGED that follows SETUP) must still
    // run; the pre-check at the top of the loop skips any that are stale.
    await handleMessage(event);
  }

  SEQUENCE_PROCESSING = false;
}

async function handleMessage(event: MessageEvent<EAnyBridgeMessage>): Promise<void> {
  const message = event.data;

  switch (message.type) {
    case EBridgeMessageType.SETUP:
      await handleMessageSetup(message.payload);
      break;
    case EBridgeMessageType.ACTIVE_LAYER_CHANGED:
      handleMessageActiveLayerChanged(message.payload);
      break;
    case EBridgeMessageType.DEBUG_CHANGED:
      handleMessageDebugChanged(message.payload);
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

// Teardown must always finish (clear LAYER_DATABASE + rebuild). A single
// destroy() throwing - e.g. a laymur bug in a specific element's teardown -
// must not abort the loop and leave a stale, unrenderable state behind.
function safeDestroy(label: string, destroy: () => void): void {
  try {
    destroy();
  } catch (error) {
    consoleError(`[preview] failed to destroy ${label}; continuing teardown`, error);
  }
}

async function handleMessageSetup(payload: EDocument): Promise<void> {
  SEQUENCE_EPOCH += 1;
  SEQUENCE.length = 0;

  resetLayerContextActive();

  for (const layerContext of LAYER_DATABASE.values()) {
    safeDestroy("layer debug", () => layerContext.debug.destroy());
    for (const constraint of layerContext.constraints.values()) {
      safeDestroy("constraint", () => constraint.destroy());
    }
    for (const element of layerContext.elements.values()) {
      safeDestroy("element", () => element.destroy());
    }
    safeDestroy("layer", () => layerContext.layer.destroy());
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
    await addAsset(asset);
  }

  for (const layerContext of payload.layerContexts) {
    addLayerContext(layerContext);
  }

  applyDebugState();
}

function handleMessageActiveLayerChanged(payload: ELayerUUID | undefined): void {
  if (payload === undefined) {
    resetLayerContextActive();
  } else {
    setLayerContextActive(payload, true);
  }
  // Debug is an editor-global overlay applied to the active layer, so re-apply
  // it whenever the active layer changes (so it survives layer switches).
  applyDebugState();
}

let DEBUG_STATE: EUIDebugState | undefined;

function handleMessageDebugChanged(payload: EUIDebugState): void {
  DEBUG_STATE = payload;
  applyDebugState();
}

// Debug is an editor-global overlay shown only on the active layer. UILayerDebug
// defaults every flag to true when nothing is set, so every layer must be driven
// explicitly: the active one gets DEBUG_STATE, all others are forced off.
function applyDebugState(): void {
  const activeContext = getLayerContextActive();
  for (const layerContext of LAYER_DATABASE.values()) {
    applyDebugToLayer(layerContext.debug, layerContext === activeContext ? DEBUG_STATE : undefined);
  }
}

function applyDebugToLayer(debug: UILayerDebug, state: EUIDebugState | undefined): void {
  debug.showAspect = state?.showAspect ?? false;
  debug.showHeight = state?.showHeight ?? false;
  debug.showWidth = state?.showWidth ?? false;
  debug.showHorizontalDistance = state?.showHorizontalDistance ?? false;
  debug.showHorizontalInterpolation = state?.showHorizontalInterpolation ?? false;
  debug.showVerticalDistance = state?.showVerticalDistance ?? false;
  debug.showVerticalInterpolation = state?.showVerticalInterpolation ?? false;
}

async function handleMessageAssetsListChanged(payload: EStoreDeltaAssetList): Promise<void> {
  switch (payload.operation) {
    case EStoreDeltaOperation.ADD:
      await addAsset(payload.asset);
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

function handleMessageLayersListChanged(payload: EStoreDeltaLayerList): void {
  switch (payload.operation) {
    case EStoreDeltaOperation.ADD:
      addLayerContext(payload.layerContext);
      // A fresh UILayerDebug defaults all flags on; force the new layer to match
      // the editor state (off, unless it is the active one).
      applyDebugState();
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

function handleMessageElementsListChanged(payload: EStoreDeltaElementList): void {
  switch (payload.operation) {
    case EStoreDeltaOperation.ADD:
      addElement(payload.layerUuid, payload.element);
      break;
    case EStoreDeltaOperation.REMOVE:
      removeElement(payload.layerUuid, payload.uuid);
      break;
    case EStoreDeltaOperation.REORDER:
      reorderElements(payload.layerUuid, payload.uuids);
      break;
  }
}

function handleMessageElementsItemChanged(payload: EStoreDeltaElement): void {
  updateElement(payload.element);
}

function handleMessageConstraintsListChanged(payload: EStoreDeltaConstraintList): void {
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
