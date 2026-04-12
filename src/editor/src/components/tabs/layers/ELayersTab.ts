import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import type { EStoreDeltaLayers } from "../../../document/signals";
import { EStoreDeltaOperation } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { ELayerContext } from "../../../document/types";
import { ELayerType } from "../../../document/types.layers";
import type { UUID } from "../../../document/types.misc";
import { makeSortable } from "../../../miscellaneous/make-sortable";
import { EFullscreenLayerBuilder } from "../../builders/layers/EFullscreenLayerBuilder";
import { EFullscreenLayerCard } from "../../cards/layers/EFullscreenLayerCard";

export class ELayersTab {
  private readonly layersContent: HTMLElement;
  private readonly uuidToCardMap = new Map<UUID, HTMLElement>();

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

    STORE.signals.setup.on(this.onSetup);
    STORE.signals.layers.list.on(this.onLayerListChanged);

    for (const layerContext of STORE.selectors.layers.selectAllContexts()) {
      this.addCard(layerContext);
    }

    makeSortable(this.layersContent, (fromIndex, toIndex) => {
      const uuids = [...this.layersContent.children].map(
        (el) => (el as HTMLElement).dataset.uuid ?? "",
      );
      const [moved] = uuids.splice(fromIndex, 1);
      uuids.splice(toIndex, 0, moved);
      STORE.commands.layers.reorder(uuids);
    });
  }

  private addCard(layerContext: ELayerContext): void {
    const container = document.createElement("div");
    container.dataset.uuid = layerContext.layer.uuid;
    this.layersContent.appendChild(container);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (layerContext.layer.type === ELayerType.FULLSCREEN) {
      new EFullscreenLayerCard(container, layerContext.layer.uuid);
    }

    this.uuidToCardMap.set(layerContext.layer.uuid, container);
  }

  private removeCard(uuid: UUID): void {
    this.uuidToCardMap.get(uuid)?.remove();
    this.uuidToCardMap.delete(uuid);
  }

  private reorderCards(uuids: UUID[]): void {
    for (const uuid of uuids) {
      const card = this.uuidToCardMap.get(uuid);
      if (card) {
        this.layersContent.appendChild(card);
      }
    }
  }

  private readonly onSetup = (): void => {
    for (const container of this.uuidToCardMap.values()) {
      container.remove();
    }
    this.uuidToCardMap.clear();

    for (const layerContext of STORE.selectors.layers.selectAllContexts()) {
      this.addCard(layerContext);
    }
  };

  private readonly onLayerListChanged = (delta: EStoreDeltaLayers): void => {
    switch (delta.operation) {
      case EStoreDeltaOperation.ADD:
        this.addCard(delta.layerContext);
        break;
      case EStoreDeltaOperation.REMOVE:
        this.removeCard(delta.uuid);
        break;
      case EStoreDeltaOperation.REORDER:
        this.reorderCards(delta.uuids);
        break;
    }
  };
}
