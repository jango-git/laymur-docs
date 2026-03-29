import {
  UIAspectConstraint,
  UIFullscreenLayer,
  UIHeightConstraint,
  UIHorizontalDistanceConstraint,
  UIHorizontalProportionConstraint,
  UIImage,
  UIResizePolicyCover,
  UIResizePolicyCross,
  UIResizePolicyCrossInverted,
  UIResizePolicyFit,
  UIResizePolicyFixedHeight,
  UIResizePolicyFixedWidth,
  UIResizePolicyNone,
  UIVerticalDistanceConstraint,
  UIVerticalProportionConstraint,
  UIWidthConstraint,
} from "laymur";
import type { Texture } from "three";
import { Clock, SRGBColorSpace, TextureLoader, WebGLRenderer } from "three";
import type { EditorMessage } from "./bridge/messages";

/**
 * PREVIEW_CONSTRAINT_REGISTRY
 *
 * Each entry handles one editor-level constraint type and maps it to one or more
 * library constraint instances (compound handle pattern).
 *
 * Interface per entry:
 *   resolveElements(fieldValues, elementMap, layer) : array of resolved elements, or null
 *   create(...resolvedElements, fieldValues) : CompoundConstraintHandle
 *
 * CompoundConstraintHandle:
 *   { instances, update(fieldValues), destroy() }
 *
 * To add a compound/procedural type: add an entry here + add the descriptor in
 * js/constraint-registry.js. No other file needs to change.
 */
const PREVIEW_CONSTRAINT_REGISTRY: Record<
  string,
  {
    resolveElements(
      fieldValues: any,
      elementMap: Map<string, { element: any; texture: Texture }>,
      layer?: UIFullscreenLayer,
    ): any[] | null;
    create(...args: any[]): { instances: any[]; update(p: any): void; destroy(): void };
  }
