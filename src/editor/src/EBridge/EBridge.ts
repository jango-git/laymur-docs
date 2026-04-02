import type {
  EMessageAssetFontAdd,
  EMessageAssetFontUpdate,
  EMessageAssetImageAdd,
  EMessageAssetImageUpdate,
  EMessageAssetRemove,
  EMessageConstraintAspectAdd,
  EMessageConstraintAspectUpdate,
  EMessageConstraintDistanceHorizontalAdd,
  EMessageConstraintDistanceHorizontalUpdate,
  EMessageConstraintDistanceVerticalAdd,
  EMessageConstraintDistanceVerticalUpdate,
  EMessageConstraintProportionHorizontalAdd,
  EMessageConstraintProportionHorizontalUpdate,
  EMessageConstraintProportionVerticalAdd,
  EMessageConstraintProportionVerticalUpdate,
  EMessageConstraintRemove,
  EMessageConstraintSizeHorizontalAdd,
  EMessageConstraintSizeHorizontalUpdate,
  EMessageConstraintSizeVerticalAdd,
  EMessageConstraintSizeVerticalUpdate,
  EMessageElementAnimatedImageAdd,
  EMessageElementAnimatedImageUpdate,
  EMessageElementGraphicsAdd,
  EMessageElementGraphicsUpdate,
  EMessageElementImageAdd,
  EMessageElementImageUpdate,
  EMessageElementNineSliceAdd,
  EMessageElementNineSliceUpdate,
  EMessageElementProgressAdd,
  EMessageElementProgressUpdate,
  EMessageElementRemove,
  EMessageElementSceneAdd,
  EMessageElementSceneUpdate,
  EMessageElementTextAdd,
  EMessageElementTextUpdate,
  EMessageLayerDebugUpdate,
  EMessageLayerFullscreenAdd,
  EMessageLayerFullscreenUpdate,
  EMessageLayerRemove,
} from "./EBridge.Messages";
import { EMessageType } from "./EBridge.Messages";

export class EBridge {
  constructor(private readonly frame: HTMLIFrameElement) {}

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

  // Layers

