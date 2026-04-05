import { EStoreDeltaOperation } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { ELayerContext } from "../../../document/types";
import type { ELayerUUID } from "../../../document/types.misc";
import { EFullscreenLayerBuilder } from "../../builders/layers/EFullscreenLayerBuilder";

export class ELayersTab {
  private readonly layersContent: HTMLElement;
  private readonly rowMap = new Map<ELayerUUID, HTMLElement>();

  constructor(private readonly container: HTMLElement) {
    const layersContentSelector = "#layers-content";
    const layersContent = this.container.querySelector<HTMLElement>(layersContentSelector);
    if (!layersContent) {
      throw new Error(`[ELayersTab] ${layersContentSelector} not found`);
    }
    this.layersContent = layersContent;

    const builderSection = document.createElement("div");
    builderSection.className = "tab-builder";
    this.container.appendChild(builderSection);
    new EFullscreenLayerBuilder(builderSection);

    STORE.signals.layers.list.on((delta) => {
      if (delta.operation === EStoreDeltaOperation.ADD) {
        this.addRow(delta.layerContext);
      } else if (delta.operation === EStoreDeltaOperation.REMOVE) {
        this.removeRow(delta.uuid);
      }
    });

    STORE.currentLayerChanged.on((uuid) => {
      this.updateActiveRow(uuid);
    });

    const existing = STORE.selectors.layers.selectAllContexts();
    if (existing) {
      for (const ctx of existing) {
        this.addRow(ctx);
      }
    }
  }

  private addRow(ctx: ELayerContext): void {
    const row = document.createElement("div");
    row.className = "layer-row";
    row.dataset.uuid = ctx.layer.uuid;

    const nameSpan = document.createElement("span");
    nameSpan.className = "layer-row__name";
    nameSpan.textContent = ctx.layer.name;
    row.appendChild(nameSpan);

    row.addEventListener("click", () => {
      STORE.setCurrentLayer(ctx.layer.uuid);
    });

    this.layersContent.appendChild(row);
    this.rowMap.set(ctx.layer.uuid, row);

    if (STORE.currentLayerUuid === ctx.layer.uuid) {
      row.classList.add("layer-row--active");
    }
  }

  private removeRow(uuid: ELayerUUID): void {
    this.rowMap.get(uuid)?.remove();
    this.rowMap.delete(uuid);
    if (STORE.currentLayerUuid === uuid) {
      STORE.setCurrentLayer(null);
    }
  }

  private updateActiveRow(uuid: ELayerUUID | null): void {
    for (const [rowUuid, row] of this.rowMap) {
      row.classList.toggle("layer-row--active", rowUuid === uuid);
    }
  }
}
