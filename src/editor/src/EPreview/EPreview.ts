import { Clock, WebGLRenderer } from "three";
import type { EMessage } from "../EBridge/EBridge.Messages";
import { handleMessage } from "./EPreview.Handling";
import { getLayerContextActive } from "./Preview.Internal";

const CANVAS = document.getElementById("canvas") as HTMLCanvasElement;
const RENDERER = new WebGLRenderer({ canvas: CANVAS, antialias: true, alpha: true });
RENDERER.setPixelRatio(window.devicePixelRatio);
RENDERER.setSize(window.innerWidth, window.innerHeight);

const CLOCK = new Clock();

window.addEventListener("resize", () => RENDERER.setSize(window.innerWidth, window.innerHeight));
window.addEventListener("message", (event) => handleMessage(event as MessageEvent<EMessage>));

function animate(): void {
  requestAnimationFrame(animate);

  const activeLayer = getLayerContextActive()?.layer;
  if (activeLayer) {
    activeLayer.render(RENDERER, CLOCK.getDelta());
  }
}

animate();

// function loadTexture(dataURL: string): Promise<Texture> {
//   return new Promise((resolve) => {
//     new TextureLoader().load(dataURL, (texture) => {
//       texture.colorSpace = SRGBColorSpace;
//       resolve(texture);
//     });
//   });
// }

// function tryApplyPendingConstraints(): void {
//   const retry: PendingConstraint[] = [];
//   for (const item of pendingConstraints) {
//     const layerCtx = layerMap.get(item.layerId);
//     if (layerCtx === undefined) {
//       continue;
//     }
//     // TODO: адаптировать PREVIEW_CONSTRAINT_REGISTRY под новые типы constraint
//     const entry = PREVIEW_CONSTRAINT_REGISTRY[item.constraintType];
//     if (entry === undefined) {
//       continue;
//     }
//     const handle = resolveAndCreate(entry, item.fieldValues, layerCtx);
//     if (handle === null) {
//       retry.push(item);
//       continue;
//     }
//     console.debug(
//       "[preview] pending constraint applied id=%s type=%s",
//       item.id,
//       item.constraintType,
//     );
//     layerCtx.constraintMap.set(item.id, handle);
//   }
//   pendingConstraints.length = 0;
//   pendingConstraints.push(...retry);
// }

// window.addEventListener("message", (event) => {
//   void handleMessage(event as MessageEvent<unknown>);
// });

// async function handleMessage(event: MessageEvent<unknown>): Promise<void> {
//   const msg = event.data as any; // TODO: типизировать как объединение новых сообщений

//   switch (msg.type) {
//     case EMessageType.COMMON_RESET: {
//       console.debug("[preview] COMMON_RESET");
//       for (const [, layerCtx] of layerMap) {
//         for (const [, handle] of layerCtx.constraintMap) {
//           handle.destroy();
//         }
//         for (const [, elementEntry] of layerCtx.elementMap) {
//           elementEntry.element.destroy();
//           if (elementEntry.texture) {
//             elementEntry.texture.dispose();
//           }
//         }
//         layerCtx.debug.destroy();
//       }
//       layerMap.clear();
//       pendingConstraints.length = 0;
//       activeLayerId = null;
//       break;
//     }

//     case EMessageType.COMMON_SET_THEME: {
//       console.debug("[preview] COMMON_SET_THEME theme=%s", msg.theme);
//       const theme = msg.theme === "DARK" ? "dark" : "light";
//       document.documentElement.setAttribute("data-theme", theme);
//       break;
//     }

//     case EMessageType.LAYER_FULLSCREEN_ADD: {
//       console.debug("[preview] LAYER_FULLSCREEN_ADD uuid=%s name=%s", msg.uuid, msg.name);
//       // TODO: создать UIFullscreenLayer с msg.resizePolicy и msg.parameters
//       // const layer = new UIFullscreenLayer();
//       // layer.name = msg.name;
//       // layer.resizePolicy = buildPolicy(msg.resizePolicy, msg.parameters);
//       // layerMap.set(msg.uuid, { layer, debug: new UILayerDebug(layer), elementMap: new Map(), constraintMap: new Map() });
//       break;
//     }