  public layerFullscreenAdd(payload: Omit<EMessageLayerFullscreenAdd, "type">): void {
    console.debug("[bridge] postMessage LAYER_FULLSCREEN_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.LAYER_FULLSCREEN_ADD, ...payload });
  }

  public layerFullscreenUpdate(payload: Omit<EMessageLayerFullscreenUpdate, "type">): void {
    console.debug("[bridge] postMessage LAYER_FULLSCREEN_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.LAYER_FULLSCREEN_UPDATE, ...payload });
  }

  public layerRemove(payload: Omit<EMessageLayerRemove, "type">): void {
    console.debug("[bridge] postMessage LAYER_REMOVE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.LAYER_REMOVE, ...payload });
  }

  public layerDebugUpdate(payload: Omit<EMessageLayerDebugUpdate, "type">): void {
    console.debug("[bridge] postMessage LAYER_DEBUG_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.LAYER_DEBUG_UPDATE, ...payload });
  }

  // Elements

  public elementAnimatedImageAdd(payload: Omit<EMessageElementAnimatedImageAdd, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_ANIMATED_IMAGE_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_ANIMATED_IMAGE_ADD, ...payload });
  }

  public elementAnimatedImageUpdate(
    payload: Omit<EMessageElementAnimatedImageUpdate, "type">,
  ): void {
    console.debug("[bridge] postMessage ELEMENT_ANIMATED_IMAGE_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_ANIMATED_IMAGE_UPDATE, ...payload });
  }

  public elementGraphicsAdd(payload: Omit<EMessageElementGraphicsAdd, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_GRAPHICS_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_GRAPHICS_ADD, ...payload });
  }

  public elementGraphicsUpdate(payload: Omit<EMessageElementGraphicsUpdate, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_GRAPHICS_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_GRAPHICS_UPDATE, ...payload });
  }

  public elementImageAdd(payload: Omit<EMessageElementImageAdd, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_IMAGE_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_IMAGE_ADD, ...payload });
  }

  public elementImageUpdate(payload: Omit<EMessageElementImageUpdate, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_IMAGE_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_IMAGE_UPDATE, ...payload });
  }

  public elementNineSliceAdd(payload: Omit<EMessageElementNineSliceAdd, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_NINE_SLICE_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_NINE_SLICE_ADD, ...payload });
  }

  public elementNineSliceUpdate(payload: Omit<EMessageElementNineSliceUpdate, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_NINE_SLICE_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_NINE_SLICE_UPDATE, ...payload });
  }

  public elementProgressAdd(payload: Omit<EMessageElementProgressAdd, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_PROGRESS_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_PROGRESS_ADD, ...payload });
  }

  public elementProgressUpdate(payload: Omit<EMessageElementProgressUpdate, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_PROGRESS_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_PROGRESS_UPDATE, ...payload });
  }

  public elementSceneAdd(payload: Omit<EMessageElementSceneAdd, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_SCENE_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_SCENE_ADD, ...payload });
  }

  public elementSceneUpdate(payload: Omit<EMessageElementSceneUpdate, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_SCENE_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_SCENE_UPDATE, ...payload });
  }

  public elementTextAdd(payload: Omit<EMessageElementTextAdd, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_TEXT_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_TEXT_ADD, ...payload });
  }

  public elementTextUpdate(payload: Omit<EMessageElementTextUpdate, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_TEXT_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_TEXT_UPDATE, ...payload });
  }

  public elementRemove(payload: Omit<EMessageElementRemove, "type">): void {
    console.debug("[bridge] postMessage ELEMENT_REMOVE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ELEMENT_REMOVE, ...payload });
  }

  // Constraints

  public constraintAspectAdd(payload: Omit<EMessageConstraintAspectAdd, "type">): void {
    console.debug("[bridge] postMessage CONSTRAINT_ASPECT_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.CONSTRAINT_ASPECT_ADD, ...payload });
  }

  public constraintAspectUpdate(payload: Omit<EMessageConstraintAspectUpdate, "type">): void {
    console.debug("[bridge] postMessage CONSTRAINT_ASPECT_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.CONSTRAINT_ASPECT_UPDATE, ...payload });
  }

  public constraintDistanceHorizontalAdd(
    payload: Omit<EMessageConstraintDistanceHorizontalAdd, "type">,
  ): void {
    console.debug("[bridge] postMessage CONSTRAINT_DISTANCE_HORIZONTAL_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.CONSTRAINT_DISTANCE_HORIZONTAL_ADD, ...payload });
  }

  public constraintDistanceHorizontalUpdate(
    payload: Omit<EMessageConstraintDistanceHorizontalUpdate, "type">,
  ): void {
    console.debug(
      "[bridge] postMessage CONSTRAINT_DISTANCE_HORIZONTAL_UPDATE uuid=%s",
      payload.uuid,
    );
    this.sendMessage({ type: EMessageType.CONSTRAINT_DISTANCE_HORIZONTAL_UPDATE, ...payload });
  }

  public constraintDistanceVerticalAdd(
    payload: Omit<EMessageConstraintDistanceVerticalAdd, "type">,
  ): void {
    console.debug("[bridge] postMessage CONSTRAINT_DISTANCE_VERTICAL_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.CONSTRAINT_DISTANCE_VERTICAL_ADD, ...payload });
  }

  public constraintDistanceVerticalUpdate(
    payload: Omit<EMessageConstraintDistanceVerticalUpdate, "type">,
  ): void {
    console.debug("[bridge] postMessage CONSTRAINT_DISTANCE_VERTICAL_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.CONSTRAINT_DISTANCE_VERTICAL_UPDATE, ...payload });
  }

  public constraintProportionHorizontalAdd(
    payload: Omit<EMessageConstraintProportionHorizontalAdd, "type">,
  ): void {
    console.debug(
      "[bridge] postMessage CONSTRAINT_PROPORTION_HORIZONTAL_ADD uuid=%s",
      payload.uuid,
    );
    this.sendMessage({ type: EMessageType.CONSTRAINT_PROPORTION_HORIZONTAL_ADD, ...payload });
  }

  public constraintProportionHorizontalUpdate(
    payload: Omit<EMessageConstraintProportionHorizontalUpdate, "type">,
  ): void {
    console.debug(
      "[bridge] postMessage CONSTRAINT_PROPORTION_HORIZONTAL_UPDATE uuid=%s",
      payload.uuid,
    );
    this.sendMessage({ type: EMessageType.CONSTRAINT_PROPORTION_HORIZONTAL_UPDATE, ...payload });
  }

  public constraintProportionVerticalAdd(
    payload: Omit<EMessageConstraintProportionVerticalAdd, "type">,
  ): void {
    console.debug("[bridge] postMessage CONSTRAINT_PROPORTION_VERTICAL_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.CONSTRAINT_PROPORTION_VERTICAL_ADD, ...payload });
  }

  public constraintProportionVerticalUpdate(
    payload: Omit<EMessageConstraintProportionVerticalUpdate, "type">,
  ): void {
    console.debug(
      "[bridge] postMessage CONSTRAINT_PROPORTION_VERTICAL_UPDATE uuid=%s",
      payload.uuid,
    );
    this.sendMessage({ type: EMessageType.CONSTRAINT_PROPORTION_VERTICAL_UPDATE, ...payload });
  }

  public constraintSizeHorizontalAdd(
    payload: Omit<EMessageConstraintSizeHorizontalAdd, "type">,
  ): void {
    console.debug("[bridge] postMessage CONSTRAINT_SIZE_HORIZONTAL_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.CONSTRAINT_SIZE_HORIZONTAL_ADD, ...payload });
  }

  public constraintSizeHorizontalUpdate(
    payload: Omit<EMessageConstraintSizeHorizontalUpdate, "type">,
  ): void {
    console.debug("[bridge] postMessage CONSTRAINT_SIZE_HORIZONTAL_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.CONSTRAINT_SIZE_HORIZONTAL_UPDATE, ...payload });
  }

  public constraintSizeVerticalAdd(payload: Omit<EMessageConstraintSizeVerticalAdd, "type">): void {
    console.debug("[bridge] postMessage CONSTRAINT_SIZE_VERTICAL_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.CONSTRAINT_SIZE_VERTICAL_ADD, ...payload });
  }

  public constraintSizeVerticalUpdate(
    payload: Omit<EMessageConstraintSizeVerticalUpdate, "type">,
  ): void {
    console.debug("[bridge] postMessage CONSTRAINT_SIZE_VERTICAL_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.CONSTRAINT_SIZE_VERTICAL_UPDATE, ...payload });
  }

  public constraintRemove(payload: Omit<EMessageConstraintRemove, "type">): void {
    console.debug("[bridge] postMessage CONSTRAINT_REMOVE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.CONSTRAINT_REMOVE, ...payload });
  }

  // Assets

  public assetFontAdd(payload: Omit<EMessageAssetFontAdd, "type">): void {
    console.debug("[bridge] postMessage ASSET_FONT_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ASSET_FONT_ADD, ...payload });
  }

  public assetFontUpdate(payload: Omit<EMessageAssetFontUpdate, "type">): void {
    console.debug("[bridge] postMessage ASSET_FONT_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ASSET_FONT_UPDATE, ...payload });
  }

  public assetImageAdd(payload: Omit<EMessageAssetImageAdd, "type">): void {
    console.debug("[bridge] postMessage ASSET_IMAGE_ADD uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ASSET_IMAGE_ADD, ...payload });
  }

  public assetImageUpdate(payload: Omit<EMessageAssetImageUpdate, "type">): void {
    console.debug("[bridge] postMessage ASSET_IMAGE_UPDATE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ASSET_IMAGE_UPDATE, ...payload });
  }

  public assetRemove(payload: Omit<EMessageAssetRemove, "type">): void {
    console.debug("[bridge] postMessage ASSET_REMOVE uuid=%s", payload.uuid);
    this.sendMessage({ type: EMessageType.ASSET_REMOVE, ...payload });
  }

  // Common

  public commonReset(): void {
    console.debug("[bridge] postMessage COMMON_RESET");
    this.sendMessage({ type: EMessageType.COMMON_RESET });
  }

  public commonSetTheme(theme: "DARK" | "LIGHT"): void {
    console.debug("[bridge] postMessage COMMON_SET_THEME theme=%s", theme);
    this.sendMessage({ type: EMessageType.COMMON_SET_THEME, theme });
  }

  // Private

  private sendMessage(message: unknown): void {
    this.frame.contentWindow?.postMessage(message, "*");
  }
}