> = {
  horizontal: {
    resolveElements(
      { elementA, elementB }: any,
      elementMap: Map<string, { element: any; texture: Texture }>,
      layer?: UIFullscreenLayer,
    ) {
      const a = elementA === "layer" ? layer : elementMap.get(elementA)?.element;
      const b = elementMap.get(elementB)?.element;
      return a && b ? [a, b] : null;
    },
    create(a: any, b: any, fv: any) {
      const inst = new UIHorizontalDistanceConstraint(a, b, {
        distance: fv.distance,
        anchorA: fv.anchorA,
        anchorB: fv.anchorB,
      });
      return {
        instances: [inst],
        update(p: any) {
          inst.distance = p.distance;
          inst.anchorA = p.anchorA;
          inst.anchorB = p.anchorB;
        },
        destroy() {
          inst.destroy();
        },
      };
    },
  },
  vertical: {
    resolveElements(
      { elementA, elementB }: any,
      elementMap: Map<string, { element: any; texture: Texture }>,
      layer?: UIFullscreenLayer,
    ) {
      const a = elementA === "layer" ? layer : elementMap.get(elementA)?.element;
      const b = elementMap.get(elementB)?.element;
      return a && b ? [a, b] : null;
    },
    create(a: any, b: any, fv: any) {
      const inst = new UIVerticalDistanceConstraint(a, b, {
        distance: fv.distance,
        anchorA: fv.anchorA,
        anchorB: fv.anchorB,
      });
      return {
        instances: [inst],
        update(p: any) {
          inst.distance = p.distance;
          inst.anchorA = p.anchorA;
          inst.anchorB = p.anchorB;
        },
        destroy() {
          inst.destroy();
        },
      };
    },
  },
  aspect: {
    resolveElements(
      { elementA }: any,
      elementMap: Map<string, { element: any; texture: Texture }>,
      layer?: UIFullscreenLayer,
    ) {
      const a = elementA === "layer" ? layer : elementMap.get(elementA)?.element;
      return a ? [a] : null;
    },
    create(a: any, fv: any) {
      const inst = new UIAspectConstraint(a, { aspect: fv.value });
      return {
        instances: [inst],
        update(p: any) {
          inst.aspect = p.value;
        },
        destroy() {
          inst.destroy();
        },
      };
    },
  },
  width: {
    resolveElements(
      { elementA }: any,
      elementMap: Map<string, { element: any; texture: Texture }>,
      layer?: UIFullscreenLayer,
    ) {
      const a = elementA === "layer" ? layer : elementMap.get(elementA)?.element;
      return a ? [a] : null;
    },
    create(a: any, fv: any) {
      const inst = new UIWidthConstraint(a, { width: fv.value });
      return {
        instances: [inst],
        update(p: any) {
          inst.width = p.value;
        },
        destroy() {
          inst.destroy();
        },
      };
    },
  },
  height: {
    resolveElements(
      { elementA }: any,
      elementMap: Map<string, { element: any; texture: Texture }>,
      layer?: UIFullscreenLayer,
    ) {
      const a = elementA === "layer" ? layer : elementMap.get(elementA)?.element;
      return a ? [a] : null;
    },
    create(a: any, fv: any) {
      const inst = new UIHeightConstraint(a, { height: fv.value });
      return {
        instances: [inst],
        update(p: any) {
          inst.height = p.value;
        },
        destroy() {
          inst.destroy();
        },
      };
    },
  },
  horizontalProportion: {
    resolveElements(
      { elementA, elementB }: any,
      elementMap: Map<string, { element: any; texture: Texture }>,
    ) {
      const a = elementMap.get(elementA)?.element;
      const b = elementMap.get(elementB)?.element;
      return a && b ? [a, b] : null;
    },
    create(a: any, b: any, fv: any) {
      const inst = new UIHorizontalProportionConstraint(a, b, { proportion: fv.value });
      return {
        instances: [inst],
        update(p: any) {
          inst.proportion = p.value;
        },
        destroy() {
          inst.destroy();
        },
      };
    },
  },
  verticalProportion: {
    resolveElements(
      { elementA, elementB }: any,
      elementMap: Map<string, { element: any; texture: Texture }>,
    ) {
      const a = elementMap.get(elementA)?.element;
      const b = elementMap.get(elementB)?.element;
      return a && b ? [a, b] : null;
    },
    create(a: any, b: any, fv: any) {
      const inst = new UIVerticalProportionConstraint(a, b, { proportion: fv.value });
      return {
        instances: [inst],
        update(p: any) {
          inst.proportion = p.value;
        },
        destroy() {
          inst.destroy();
        },
      };
    },
  },
  size2d: {
    resolveElements(
      { elementA }: any,
      elementMap: Map<string, { element: any; texture: Texture }>,
      layer?: UIFullscreenLayer,
    ) {
      const a = elementA === "layer" ? layer : elementMap.get(elementA)?.element;
      return a ? [a] : null;
    },
    create(a: any, fv: any) {
      const instW = new UIWidthConstraint(a, { width: fv.width });
      const instH = new UIHeightConstraint(a, { height: fv.height });
      return {
        instances: [instW, instH],
        update(p: any) {
          instW.width = p.width;
          instH.height = p.height;
        },
        destroy() {
          instW.destroy();
          instH.destroy();
        },
      };
    },
  },
  distance2d: {
    resolveElements(
      { elementA, elementB }: any,
      elementMap: Map<string, { element: any; texture: Texture }>,
      layer?: UIFullscreenLayer,
    ) {
      const a = elementA === "layer" ? layer : elementMap.get(elementA)?.element;
      const b = elementMap.get(elementB)?.element;
      return a && b ? [a, b] : null;
    },
    create(a: any, b: any, fv: any) {
      const h = new UIHorizontalDistanceConstraint(a, b, {
        distance: fv.hDistance,
        anchorA: fv.hAnchorA,
        anchorB: fv.hAnchorB,
      });

      const v = new UIVerticalDistanceConstraint(a, b, {
        distance: fv.vDistance,
        anchorA: fv.vAnchorA,
        anchorB: fv.vAnchorB,
      });

      return {
        instances: [h, v],
        update(p: any) {
          h.distance = p.hDistance;
          h.anchorA = p.hAnchorA;
          h.anchorB = p.hAnchorB;

          v.distance = p.vDistance;
          v.anchorA = p.vAnchorA;
          v.anchorB = p.vAnchorB;
        },
        destroy() {
          h.destroy();
          v.destroy();
        },
      };
    },
  },

  proportion2d: {
    resolveElements(
      { elementA, elementB }: any,
      elementMap: Map<string, { element: any; texture: Texture }>,
    ) {
      const a = elementMap.get(elementA)?.element;
      const b = elementMap.get(elementB)?.element;
      return a && b ? [a, b] : null;
    },
    create(a: any, b: any, fv: any) {
      const h = new UIHorizontalProportionConstraint(a, b, {
        proportion: fv.hProportion,
      });

      const v = new UIVerticalProportionConstraint(a, b, {
        proportion: fv.vProportion,
      });

      return {
        instances: [h, v],
        update(p: any) {
          h.proportion = p.hProportion;
          v.proportion = p.vProportion;
        },
        destroy() {
          h.destroy();
          v.destroy();
        },
      };
    },
  },
};

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const clock = new Clock();

