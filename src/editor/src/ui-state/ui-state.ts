import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import type { EStoreDeltaLayers } from "../document/signals";
import { EStoreDeltaOperation } from "../document/signals";
import { STORE } from "../document/store";
import type { ELayerUuid } from "../document/types.misc";
import type { EUIStateData } from "./types";

export class EUIState {
  private readonly data: EUIStateData = { activeLayer: undefined };
  private readonly signalActiveLayerChangedInternal = new Ferrsign1<ELayerUuid | undefined>();

  constructor() {
    STORE.signals.layers.list.on(this.onLayersChanged);
  }

  public get signalActiveLayerChanged(): FerrsignView1<ELayerUuid | undefined> {
    return this.signalActiveLayerChangedInternal;
  }

  public get forceActiveLayerUuid(): ELayerUuid {
    if (this.data.activeLayer === undefined) {
      throw new Error(`[EUIState.forceCurrentLayerUuid] Current layer uuid is undefined`);
    }
    return this.data.activeLayer;
  }

  public get activeLayerUuid(): ELayerUuid | undefined {
    return this.data.activeLayer;
  }

  public setActiveLayer(uuid?: ELayerUuid): void {
    if (uuid !== undefined && STORE.selectors.layers.select(uuid) === undefined) {
      console.error(`[EUIState.setCurrentLayer] Layer not found: ${uuid}`);
      return;
    }

    if (this.data.activeLayer !== uuid) {
      this.data.activeLayer = uuid;
      this.signalActiveLayerChangedInternal.emit(uuid);
    }
  }

  private readonly onLayersChanged = (delta: EStoreDeltaLayers): void => {
    if (delta.operation === EStoreDeltaOperation.REMOVE && this.data.activeLayer === delta.uuid) {
      this.setActiveLayer(undefined);
    } else if (
      delta.operation === EStoreDeltaOperation.ADD &&
      this.data.activeLayer === undefined
    ) {
      this.setActiveLayer(delta.layerContext.layer.uuid);
    }
  };
}

export const UI_STATE = new EUIState();