//     case EMessageType.LAYER_FULLSCREEN_UPDATE: {
//       console.debug("[preview] LAYER_FULLSCREEN_UPDATE uuid=%s", msg.uuid);
//       const layerCtx = layerMap.get(msg.uuid);
//       if (!layerCtx) {
//         break;
//       }
//       // TODO: обновить layer.name и layer.resizePolicy
//       // layerCtx.layer.name = msg.name;
//       // layerCtx.layer.resizePolicy = buildPolicy(msg.resizePolicy, msg.parameters);
//       break;
//     }

//     case EMessageType.LAYER_REMOVE: {
//       console.debug("[preview] LAYER_REMOVE uuid=%s", msg.uuid);
//       const layerCtx = layerMap.get(msg.uuid);
//       if (!layerCtx) {
//         break;
//       }
//       for (const [, handle] of layerCtx.constraintMap) {
//         handle.destroy();
//       }
//       for (const [, elementEntry] of layerCtx.elementMap) {
//         elementEntry.element.destroy();
//         if (elementEntry.texture) {
//           elementEntry.texture.dispose();
//         }
//       }
//       layerCtx.debug.destroy();
//       layerMap.delete(msg.uuid);
//       if (activeLayerId === msg.uuid) {
//         activeLayerId = null;
//       }
//       break;
//     }

//     case EMessageType.LAYER_DEBUG_UPDATE: {
//       console.debug("[preview] LAYER_DEBUG_UPDATE uuid=%s", msg.uuid);
//       const layerCtx = layerMap.get(msg.uuid);
//       if (!layerCtx) {
//         break;
//       }
//       const { debug } = layerCtx;
//       debug.showAspect = msg.showAspect;
//       debug.showHeight = msg.showHeight;
//       debug.showWidth = msg.showWidth;
//       debug.showHorizontalDistance = msg.showHorizontalDistance;
//       debug.showHorizontalInterpolation = msg.showHorizontalInterpolation;
//       debug.showVerticalDistance = msg.showVerticalDistance;
//       debug.showVerticalInterpolation = msg.showVerticalInterpolation;
//       break;
//     }

//     // Элементы ----------------------------------------------------------------
//     case EMessageType.ELEMENT_IMAGE_ADD: {
//       console.debug("[preview] ELEMENT_IMAGE_ADD uuid=%s", msg.uuid);
//       const layerCtx = layerMap.get(msg.layerId); // NOTE: в payload может быть поле layerId? Уточнить
//       if (!layerCtx) {
//         break;
//       }
//       // TODO: загрузить texture из msg.texture (asset UUID) и создать UIImage
//       // const texture = await loadTexture(assetData);
//       // const image = new UIImage(layerCtx.layer, texture);
//       // if (msg.color) image.color.setHexString(msg.color);
//       // layerCtx.elementMap.set(msg.uuid, { kind: "image", element: image, texture });
//       // tryApplyPendingConstraints();
//       break;
//     }

//     case EMessageType.ELEMENT_IMAGE_UPDATE: {
//       console.debug("[preview] ELEMENT_IMAGE_UPDATE uuid=%s", msg.uuid);
//       const layerCtx = layerMap.get(msg.layerId);
//       if (!layerCtx) {
//         break;
//       }
//       const entry = layerCtx.elementMap.get(msg.uuid);
//       if (entry?.kind !== "image") {
//         break;
//       }
//       // TODO: обновить color, texture
//       break;
//     }

//     case EMessageType.ELEMENT_TEXT_ADD: {
//       console.debug("[preview] ELEMENT_TEXT_ADD uuid=%s", msg.uuid);
//       const layerCtx = layerMap.get(msg.layerId);
//       if (!layerCtx) {
//         break;
//       }
//       // TODO: создать UIText из msg.content, применить resizeMode, maxLineWidth, color, стили
//       // const text = new UIText(layerCtx.layer, msg.content);
//       // text.resizeMode = msg.resizeMode;
//       // text.maxLineWidth = msg.maxLineWidth;
//       // if (msg.color) text.color.setHexString(msg.color);
//       // применить стили из msg.content[0] (упрощённо)
//       // layerCtx.elementMap.set(msg.uuid, { kind: "text", element: text });
//       // tryApplyPendingConstraints();
//       break;
//     }

