import { UIFullscreenLayer, UIImage } from "laymur";
import { UILayerDebug } from "laymur/debug";
import type { Texture } from "three";
import { Clock, SRGBColorSpace, TextureLoader, WebGLRenderer } from "three";
import type { EditorMessage } from "../bridge/messages";
import type {
  ConstraintRegistryEntry,
  FieldValues,
  LayerContext,
  PendingConstraint,
} from "./Preview.Internal";
import { buildPolicy, PREVIEW_CONSTRAINT_REGISTRY, resolveAndCreate } from "./Preview.Internal";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const clock = new Clock();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const layerMap = new Map<string, LayerContext>();
let activeLayerId: string | null = null;
const pendingConstraints: PendingConstraint[] = [];

function animate(): void {
  requestAnimationFrame(animate);
  const layerCtx = activeLayerId !== null ? layerMap.get(activeLayerId) : undefined;
  if (layerCtx !== undefined) {
    layerCtx.layer.render(renderer, clock.getDelta());
  }
}
animate();

function loadTexture(dataURL: string): Promise<Texture> {
  return new Promise((resolve) => {
    new TextureLoader().load(dataURL, (texture) => {
      texture.colorSpace = SRGBColorSpace;
      resolve(texture);
    });
  });
}

function tryApplyPendingConstraints(): void {
  const retry: PendingConstraint[] = [];
  for (const item of pendingConstraints) {
    const layerCtx = layerMap.get(item.layerId);
    if (layerCtx === undefined) {
      continue;
    }
    const entry = PREVIEW_CONSTRAINT_REGISTRY[item.constraintType] as
      | ConstraintRegistryEntry
      | undefined;
    if (entry === undefined) {
      continue;
    }
    const handle = resolveAndCreate(entry, item.fieldValues, layerCtx);
    if (handle === null) {
      retry.push(item);
      continue;
    }
    console.debug(
      "[preview] pending constraint applied id=%s type=%s",
      item.id,
      item.constraintType,
    );
    layerCtx.constraintMap.set(item.id, handle);
  }
  pendingConstraints.length = 0;
  pendingConstraints.push(...retry);
}

window.addEventListener("message", (event) => {
  void handleMessage(event as MessageEvent<EditorMessage>);
});

