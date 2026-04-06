import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import type { EStoreDeltaLayers } from "../../../document/signals";
import { EStoreDeltaOperation } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { ELayerContext } from "../../../document/types";
import { ELayerType } from "../../../document/types.layers";
import type { ELayerUuid } from "../../../document/types.misc";
import { UI_STATE } from "../../../ui-state/ui-state";
import { EFullscreenLayerBuilder } from "../../builders/layers/EFullscreenLayerBuilder";

export class ELayersTab {
  private readonly layersContent: HTMLElement;
  private readonly uuidToCardMap = new Map<ELayerUuid, HTMLElement>();

  constructor(private readonly container: HTMLElement) {
    {
      const scrollArea = document.createElement("div");
      scrollArea.className = "tab-scroll-area";
      container.appendChild(scrollArea);

      const layersContent = document.createElement("div");
      layersContent.id = "layers-content";
      scrollArea.appendChild(layersContent);
      this.layersContent = layersContent;
    }

    const builderSection = document.createElement("div");
    builderSection.className = "tab-builder";
    this.container.appendChild(builderSection);

    const builderBody = document.createElement("div");
    builderSection.appendChild(builderBody);
    const builder = new EFullscreenLayerBuilder(builderBody);

    const controlRow = document.createElement("div");
    controlRow.className = "tab-builder__control-row";
    builderSection.appendChild(controlRow);

    new ESelectControl<ELayerType>(controlRow, {
      options: [{ label: "Fullscreen", value: ELayerType.FULLSCREEN }],
      value: ELayerType.FULLSCREEN,
    });

    const addButton = document.createElement("button");
    addButton.className = "button-primary";
    addButton.textContent = "ADD";
    addButton.addEventListener("click", () => builder.build());
    controlRow.appendChild(addButton);

    builder.buildAvailabilitySignal.on((available) => {
      addButton.disabled = !available;
    });

    STORE.signals.layers.list.on(this.onLayerListChanged);
    UI_STATE.signalActiveLayerChanged.on(this.onActiveLayerChanged);

    for (const layerContext of STORE.selectors.layers.selectAllContexts()) {
      this.addRow(layerContext);
    }
  }

  private addRow(layerContext: ELayerContext): void {
    const row = document.createElement("div");
    row.className = "layer-row";
    row.dataset.uuid = layerContext.layer.uuid;

    const nameSpan = document.createElement("span");
    nameSpan.className = "layer-row__name";
    nameSpan.textContent = layerContext.layer.name;
    row.appendChild(nameSpan);
    row.addEventListener("click", () => UI_STATE.setActiveLayer(layerContext.layer.uuid));

    this.layersContent.appendChild(row);
    this.uuidToCardMap.set(layerContext.layer.uuid, row);

    if (UI_STATE.activeLayerUuid === layerContext.layer.uuid) {
      row.classList.add("layer-row--active");
    }
  }

  private removeRow(uuid: ELayerUuid): void {
    this.uuidToCardMap.get(uuid)?.remove();
    this.uuidToCardMap.delete(uuid);

    if (UI_STATE.activeLayerUuid === uuid) {
      UI_STATE.setActiveLayer(undefined);
    }
  }

  private reorderRows(uuids: ELayerUuid[]): void {
    for (const uuid of uuids) {
      const row = this.uuidToCardMap.get(uuid);
      if (row) {
        this.layersContent.appendChild(row);
      }
    }
  }

  private readonly onLayerListChanged = (delta: EStoreDeltaLayers): void => {
    switch (delta.operation) {
      case EStoreDeltaOperation.ADD:
        this.addRow(delta.layerContext);
        break;
      case EStoreDeltaOperation.REMOVE:
        this.removeRow(delta.uuid);
        break;
      case EStoreDeltaOperation.REORDER:
        this.reorderRows(delta.uuids);
        break;
    }
  };

  private readonly onActiveLayerChanged = (uuid: ELayerUuid | undefined): void => {
    for (const [rowUuid, row] of this.uuidToCardMap) {
      row.classList.toggle("layer-row--active", rowUuid === uuid);
    }
  };
}