const layerMap = new Map<
  string,
  {
    layer: UIFullscreenLayer;
    elementMap: Map<string, { element: UIImage; texture: Texture }>;
    constraintMap: Map<string, { instances: any[]; update: (p: any) => void; destroy: () => void }>;
  }
>();
let activeLayerId: string | null = null;

const pendingConstraints: {
  id: string;
  layerId: string;
  constraintType: string;
  fieldValues: any;
}[] = [];

function _tryApplyPendingConstraints() {
  const retry: typeof pendingConstraints = [];
  for (const item of pendingConstraints) {
    const ctx = layerMap.get(item.layerId);
    if (!ctx) {continue;}
    const def = PREVIEW_CONSTRAINT_REGISTRY[item.constraintType];
    if (!def) {continue;}
    const resolved = def.resolveElements(item.fieldValues, ctx.elementMap, ctx.layer);
    if (!resolved) {
      retry.push(item);
      continue;
    }
    ctx.constraintMap.set(item.id, def.create(...resolved, item.fieldValues));
  }
  pendingConstraints.length = 0;
  pendingConstraints.push(...retry);
}

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  const ctx = layerMap.get(activeLayerId!);
  if (ctx) {ctx.layer.render(renderer, clock.getDelta());}
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

function buildPolicy(policyType: string, policyParams: any) {
  switch (policyType) {
    case "cover":
      return new UIResizePolicyCover(policyParams.rectWidth, policyParams.rectHeight);
    case "fit":
      return new UIResizePolicyFit(policyParams.rectWidth, policyParams.rectHeight);
    case "cross":
      return new UIResizePolicyCross(
        policyParams.fixedWidthLandscape,
        policyParams.fixedHeightPortrait,
      );
    case "crossInverted":
      return new UIResizePolicyCrossInverted(
        policyParams.fixedWidthLandscape,
        policyParams.fixedHeightPortrait,
      );
    case "fixedWidth":
      return new UIResizePolicyFixedWidth(
        policyParams.fixedWidthLandscape,
        policyParams.fixedWidthPortrait,
      );
    case "fixedHeight":
      return new UIResizePolicyFixedHeight(
        policyParams.fixedHeightLandscape,
        policyParams.fixedHeightPortrait,
      );
    case "none":
    default:
      return new UIResizePolicyNone();
  }
}

