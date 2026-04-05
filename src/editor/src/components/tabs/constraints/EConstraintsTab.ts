import { EStoreDeltaOperation } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EConstraintUUID, ELayerUUID } from "../../../document/types.misc";

export class EConstraintsTab {
  private readonly cardList: HTMLElement;
  private readonly cardMap = new Map<EConstraintUUID, HTMLElement>();

  constructor(container: HTMLElement) {
    const cardList = container.querySelector<HTMLElement>("#constraints-content");
    if (!cardList) {
      throw new Error("[EConstraintsTab] #constraints-content not found");
    }
    this.cardList = cardList;

    STORE.signals.constraints.list.on((delta) => {
      if (delta.operation === EStoreDeltaOperation.ADD) {
        if (delta.layerUuid === STORE.currentLayerUuid) {
          this.addPlaceholder(delta.constraint.uuid, delta.constraint.type);
        }
      } else if (delta.operation === EStoreDeltaOperation.REMOVE) {
        if (delta.layerUuid === STORE.currentLayerUuid) {
          this.removePlaceholder(delta.uuid);
        }
      }
    });

    STORE.currentLayerChanged.on((uuid) => {
      this.reloadForLayer(uuid);
    });
  }

  private addPlaceholder(uuid: EConstraintUUID, type: string): void {
    const wrapper = document.createElement("div");
    wrapper.className = "constraint-placeholder";
    wrapper.dataset.uuid = uuid;
    wrapper.textContent = type;
    this.cardList.appendChild(wrapper);
    this.cardMap.set(uuid, wrapper);
  }

  private removePlaceholder(uuid: EConstraintUUID): void {
    this.cardMap.get(uuid)?.remove();
    this.cardMap.delete(uuid);
  }

  private reloadForLayer(layerUuid: ELayerUUID | null): void {
    for (const wrapper of this.cardMap.values()) {
      wrapper.remove();
    }
    this.cardMap.clear();

    if (layerUuid === null) {
      return;
    }

    const constraints = STORE.selectors.constraints.selectAll(layerUuid);
    if (constraints) {
      for (const c of constraints) {
        this.addPlaceholder(c.uuid, c.type);
      }
    }
  }
}
