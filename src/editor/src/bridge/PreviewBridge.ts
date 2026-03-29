import type { LayerState } from "../types";
import type { EditorMessage } from "./messages";

export class PreviewBridge {
  private readonly frame: HTMLIFrameElement;

  constructor(frame: HTMLIFrameElement) {
    this.frame = frame;
  }

  public whenReady(callback: () => void): void {
    this.frame.addEventListener("load", () => {
      console.debug("[bridge] whenReady: load event fired");
      callback();
    });
    if (this.frame.contentDocument?.readyState === "complete") {
      console.debug("[bridge] whenReady: iframe already ready, firing immediately");
      callback();
    }
  }

  public resetScene(): void {
    console.debug("[bridge] postMessage RESET_SCENE");
    this.sendMessage({ type: "RESET_SCENE" });
  }

  public addLayer(layer: LayerState): void {
    console.debug("[bridge] postMessage ADD_LAYER layerId=%s", layer.id);
    this.sendMessage({
      type: "ADD_LAYER",
      layerId: layer.id,
      name: layer.name,
      policyType: layer.policyType,
      policyParams: { ...layer.policyParams },
    });
  }

  public setActiveLayer(layerId: string): void {
    console.debug("[bridge] postMessage SET_ACTIVE_LAYER layerId=%s", layerId);
    this.sendMessage({ type: "SET_ACTIVE_LAYER", layerId });
  }

  public updateLayer(layer: LayerState): void {
    console.debug("[bridge] postMessage SET_LAYER_CONFIG layerId=%s", layer.id);
    this.sendMessage({
      type: "SET_LAYER_CONFIG",
      layerId: layer.id,
      name: layer.name,
      policyType: layer.policyType,
      policyParams: { ...layer.policyParams },
    });
  }

  public removeLayer(layerId: string): void {
    console.debug("[bridge] postMessage REMOVE_LAYER layerId=%s", layerId);
    this.sendMessage({ type: "REMOVE_LAYER", layerId });
  }

  public addImage(id: string, layerId: string, dataURL: string): void {
    console.debug("[bridge] postMessage ADD_IMAGE id=%s layerId=%s dataURL=%s", id, layerId, dataURL.slice(0, 40) + "…");
    this.sendMessage({ type: "ADD_IMAGE", id, layerId, dataURL });
  }

  public removeElement(id: string, layerId: string): void {
    console.debug("[bridge] postMessage REMOVE_ELEMENT id=%s layerId=%s", id, layerId);
    this.sendMessage({ type: "REMOVE_ELEMENT", id, layerId });
  }

  public reorderElements(layerId: string, orderedIds: string[]): void {
    console.debug("[bridge] postMessage REORDER_ELEMENTS layerId=%s ids=%o", layerId, orderedIds);
    this.sendMessage({ type: "REORDER_ELEMENTS", layerId, orderedIds });
  }

  public setElementTexture(id: string, layerId: string, dataURL: string): void {
    console.debug("[bridge] postMessage SET_ELEMENT_TEXTURE id=%s layerId=%s dataURL=%s", id, layerId, dataURL.slice(0, 40) + "…");
    this.sendMessage({ type: "SET_ELEMENT_TEXTURE", id, layerId, dataURL });
  }

  public addConstraint(
    id: string,
    layerId: string,
    constraintType: string,
    fieldValues: Record<string, string | number>,
  ): void {
    console.debug("[bridge] postMessage ADD_CONSTRAINT id=%s layerId=%s type=%s", id, layerId, constraintType);
    this.sendMessage({ type: "ADD_CONSTRAINT", id, layerId, constraintType, fieldValues });
  }

  public updateConstraint(
    id: string,
    layerId: string,
    constraintType: string,
    fieldValues: Record<string, string | number>,
  ): void {
    console.debug("[bridge] postMessage UPDATE_CONSTRAINT id=%s layerId=%s type=%s", id, layerId, constraintType);
    this.sendMessage({ type: "UPDATE_CONSTRAINT", id, layerId, constraintType, fieldValues });
  }

  public removeConstraint(id: string, layerId: string): void {
    console.debug("[bridge] postMessage REMOVE_CONSTRAINT id=%s layerId=%s", id, layerId);
    this.sendMessage({ type: "REMOVE_CONSTRAINT", id, layerId });
  }

  private sendMessage(message: EditorMessage): void {
    this.frame.contentWindow?.postMessage(message, "*");
  }
}