//     case EMessageType.ELEMENT_TEXT_UPDATE: {
//       console.debug("[preview] ELEMENT_TEXT_UPDATE uuid=%s", msg.uuid);
//       const layerCtx = layerMap.get(msg.layerId);
//       if (!layerCtx) {
//         break;
//       }
//       const entry = layerCtx.elementMap.get(msg.uuid);
//       if (entry?.kind !== "text") {
//         break;
//       }
//       // TODO: обновить content, resizeMode, maxLineWidth, color, стили
//       break;
//     }

//     case EMessageType.ELEMENT_REMOVE: {
//       console.debug("[preview] ELEMENT_REMOVE uuid=%s", msg.uuid);
//       // NOTE: в новых типах нет layerId в EMessageElementRemove, нужно определять слой иначе
//       // Пока ищем элемент во всех слоях
//       for (const [, layerCtx] of layerMap) {
//         const entry = layerCtx.elementMap.get(msg.uuid);
//         if (entry) {
//           entry.element.destroy();
//           if (entry.texture) {
//             entry.texture.dispose();
//           }
//           layerCtx.elementMap.delete(msg.uuid);
//           break;
//         }
//       }
//       break;
//     }

//     // TODO: добавить обработку ELEMENT_ANIMATED_IMAGE_ADD/UPDATE,
//     // ELEMENT_GRAPHICS_ADD/UPDATE, ELEMENT_NINE_SLICE_ADD/UPDATE,
//     // ELEMENT_PROGRESS_ADD/UPDATE, ELEMENT_SCENE_ADD/UPDATE

//     // Constraints -------------------------------------------------------------
//     case EMessageType.CONSTRAINT_ASPECT_ADD:
//     case EMessageType.CONSTRAINT_DISTANCE_HORIZONTAL_ADD:
//     case EMessageType.CONSTRAINT_DISTANCE_VERTICAL_ADD:
//     case EMessageType.CONSTRAINT_PROPORTION_HORIZONTAL_ADD:
//     case EMessageType.CONSTRAINT_PROPORTION_VERTICAL_ADD:
//     case EMessageType.CONSTRAINT_SIZE_HORIZONTAL_ADD:
//     case EMessageType.CONSTRAINT_SIZE_VERTICAL_ADD: {
//       console.debug("[preview] ADD_CONSTRAINT type=%s uuid=%s", msg.type, msg.uuid);
//       // TODO: определить layerId (возможно из контекста элемента)
//       // const layerCtx = layerMap.get(msg.layerId);
//       // if (!layerCtx) break;
//       // const entry = PREVIEW_CONSTRAINT_REGISTRY[msg.type];
//       // if (!entry) break;
//       // const handle = resolveAndCreate(entry, msg, layerCtx);
//       // if (!handle) pendingConstraints.push(...);
//       // else layerCtx.constraintMap.set(msg.uuid, handle);
//       break;
//     }

//     case EMessageType.CONSTRAINT_ASPECT_UPDATE:
//     case EMessageType.CONSTRAINT_DISTANCE_HORIZONTAL_UPDATE:
//     case EMessageType.CONSTRAINT_DISTANCE_VERTICAL_UPDATE:
//     case EMessageType.CONSTRAINT_PROPORTION_HORIZONTAL_UPDATE:
//     case EMessageType.CONSTRAINT_PROPORTION_VERTICAL_UPDATE:
//     case EMessageType.CONSTRAINT_SIZE_HORIZONTAL_UPDATE:
//     case EMessageType.CONSTRAINT_SIZE_VERTICAL_UPDATE: {
//       console.debug("[preview] UPDATE_CONSTRAINT uuid=%s", msg.uuid);
//       // TODO: найти constraint по uuid во всех слоях и вызвать handle.update(msg)
//       break;
//     }

//     case EMessageType.CONSTRAINT_REMOVE: {
//       console.debug("[preview] CONSTRAINT_REMOVE uuid=%s", msg.uuid);
//       for (const [, layerCtx] of layerMap) {
//         const handle = layerCtx.constraintMap.get(msg.uuid);
//         if (handle) {
//           handle.destroy();
//           layerCtx.constraintMap.delete(msg.uuid);
//           break;
//         }
//       }
//       break;
//     }

