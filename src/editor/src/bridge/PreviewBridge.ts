/**
 * PreviewBridge.ts
 *
 * Typed wrapper around postMessage to the preview iframe.
 * One method per message type - no scattered postMessage calls in other modules.
 */

import type { LayerState } from "../types";
import type { EditorMessage } from "./messages";

export class PreviewBridge {
  private readonly frame: HTMLIFrameElement;

  constructor(frame: HTMLIFrameElement) {
    this.frame = frame;
  }

  private send(msg: EditorMessage) {
    this.frame.contentWindow?.postMessage(msg, "*");
  }

  whenReady(callback: () => void) {
    if (this.frame.contentDocument?.readyState === "complete") {
      callback();
    } else {
      this.frame.addEventListener("load", callback, { once: true });
    }
  }

  resetScene() {
    this.send({ type: "RESET_SCENE" });
  }

  addLayer(layer: LayerState) {
    this.send({
      type: "ADD_LAYER",
      layerId: layer.id,
      name: layer.name,
      policyType: layer.policyType,
      policyParams: { ...layer.policyParams },
    });
  }

  setActiveLayer(layerId: string) {
    this.send({ type: "SET_ACTIVE_LAYER", layerId });
  }

  removeLayer(layerId: string) {
    this.send({ type: "REMOVE_LAYER", layerId });
  }

  setLayerConfig(layer: LayerState) {
    this.send({
      type: "SET_LAYER_CONFIG",
      layerId: layer.id,
      name: layer.name,
      policyType: layer.policyType,
      policyParams: { ...layer.policyParams },
    });
  }

  addImage(id: string, layerId: string, dataURL: string) {
    this.send({ type: "ADD_IMAGE", id, layerId, dataURL });
  }

  removeElement(id: string, layerId: string) {
    this.send({ type: "REMOVE_ELEMENT", id, layerId });
  }

  reorderElements(layerId: string, orderedIds: string[]) {
    this.send({ type: "REORDER_ELEMENTS", layerId, orderedIds });
  }

  setElementTexture(id: string, layerId: string, dataURL: string) {
    this.send({ type: "SET_ELEMENT_TEXTURE", id, layerId, dataURL });
  }

  addConstraint(
    id: string,
    layerId: string,
    constraintType: string,
    fieldValues: Record<string, string | number>,
  ) {
    this.send({ type: "ADD_CONSTRAINT", id, layerId, constraintType, fieldValues });
  }

  updateConstraint(
    id: string,
    layerId: string,
    constraintType: string,
    fieldValues: Record<string, string | number>,
  ) {
    this.send({ type: "UPDATE_CONSTRAINT", id, layerId, constraintType, fieldValues });
  }

  removeConstraint(id: string, layerId: string) {
    this.send({ type: "REMOVE_CONSTRAINT", id, layerId });
  }
}
