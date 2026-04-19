import type {
  EStoreDeltaAsset,
  EStoreDeltaAssets,
  EStoreDeltaConstraint,
  EStoreDeltaConstraints,
  EStoreDeltaElement,
  EStoreDeltaElements,
  EStoreDeltaLayer,
  EStoreDeltaLayerList,
} from "../document/signals";
import { STORE } from "../document/store";
import type { EDocument } from "../document/types";
import type { EAnyBridgeMessage } from "./types";
import { EBridgeMessageType } from "./types";

export class EBridge {
  constructor(private readonly frame: HTMLIFrameElement) {
    STORE.signals.setup.on(this.onSetup);
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
    if (this.frame.contentDocument?.readyState === "complete") {
      console.debug("[bridge] whenReady: iframe already ready, firing immediately");
      return;
    }

    await new Promise<void>((resolve) =>
      this.frame.addEventListener("load", () => {
        console.debug("[bridge] whenReady: load event fired");
        resolve();
      }),
    );
  }

  private readonly onSetup = (payload: EDocument): void => {
    this.sendMessage({ type: EBridgeMessageType.SETUP, payload });
  };

  private readonly onAssetsListChanged = (payload: EStoreDeltaAssets): void => {
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

  private readonly onElementsListChanged = (payload: EStoreDeltaElements): void => {
    this.sendMessage({ type: EBridgeMessageType.ELEMENTS_LIST_CHANGED, payload });
  };

  private readonly onElementsItemChanged = (payload: EStoreDeltaElement): void => {
    this.sendMessage({ type: EBridgeMessageType.ELEMENTS_ITEM_CHANGED, payload });
  };

  private readonly onConstraintsListChanged = (payload: EStoreDeltaConstraints): void => {
    this.sendMessage({ type: EBridgeMessageType.CONSTRAINTS_LIST_CHANGED, payload });
  };

  private readonly onConstraintsItemChanged = (payload: EStoreDeltaConstraint): void => {
    this.sendMessage({ type: EBridgeMessageType.CONSTRAINTS_ITEM_CHANGED, payload });
  };

  private sendMessage(message: EAnyBridgeMessage): void {
    this.frame.contentWindow?.postMessage(message, "*");
  }
}