//     // Assets ------------------------------------------------------------------
//     case EMessageType.ASSET_FONT_ADD: {
//       if (loadedFontFamilies.has(msg.uuid)) {
//         break;
//       }
//       console.debug("[preview] ASSET_FONT_ADD uuid=%s", msg.uuid);
//       // TODO: загрузить шрифт из msg.data (dataURL)
//       // const face = new FontFace(msg.uuid, `url(${msg.data})`);
//       // await face.load();
//       // document.fonts.add(face);
//       // loadedFontFamilies.add(msg.uuid);
//       break;
//     }

//     case EMessageType.ASSET_IMAGE_ADD: {
//       console.debug("[preview] ASSET_IMAGE_ADD uuid=%s", msg.uuid);
//       // TODO: загрузить изображение в кэш текстур (можно хранить в Map)
//       break;
//     }

//     case EMessageType.ASSET_REMOVE: {
//       console.debug("[preview] ASSET_REMOVE uuid=%s", msg.uuid);
//       // TODO: удалить ассет из кэша
//       break;
//     }

//     default:
//       console.warn("[preview] Unknown message type", msg.type);
//   }
// }

// // import type { UITextResizeMode } from "laymur";
// // import { UIFullscreenLayer, UIImage, UIText } from "laymur";
// // import { UILayerDebug } from "laymur/debug";
// // import type { Texture } from "three";
// // import { Clock, SRGBColorSpace, TextureLoader, WebGLRenderer } from "three";
// // import type {
// //   ConstraintRegistryEntry,
// //   FieldValues,
// //   LayerContext,
// //   PendingConstraint,
// // } from "./Preview.Internal";
// // import { buildPolicy, PREVIEW_CONSTRAINT_REGISTRY, resolveAndCreate } from "./Preview.Internal";

// // const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// // const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
// // renderer.setPixelRatio(window.devicePixelRatio);
// // renderer.setSize(window.innerWidth, window.innerHeight);

// // const clock = new Clock();
// // window.addEventListener("resize", () => renderer.setSize(window.innerWidth, window.innerHeight));

// // const layerMap = new Map<string, LayerContext>();
// // let activeLayerId: string | null = null;
// // const pendingConstraints: PendingConstraint[] = [];
// // const loadedFontFamilies = new Set<string>();

// // function animate(): void {
// //   requestAnimationFrame(animate);
// //   const layerCtx = activeLayerId !== null ? layerMap.get(activeLayerId) : undefined;
// //   if (layerCtx !== undefined) {
// //     layerCtx.layer.render(renderer, clock.getDelta());
// //   }
// // }
// // animate();

// // function loadTexture(dataURL: string): Promise<Texture> {
// //   return new Promise((resolve) => {
// //     new TextureLoader().load(dataURL, (texture) => {
// //       texture.colorSpace = SRGBColorSpace;
// //       resolve(texture);
// //     });
// //   });
// // }

// // function tryApplyPendingConstraints(): void {
// //   const retry: PendingConstraint[] = [];
// //   for (const item of pendingConstraints) {
// //     const layerCtx = layerMap.get(item.layerId);
// //     if (layerCtx === undefined) {
// //       continue;
// //     }
// //     const entry = PREVIEW_CONSTRAINT_REGISTRY[item.constraintType] as
// //       | ConstraintRegistryEntry
// //       | undefined;
// //     if (entry === undefined) {
// //       continue;
// //     }
// //     const handle = resolveAndCreate(entry, item.fieldValues, layerCtx);
// //     if (handle === null) {
// //       retry.push(item);
// //       continue;
// //     }
// //     console.debug(
// //       "[preview] pending constraint applied id=%s type=%s",
// //       item.id,
// //       item.constraintType,
// //     );
// //     layerCtx.constraintMap.set(item.id, handle);
// //   }
// //   pendingConstraints.length = 0;
// //   pendingConstraints.push(...retry);
// // }

// // window.addEventListener("message", (event) => {
// //   void handleMessage(event as MessageEvent<EditorMessage>);
// // });

// // async function handleMessage(event: MessageEvent<EditorMessage>): Promise<void> {
// //   const msg = event.data;

// //   switch (msg.type) {
// //     case "RESET_SCENE": {
// //       console.debug("[preview] RESET_SCENE");
// //       for (const [, layerCtx] of layerMap) {
// //         for (const [, handle] of layerCtx.constraintMap) {
// //           handle.destroy();
// //         }
// //         for (const [, elementEntry] of layerCtx.elementMap) {
// //           elementEntry.element.destroy();
// //           if (elementEntry.kind === "image") {
// //             elementEntry.texture.dispose();
// //           }
// //         }
// //         layerCtx.debug.destroy();
// //       }
// //       layerMap.clear();
// //       pendingConstraints.length = 0;
// //       activeLayerId = null;
// //       break;
// //     }

