import { UIFullscreenLayer } from "laymur";
import { UILayerDebug } from "laymur/debug";
import type { ELayerContext } from "../document/types";
import type { EAnyLayer } from "../document/types.layers";
import type { UUID } from "../document/types.misc";
import {
  LAYER_DATABASE,
  buildResizePolicy,
  isLayerContextActive,
  resetLayerContextActive,
  resolveLayerContext,
  setLayerContextActive,
} from "./miscellaneous";
import { addConstraint } from "./receiving.constraints";
import { addElement } from "./receiving.elements";
import type { EPreviewLayerContext } from "./types";

export function addLayerContext(layerContext: ELayerContext): void {
  const { layer, elements, constraints } = layerContext;

  const uiLayer = new UIFullscreenLayer({
    name: layer.name,
    resizePolicy: buildResizePolicy(layer.resizePolicy, layer.resizePolicyParameters),
  });

  const previewLayerContext: EPreviewLayerContext = {
    layer: uiLayer,
    debug: new UILayerDebug(uiLayer),
    elements: new Map(),
    constraints: new Map(),
  };

  LAYER_DATABASE.set(layer.uuid, previewLayerContext);
  setLayerContextActive(layer.uuid, true);

  for (const element of elements) {
    addElement(layer.uuid, element);
  }
  for (const constraint of constraints) {
    addConstraint(layer.uuid, constraint);
  }
}

export function removeLayerContext(uuid: UUID): void {
  const layerContext = resolveLayerContext(uuid);

  if (isLayerContextActive(uuid)) {
    resetLayerContextActive();
  }

  layerContext.debug.destroy();
  for (const constraint of layerContext.constraints.values()) {
    constraint.destroy();
  }
  for (const element of layerContext.elements.values()) {
    element.destroy();
  }
  layerContext.layer.destroy();
  LAYER_DATABASE.delete(uuid);
}

export function updateLayer(layer: EAnyLayer): void {
  const layerContext = resolveLayerContext(layer.uuid);
  layerContext.layer.name = layer.name;
  layerContext.layer.resizePolicy = buildResizePolicy(
    layer.resizePolicy,
    layer.resizePolicyParameters,
  );
}
