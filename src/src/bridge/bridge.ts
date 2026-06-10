import type { EStoreDeltaAsset, EStoreDeltaAssetList } from "../document/signals/assets";
import type {
  EStoreDeltaConstraint,
  EStoreDeltaConstraintList,
} from "../document/signals/constraints";
import type { EStoreDeltaElement, EStoreDeltaElementList } from "../document/signals/elements";
import type { EStoreDeltaLayer, EStoreDeltaLayerList } from "../document/signals/layers";
import { STORE } from "../document/store";
import type { EDocument } from "../document/types";
import type { ELayerUUID } from "../document/types.misc";
import { UI_STATE } from "../ui-state/EUIState";
import type { EAnyBridgeMessage } from "./types";
import { EBridgeMessageType } from "./types";

export class EBridge {
  constructor(private readonly frame: HTMLIFrameElement) {
    STORE.signals.setup.on(this.onSetup);
    UI_STATE.signalActiveLayerChanged.on(this.onActiveLayerChanged);
    UI_STATE.signalDebugChanged.on(this.onDebugChanged);
    STORE.signals.assets.list.on(this.onAssetsListChanged);
    STORE.signals.assets.item.on(this.onAssetsItemChanged);
    STORE.signals.layers.list.on(this.onLayersListChanged);
    STORE.signals.layers.item.on(this.onLayersItemChanged);
    STORE.signals.elements.list.on(this.onElementsListChanged);
    STORE.signals.elements.item.on(this.onElementsItemChanged);
    STORE.signals.constraints.list.on(this.onConstraintsListChanged);
    STORE.signals.constraints.item.on(this.onConstraintsItemChanged);
  }

  public async preload(): Promise<void> {
    // An iframe with a src first exposes a synchronous about:blank document
    // (readyState "complete") before it navigates to preview.html. Waiting on
    // readyState alone would resolve against that empty document and messages
    // sent right after would be lost. Identify the real preview by its
    // <canvas id="canvas"> so we only resolve once preview.js has run and
    // registered its message listener.
    const isPreviewLoaded = (): boolean =>
      this.frame.contentDocument?.readyState === "complete" &&
      this.frame.contentDocument.getElementById("canvas") !== null;

    if (isPreviewLoaded()) {
      return;
    }

    await new Promise<void>((resolve) => {
      const onLoad = (): void => {
        // Ignore the about:blank load event; resolve only once preview.html
        // (identified by its canvas) is the framed document.
        if (this.frame.contentDocument?.getElementById("canvas")) {
          this.frame.removeEventListener("load", onLoad);
          resolve();
        }
      };
      this.frame.addEventListener("load", onLoad);
    });
  }

  private readonly onSetup = (payload: EDocument): void => {
    this.sendMessage({ type: EBridgeMessageType.SETUP, payload });
  };

  private readonly onActiveLayerChanged = (payload: ELayerUUID | undefined): void => {
    this.sendMessage({ type: EBridgeMessageType.ACTIVE_LAYER_CHANGED, payload });
  };

  // Forward the full debug state so the preview always has the complete picture
  // and can re-apply it when the active layer changes.
  private readonly onDebugChanged = (): void => {
    this.sendMessage({ type: EBridgeMessageType.DEBUG_CHANGED, payload: UI_STATE.debug });
  };

  private readonly onAssetsListChanged = (payload: EStoreDeltaAssetList): void => {
    this.sendMessage({ type: EBridgeMessageType.ASSETS_LIST_CHANGED, payload });
  };

  private readonly onAssetsItemChanged = (payload: EStoreDeltaAsset): void => {
    this.sendMessage({ type: EBridgeMessageType.ASSETS_ITEM_CHANGED, payload });
  };

  private readonly onLayersListChanged = (payload: EStoreDeltaLayerList): void => {
    this.sendMessage({ type: EBridgeMessageType.LAYERS_LIST_CHANGED, payload });
  };

  private readonly onLayersItemChanged = (payload: EStoreDeltaLayer): void => {
    this.sendMessage({ type: EBridgeMessageType.LAYERS_ITEM_CHANGED, payload });
  };

  private readonly onElementsListChanged = (payload: EStoreDeltaElementList): void => {
    this.sendMessage({ type: EBridgeMessageType.ELEMENTS_LIST_CHANGED, payload });
  };

  private readonly onElementsItemChanged = (payload: EStoreDeltaElement): void => {
    this.sendMessage({ type: EBridgeMessageType.ELEMENTS_ITEM_CHANGED, payload });
  };

  private readonly onConstraintsListChanged = (payload: EStoreDeltaConstraintList): void => {
    this.sendMessage({ type: EBridgeMessageType.CONSTRAINTS_LIST_CHANGED, payload });
  };

  private readonly onConstraintsItemChanged = (payload: EStoreDeltaConstraint): void => {
    this.sendMessage({ type: EBridgeMessageType.CONSTRAINTS_ITEM_CHANGED, payload });
  };

  private sendMessage(message: EAnyBridgeMessage): void {
    this.frame.contentWindow?.postMessage(message, "*");
  }
}