// //     case "ADD_LAYER": {
// //       console.debug("[preview] ADD_LAYER id=%s name=%s", msg.layerId, msg.name);
// //       const layer = new UIFullscreenLayer();
// //       layer.name = msg.name;
// //       layer.resizePolicy = buildPolicy(msg.policyType, msg.policyParams);
// //       layerMap.set(msg.layerId, {
// //         layer,
// //         debug: new UILayerDebug(layer),
// //         elementMap: new Map(),
// //         constraintMap: new Map(),
// //       });
// //       break;
// //     }

// //     case "SET_ACTIVE_LAYER": {
// //       console.debug("[preview] SET_ACTIVE_LAYER id=%s", msg.layerId);
// //       activeLayerId = msg.layerId;
// //       break;
// //     }

// //     case "REMOVE_LAYER": {
// //       console.debug("[preview] REMOVE_LAYER id=%s", msg.layerId);
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         break;
// //       }
// //       for (const [, handle] of layerCtx.constraintMap) {
// //         handle.destroy();
// //       }
// //       for (const [, elementEntry] of layerCtx.elementMap) {
// //         elementEntry.element.destroy();
// //         if (elementEntry.kind === "image") {
// //           elementEntry.texture.dispose();
// //         }
// //       }
// //       layerCtx.debug.destroy();
// //       layerMap.delete(msg.layerId);
// //       break;
// //     }

// //     case "SET_LAYER_CONFIG": {
// //       console.debug("[preview] SET_LAYER_CONFIG id=%s name=%s", msg.layerId, msg.name);
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         break;
// //       }
// //       layerCtx.layer.name = msg.name;
// //       layerCtx.layer.resizePolicy = buildPolicy(msg.policyType, msg.policyParams);
// //       break;
// //     }

// //     case "ADD_IMAGE": {
// //       console.debug("[preview] ADD_IMAGE id=%s layerId=%s", msg.id, msg.layerId);
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         console.warn("[preview] ADD_IMAGE - layerId=%s not in layerMap", msg.layerId);
// //         break;
// //       }
// //       const texture = await loadTexture(msg.dataURL);
// //       const image = new UIImage(layerCtx.layer, texture);
// //       if (msg.color !== undefined) {
// //         image.color.setHexString(msg.color);
// //       }
// //       layerCtx.elementMap.set(msg.id, { kind: "image", element: image, texture });
// //       console.debug(
// //         "[preview] ADD_IMAGE done id=%s elementMap size=%d",
// //         msg.id,
// //         layerCtx.elementMap.size,
// //       );
// //       tryApplyPendingConstraints();
// //       break;
// //     }

// //     case "ADD_TEXT": {
// //       console.debug("[preview] ADD_TEXT id=%s layerId=%s", msg.id, msg.layerId);
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         console.warn("[preview] ADD_TEXT - layerId=%s not in layerMap", msg.layerId);
// //         break;
// //       }
// //       const text = new UIText(layerCtx.layer, msg.content);
// //       text.resizeMode = msg.resizeMode as UITextResizeMode;
// //       text.maxLineWidth = msg.maxLineWidth;
// //       text.padding = msg.padding;
// //       if (msg.color !== undefined) {
// //         text.color.setHexString(msg.color);
// //       }
// //       text.commonStyle.color = msg.style.color;
// //       text.commonStyle.align = msg.style.align;
// //       text.commonStyle.fontFamily = msg.style.fontFamily;
// //       text.commonStyle.fontSize = msg.style.fontSize;
// //       text.commonStyle.fontStyle = msg.style.fontStyle;
// //       text.commonStyle.fontWeight = msg.style.fontWeight;
// //       text.commonStyle.lineHeight = msg.style.lineHeight;
// //       text.commonStyle.enableShadow = msg.style.enableShadow;
// //       text.commonStyle.shadowOffsetX = msg.style.shadowOffsetX;
// //       text.commonStyle.shadowOffsetY = msg.style.shadowOffsetY;
// //       text.commonStyle.shadowBlur = msg.style.shadowBlur;
// //       text.commonStyle.shadowColor = msg.style.shadowColor;
// //       text.commonStyle.enableStroke = msg.style.enableStroke;
// //       text.commonStyle.strokeColor = msg.style.strokeColor;
// //       text.commonStyle.strokeThickness = msg.style.strokeThickness;
// //       layerCtx.elementMap.set(msg.id, { kind: "text", element: text });
// //       tryApplyPendingConstraints();
// //       break;
// //     }