async function handleMessage(event: MessageEvent<EditorMessage>): Promise<void> {
  const msg = event.data;

  switch (msg.type) {
    case "RESET_SCENE": {
      console.debug("[preview] RESET_SCENE");
      for (const [, layerCtx] of layerMap) {
        for (const [, handle] of layerCtx.constraintMap) {
          handle.destroy();
        }
        for (const [, elementEntry] of layerCtx.elementMap) {
          elementEntry.element.destroy();
          elementEntry.texture.dispose();
        }
        layerCtx.debug.destroy();
      }
      layerMap.clear();
      pendingConstraints.length = 0;
      activeLayerId = null;
      break;
    }

    case "ADD_LAYER": {
      console.debug("[preview] ADD_LAYER id=%s name=%s", msg.layerId, msg.name);
      const layer = new UIFullscreenLayer();
      layer.name = msg.name;
      layer.resizePolicy = buildPolicy(msg.policyType, msg.policyParams);
      layerMap.set(msg.layerId, {
        layer,
        debug: new UILayerDebug(layer),
        elementMap: new Map(),
        constraintMap: new Map(),
      });
      break;
    }

    case "SET_ACTIVE_LAYER": {
      console.debug("[preview] SET_ACTIVE_LAYER id=%s", msg.layerId);
      activeLayerId = msg.layerId;
      break;
    }

    case "REMOVE_LAYER": {
      console.debug("[preview] REMOVE_LAYER id=%s", msg.layerId);
      const layerCtx = layerMap.get(msg.layerId);
      if (layerCtx === undefined) {
        break;
      }
      for (const [, handle] of layerCtx.constraintMap) {
        handle.destroy();
      }
      for (const [, elementEntry] of layerCtx.elementMap) {
        elementEntry.element.destroy();
        elementEntry.texture.dispose();
      }
      layerCtx.debug.destroy();
      layerMap.delete(msg.layerId);
      break;
    }

    case "SET_LAYER_CONFIG": {
      console.debug("[preview] SET_LAYER_CONFIG id=%s name=%s", msg.layerId, msg.name);
      const layerCtx = layerMap.get(msg.layerId);
      if (layerCtx === undefined) {
        break;
      }
      layerCtx.layer.name = msg.name;
      layerCtx.layer.resizePolicy = buildPolicy(msg.policyType, msg.policyParams);
      break;
    }

    case "ADD_IMAGE": {
      console.debug("[preview] ADD_IMAGE id=%s layerId=%s", msg.id, msg.layerId);
      const layerCtx = layerMap.get(msg.layerId);
      if (layerCtx === undefined) {
        console.warn("[preview] ADD_IMAGE - layerId=%s not in layerMap", msg.layerId);
        break;
      }
      const texture = await loadTexture(msg.dataURL);
      const image = new UIImage(layerCtx.layer, texture);
      layerCtx.elementMap.set(msg.id, { element: image, texture });
      console.debug(
        "[preview] ADD_IMAGE done id=%s elementMap size=%d",
        msg.id,
        layerCtx.elementMap.size,
      );
      tryApplyPendingConstraints();
      break;
    }

    case "REMOVE_ELEMENT": {
      console.debug("[preview] REMOVE_ELEMENT id=%s layerId=%s", msg.id, msg.layerId);
      const layerCtx = layerMap.get(msg.layerId);
      if (layerCtx === undefined) {
        break;
      }
      const elementEntry = layerCtx.elementMap.get(msg.id);
      if (elementEntry !== undefined) {
        elementEntry.element.destroy();
        elementEntry.texture.dispose();
        layerCtx.elementMap.delete(msg.id);
      }
      break;
    }

    case "REORDER_ELEMENTS": {
      console.debug("[preview] REORDER_ELEMENTS layerId=%s ids=%o", msg.layerId, msg.orderedIds);
      const layerCtx = layerMap.get(msg.layerId);
      if (layerCtx === undefined) {
        break;
      }
      for (const [index, elementId] of msg.orderedIds.entries()) {
        const elementEntry = layerCtx.elementMap.get(elementId);
        if (elementEntry !== undefined) {
          elementEntry.element.zIndex = index;
        }
      }
      break;
    }

    case "SET_ELEMENT_TEXTURE": {
      console.debug("[preview] SET_ELEMENT_TEXTURE id=%s layerId=%s", msg.id, msg.layerId);
      const layerCtx = layerMap.get(msg.layerId);
      if (layerCtx === undefined) {
        break;
      }
      const elementEntry = layerCtx.elementMap.get(msg.id);
      if (elementEntry === undefined) {
        break;
      }
      const newTexture = await loadTexture(msg.dataURL);
      elementEntry.element.texture.set(newTexture);
      elementEntry.texture.dispose();
      elementEntry.texture = newTexture;
      break;
    }

    case "ADD_CONSTRAINT": {
      console.debug(
        "[preview] ADD_CONSTRAINT id=%s type=%s layerId=%s",
        msg.id,
        msg.constraintType,
        msg.layerId,
      );
      const layerCtx = layerMap.get(msg.layerId);
      if (layerCtx === undefined) {
        break;
      }
      const entry = PREVIEW_CONSTRAINT_REGISTRY[msg.constraintType] as
        | ConstraintRegistryEntry
        | undefined;
      if (entry === undefined) {
        console.warn("[preview] ADD_CONSTRAINT - unknown type=%s", msg.constraintType);
        break;
      }
      const handle = resolveAndCreate(entry, msg.fieldValues, layerCtx);
      if (handle === null) {
        console.debug("[preview] ADD_CONSTRAINT deferred id=%s (elements not yet ready)", msg.id);
        pendingConstraints.push({
          id: msg.id,
          layerId: msg.layerId,
          constraintType: msg.constraintType,
          fieldValues: msg.fieldValues,
        });
        break;
      }
      layerCtx.constraintMap.set(msg.id, handle);
      break;
    }

    case "UPDATE_CONSTRAINT": {
      const layerCtx = layerMap.get(msg.layerId);
      if (layerCtx === undefined) {
        break;
      }
      const handle = layerCtx.constraintMap.get(msg.id);
      if (handle !== undefined) {
        handle.update(msg.fieldValues as FieldValues);
      }
      break;
    }

    case "REMOVE_CONSTRAINT": {
      console.debug("[preview] REMOVE_CONSTRAINT id=%s layerId=%s", msg.id, msg.layerId);
      const layerCtx = layerMap.get(msg.layerId);
      if (layerCtx === undefined) {
        break;
      }
      const handle = layerCtx.constraintMap.get(msg.id);
      if (handle !== undefined) {
        handle.destroy();
        layerCtx.constraintMap.delete(msg.id);
      }
      break;
    }

    case "SET_LAYER_DEBUG": {
      console.debug("[preview] SET_LAYER_DEBUG layerId=%s filters=%o", msg.layerId, msg.filters);
      const layerContext = layerMap.get(msg.layerId);
      if (layerContext === undefined) {
        break;
      }
      const { debug } = layerContext;
      if (msg.filters.showAspect !== undefined) {
        debug.showAspect = msg.filters.showAspect;
      }
      if (msg.filters.showHeight !== undefined) {
        debug.showHeight = msg.filters.showHeight;
      }
      if (msg.filters.showWidth !== undefined) {
        debug.showWidth = msg.filters.showWidth;
      }
      if (msg.filters.showHorizontalDistance !== undefined) {
        debug.showHorizontalDistance = msg.filters.showHorizontalDistance;
      }
      if (msg.filters.showHorizontalInterpolation !== undefined) {
        debug.showHorizontalInterpolation = msg.filters.showHorizontalInterpolation;
      }
      if (msg.filters.showVerticalDistance !== undefined) {
        debug.showVerticalDistance = msg.filters.showVerticalDistance;
      }
      if (msg.filters.showVerticalInterpolation !== undefined) {
        debug.showVerticalInterpolation = msg.filters.showVerticalInterpolation;
      }
      break;
    }

    case "SET_THEME": {
      console.debug("[preview] SET_THEME theme=%s", msg.theme);
      document.documentElement.setAttribute("data-theme", msg.theme);
      break;
    }
  }
}