window.addEventListener("message", async (event) => {
  const msg = event.data as EditorMessage;

  switch (msg.type) {
    case "RESET_SCENE": {
      for (const [, ctx] of layerMap) {
        for (const [, handle] of ctx.constraintMap) {handle.destroy();}
        for (const [, entry] of ctx.elementMap) {
          entry.element.destroy();
          entry.texture.dispose();
        }
      }
      layerMap.clear();
      activeLayerId = null;
      break;
    }

    case "ADD_LAYER": {
      const layer = new UIFullscreenLayer();
      layer.name = msg.name;
      layer.resizePolicy = buildPolicy(msg.policyType, msg.policyParams);
      layerMap.set(msg.layerId, { layer, elementMap: new Map(), constraintMap: new Map() });
      break;
    }

    case "SET_ACTIVE_LAYER": {
      activeLayerId = msg.layerId;
      break;
    }

    case "REMOVE_LAYER": {
      const ctx = layerMap.get(msg.layerId);
      if (!ctx) {break;}
      for (const [, handle] of ctx.constraintMap) {handle.destroy();}
      for (const [, entry] of ctx.elementMap) {
        entry.element.destroy();
        entry.texture.dispose();
      }
      layerMap.delete(msg.layerId);
      break;
    }

    case "SET_LAYER_CONFIG": {
      const ctx = layerMap.get(msg.layerId);
      if (!ctx) {break;}
      ctx.layer.name = msg.name;
      ctx.layer.resizePolicy = buildPolicy(msg.policyType, msg.policyParams);
      break;
    }

    case "ADD_IMAGE": {
      const ctx = layerMap.get(msg.layerId);
      if (!ctx) {break;}
      const texture = await loadTexture(msg.dataURL);
      const image = new UIImage(ctx.layer, texture);
      ctx.elementMap.set(msg.id, { element: image, texture });
      _tryApplyPendingConstraints();
      break;
    }

    case "REMOVE_ELEMENT": {
      const ctx = layerMap.get(msg.layerId);
      if (!ctx) {break;}
      const entry = ctx.elementMap.get(msg.id);
      if (entry) {
        entry.element.destroy();
        entry.texture.dispose();
        ctx.elementMap.delete(msg.id);
      }
      break;
    }

    case "REORDER_ELEMENTS": {
      const ctx = layerMap.get(msg.layerId);
      if (!ctx) {break;}
      msg.orderedIds.forEach((elId, index) => {
        const entry = ctx.elementMap.get(elId);
        if (entry) {entry.element.zIndex = index;}
      });
      break;
    }

    case "SET_ELEMENT_TEXTURE": {
      const ctx = layerMap.get(msg.layerId);
      if (!ctx) {break;}
      const entry = ctx.elementMap.get(msg.id);
      if (!entry) {break;}
      const newTexture = await loadTexture(msg.dataURL);
      entry.element.texture.set(newTexture);
      entry.texture.dispose();
      entry.texture = newTexture;
      break;
    }

    case "ADD_CONSTRAINT": {
      const ctx = layerMap.get(msg.layerId);
      if (!ctx) {break;}
      const def = PREVIEW_CONSTRAINT_REGISTRY[msg.constraintType];
      if (!def) {break;}
      const resolved = def.resolveElements(msg.fieldValues, ctx.elementMap, ctx.layer);
      if (!resolved) {
        pendingConstraints.push({
          id: msg.id,
          layerId: msg.layerId,
          constraintType: msg.constraintType,
          fieldValues: msg.fieldValues,
        });
        break;
      }
      ctx.constraintMap.set(msg.id, def.create(...resolved, msg.fieldValues));
      break;
    }

    case "UPDATE_CONSTRAINT": {
      const ctx = layerMap.get(msg.layerId);
      if (!ctx) {break;}
      const handle = ctx.constraintMap.get(msg.id);
      if (handle) {handle.update(msg.fieldValues);}
      break;
    }

    case "REMOVE_CONSTRAINT": {
      const ctx = layerMap.get(msg.layerId);
      if (!ctx) {break;}
      const handle = ctx.constraintMap.get(msg.id);
      if (handle) {
        handle.destroy();
        ctx.constraintMap.delete(msg.id);
      }
      break;
    }
  }
});
