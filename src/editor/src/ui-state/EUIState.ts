import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import { EStoreDeltaOperation } from "../document/signals";
import type { EStoreDeltaLayerList } from "../document/signals/layers";
import { STORE } from "../document/store";
import { clone } from "../document/types";
import type { ELayerUUID } from "../document/types.misc";
import { consoleDebug } from "../miscellaneous/debug.print";
import type { EUIDebugState, EUIStateData } from "./EUIState.Internal";

export class EUIState {
  private readonly data: EUIStateData = {
    activeLayer: undefined,
    debug: {
      showAspect: false,
      showHeight: false,
      showWidth: false,
      showHorizontalDistance: false,
      showHorizontalInterpolation: false,
      showVerticalDistance: false,
      showVerticalInterpolation: false,
    },
  };

  private readonly signalActiveLayerChangedInternal = new Ferrsign1<ELayerUUID | undefined>();
  private readonly signalDebugChangedInternal = new Ferrsign1<Partial<EUIDebugState>>();

  constructor() {
    STORE.signals.layers.list.on(this.onLayersChanged);
    STORE.signals.setup.on(this.onSetup);
  }

  public get signalActiveLayerChanged(): FerrsignView1<ELayerUUID | undefined> {
    return this.signalActiveLayerChangedInternal;
  }

  public get signalDebugChanged(): FerrsignView1<Partial<EUIDebugState>> {
    return this.signalDebugChangedInternal;
  }

  public get forceActiveLayerUuid(): ELayerUUID {
    if (this.data.activeLayer === undefined) {
      throw new Error(`[EUIState.forceCurrentLayerUuid] Current layer uuid is undefined`);
    }
    return this.data.activeLayer;
  }

  public get activeLayerUuid(): ELayerUUID | undefined {
    return this.data.activeLayer;
  }

  public get debug(): EUIDebugState {
    return clone(this.data.debug);
  }

  public setActiveLayer(uuid?: ELayerUUID): void {
    if (uuid !== undefined && STORE.selectors.layers.select(uuid) === undefined) {
      throw new Error(`[EUIState.setCurrentLayer] Layer not found: ${uuid}`);
    }

    if (this.data.activeLayer !== uuid) {
      this.data.activeLayer = uuid;
      consoleDebug(`[EUIState] active layer changed: ${uuid}`);
      this.signalActiveLayerChangedInternal.emit(uuid);
    }
  }

  public setDebug(state: Partial<EUIDebugState>): void {
    const delta: Partial<EUIDebugState> = {};

    if (state.showAspect !== undefined && this.data.debug.showAspect !== state.showAspect) {
      this.data.debug.showAspect = state.showAspect;
      delta.showAspect = state.showAspect;
    }

    if (state.showHeight !== undefined && this.data.debug.showHeight !== state.showHeight) {
      this.data.debug.showHeight = state.showHeight;
      delta.showHeight = state.showHeight;
    }

    if (state.showWidth !== undefined && this.data.debug.showWidth !== state.showWidth) {
      this.data.debug.showWidth = state.showWidth;
      delta.showWidth = state.showWidth;
    }

    if (
      state.showHorizontalDistance !== undefined &&
      this.data.debug.showHorizontalDistance !== state.showHorizontalDistance
    ) {
      this.data.debug.showHorizontalDistance = state.showHorizontalDistance;
      delta.showHorizontalDistance = state.showHorizontalDistance;
    }

    if (
      state.showHorizontalInterpolation !== undefined &&
      this.data.debug.showHorizontalInterpolation !== state.showHorizontalInterpolation
    ) {
      this.data.debug.showHorizontalInterpolation = state.showHorizontalInterpolation;
      delta.showHorizontalInterpolation = state.showHorizontalInterpolation;
    }

    if (
      state.showVerticalDistance !== undefined &&
      this.data.debug.showVerticalDistance !== state.showVerticalDistance
    ) {
      this.data.debug.showVerticalDistance = state.showVerticalDistance;
      delta.showVerticalDistance = state.showVerticalDistance;
    }

    if (
      state.showVerticalInterpolation !== undefined &&
      this.data.debug.showVerticalInterpolation !== state.showVerticalInterpolation
    ) {
      this.data.debug.showVerticalInterpolation = state.showVerticalInterpolation;
      delta.showVerticalInterpolation = state.showVerticalInterpolation;
    }

    consoleDebug(`[EUIState] debug changed: ${JSON.stringify(delta)}`);
  }

  private readonly onLayersChanged = (delta: EStoreDeltaLayerList): void => {
    if (delta.operation === EStoreDeltaOperation.REMOVE && this.data.activeLayer === delta.uuid) {
      this.setActiveLayer(undefined);
    }
  };

  private readonly onSetup = (): void => {
    this.setActiveLayer(undefined);
  };
}

export const UI_STATE = new EUIState();