// //     case "REMOVE_ELEMENT": {
// //       console.debug("[preview] REMOVE_ELEMENT id=%s layerId=%s", msg.id, msg.layerId);
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         break;
// //       }
// //       const elementEntry = layerCtx.elementMap.get(msg.id);
// //       if (elementEntry !== undefined) {
// //         elementEntry.element.destroy();
// //         if (elementEntry.kind === "image") {
// //           elementEntry.texture.dispose();
// //         }
// //         layerCtx.elementMap.delete(msg.id);
// //       }
// //       break;
// //     }

// //     case "REORDER_ELEMENTS": {
// //       console.debug("[preview] REORDER_ELEMENTS layerId=%s ids=%o", msg.layerId, msg.orderedIds);
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         break;
// //       }
// //       for (const [index, elementId] of msg.orderedIds.entries()) {
// //         const elementEntry = layerCtx.elementMap.get(elementId);
// //         if (elementEntry !== undefined) {
// //           elementEntry.element.zIndex = index;
// //         }
// //       }
// //       break;
// //     }

// //     case "SET_IMAGE_TEXTURE": {
// //       console.debug("[preview] SET_IMAGE_TEXTURE id=%s layerId=%s", msg.id, msg.layerId);
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         break;
// //       }
// //       const elementEntry = layerCtx.elementMap.get(msg.id);
// //       if (elementEntry?.kind !== "image") {
// //         break;
// //       }
// //       const newTexture = await loadTexture(msg.dataURL);
// //       elementEntry.element.texture.set(newTexture);
// //       elementEntry.texture.dispose();
// //       elementEntry.texture = newTexture;
// //       break;
// //     }

// //     case "SET_TEXT_CONFIG": {
// //       console.debug("[preview] SET_TEXT_CONFIG id=%s layerId=%s", msg.id, msg.layerId);
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         break;
// //       }
// //       const elementEntry = layerCtx.elementMap.get(msg.id);
// //       if (elementEntry !== undefined && elementEntry.element instanceof UIText) {
// //         elementEntry.element.content = msg.content;
// //         elementEntry.element.resizeMode = msg.resizeMode as UITextResizeMode;
// //         elementEntry.element.maxLineWidth = msg.maxLineWidth;
// //         elementEntry.element.padding = msg.padding;
// //         elementEntry.element.commonStyle.color = msg.style.color;
// //         elementEntry.element.commonStyle.align = msg.style.align;
// //         elementEntry.element.commonStyle.fontFamily = msg.style.fontFamily;
// //         elementEntry.element.commonStyle.fontSize = msg.style.fontSize;
// //         elementEntry.element.commonStyle.fontStyle = msg.style.fontStyle;
// //         elementEntry.element.commonStyle.fontWeight = msg.style.fontWeight;
// //         elementEntry.element.commonStyle.lineHeight = msg.style.lineHeight;
// //         elementEntry.element.commonStyle.enableShadow = msg.style.enableShadow;
// //         elementEntry.element.commonStyle.shadowOffsetX = msg.style.shadowOffsetX;
// //         elementEntry.element.commonStyle.shadowOffsetY = msg.style.shadowOffsetY;
// //         elementEntry.element.commonStyle.shadowBlur = msg.style.shadowBlur;
// //         elementEntry.element.commonStyle.shadowColor = msg.style.shadowColor;
// //         elementEntry.element.commonStyle.enableStroke = msg.style.enableStroke;
// //         elementEntry.element.commonStyle.strokeColor = msg.style.strokeColor;
// //         elementEntry.element.commonStyle.strokeThickness = msg.style.strokeThickness;
// //       }
// //       break;
// //     }

// //     case "SET_ELEMENT_COLOR": {
// //       console.debug("[preview] SET_ELEMENT_COLOR id=%s layerId=%s", msg.id, msg.layerId);
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         break;
// //       }
// //       const elementEntry = layerCtx.elementMap.get(msg.id);
// //       if (elementEntry !== undefined) {
// //         elementEntry.element.color.setHexString(msg.color);
// //       }
// //       break;
// //     }

