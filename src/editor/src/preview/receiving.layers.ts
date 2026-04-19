import { UIFullscreenLayer } from "laymur";
import { UILayerDebug } from "laymur/debug";
import type { ELayerContext as EDocLayerContext } from "../document/types";
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
import type { UILayerContext } from "./types";

export function addLayerContext(docLayerContext: EDocLayerContext): void {
  const { layer, elements, constraints } = docLayerContext;

  const uiLayer = new UIFullscreenLayer({
    name: layer.name,
    resizePolicy: buildResizePolicy(layer.resizePolicy, layer.resizePolicyParameters),
  });

  const layerCtx: UILayerContext = {
    layer: uiLayer,
    debug: new UILayerDebug(uiLayer),
    elements: new Map(),
    constraints: new Map(),
  };

  LAYER_DATABASE.set(layer.uuid, layerCtx);
  setLayerContextActive(layer.uuid, true);

  for (const element of elements) {
    addElement(layer.uuid, element);
  }
  for (const constraint of constraints) {
    addConstraint(layer.uuid, constraint);
  }
}

export function removeLayerContext(uuid: UUID): void {
  const ctx = resolveLayerContext(uuid);

  if (isLayerContextActive(uuid)) {
    resetLayerContextActive();
  }

  ctx.debug.destroy();
  for (const c of ctx.constraints.values()) {
    c.destroy();
  }
  for (const e of ctx.elements.values()) {
    e.destroy();
  }
  ctx.layer.destroy();
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