// //     case "ADD_CONSTRAINT": {
// //       console.debug(
// //         "[preview] ADD_CONSTRAINT id=%s type=%s layerId=%s",
// //         msg.id,
// //         msg.constraintType,
// //         msg.layerId,
// //       );
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         break;
// //       }
// //       const entry = PREVIEW_CONSTRAINT_REGISTRY[msg.constraintType] as
// //         | ConstraintRegistryEntry
// //         | undefined;
// //       if (entry === undefined) {
// //         console.warn("[preview] ADD_CONSTRAINT - unknown type=%s", msg.constraintType);
// //         break;
// //       }
// //       const handle = resolveAndCreate(entry, msg.fieldValues, layerCtx);
// //       if (handle === null) {
// //         console.debug("[preview] ADD_CONSTRAINT deferred id=%s (elements not yet ready)", msg.id);
// //         pendingConstraints.push({
// //           id: msg.id,
// //           layerId: msg.layerId,
// //           constraintType: msg.constraintType,
// //           fieldValues: msg.fieldValues,
// //         });
// //         break;
// //       }
// //       layerCtx.constraintMap.set(msg.id, handle);
// //       break;
// //     }

// //     case "UPDATE_CONSTRAINT": {
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         break;
// //       }
// //       const handle = layerCtx.constraintMap.get(msg.id);
// //       if (handle !== undefined) {
// //         handle.update(msg.fieldValues as FieldValues);
// //       }
// //       break;
// //     }

// //     case "REMOVE_CONSTRAINT": {
// //       console.debug("[preview] REMOVE_CONSTRAINT id=%s layerId=%s", msg.id, msg.layerId);
// //       const layerCtx = layerMap.get(msg.layerId);
// //       if (layerCtx === undefined) {
// //         break;
// //       }
// //       const handle = layerCtx.constraintMap.get(msg.id);
// //       if (handle !== undefined) {
// //         handle.destroy();
// //         layerCtx.constraintMap.delete(msg.id);
// //       }
// //       break;
// //     }

// //     case "SET_LAYER_DEBUG": {
// //       console.debug("[preview] SET_LAYER_DEBUG layerId=%s filters=%o", msg.layerId, msg.filters);
// //       const layerContext = layerMap.get(msg.layerId);
// //       if (layerContext === undefined) {
// //         break;
// //       }
// //       const { debug } = layerContext;
// //       if (msg.filters.showAspect !== undefined) {
// //         debug.showAspect = msg.filters.showAspect;
// //       }
// //       if (msg.filters.showHeight !== undefined) {
// //         debug.showHeight = msg.filters.showHeight;
// //       }
// //       if (msg.filters.showWidth !== undefined) {
// //         debug.showWidth = msg.filters.showWidth;
// //       }
// //       if (msg.filters.showHorizontalDistance !== undefined) {
// //         debug.showHorizontalDistance = msg.filters.showHorizontalDistance;
// //       }
// //       if (msg.filters.showHorizontalInterpolation !== undefined) {
// //         debug.showHorizontalInterpolation = msg.filters.showHorizontalInterpolation;
// //       }
// //       if (msg.filters.showVerticalDistance !== undefined) {
// //         debug.showVerticalDistance = msg.filters.showVerticalDistance;
// //       }
// //       if (msg.filters.showVerticalInterpolation !== undefined) {
// //         debug.showVerticalInterpolation = msg.filters.showVerticalInterpolation;
// //       }
// //       break;
// //     }

// //     case "SET_THEME": {
// //       console.debug("[preview] SET_THEME theme=%s", msg.theme);
// //       document.documentElement.setAttribute("data-theme", msg.theme);
// //       break;
// //     }

// //     case "LOAD_FONT": {
// //       if (loadedFontFamilies.has(msg.fontFamily)) {
// //         break;
// //       }
// //       console.debug("[preview] LOAD_FONT fontFamily=%s", msg.fontFamily);
// //       const face = new FontFace(msg.fontFamily, `url(${msg.dataURL})`);
// //       await face.load();
// //       document.fonts.add(face);
// //       loadedFontFamilies.add(msg.fontFamily);
// //       break;
// //     }
// //   }
// // }
