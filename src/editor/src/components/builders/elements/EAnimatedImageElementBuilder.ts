import type {
  EArrayControlItem,
  EArrayControlTemplate,
} from "../../../controls/EArrayControl/EArrayControl";
import { EArrayControl } from "../../../controls/EArrayControl/EArrayControl";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import { EElementType } from "../../../document/types.elements";
import type { EAssetUUID } from "../../../document/types.misc";
import { EAnimatedImageLoopMode } from "../../../document/types.misc";

const sequenceTemplate: EArrayControlTemplate<EAssetUUID> = {
  createDefault: () => "",
  buildItem(container, value, onChange): EArrayControlItem<EAssetUUID> {
    const ctrl = new EAssetControl<EImageAsset>(container, STORE.selectors.assets.selectAllImages, {
      value: STORE.selectors.assets.selectImage(value),
      nullable: false,
    });
    ctrl.signalValueChanged.on(() => onChange());
    return {
      getValue: () => ctrl.value?.uuid ?? "",
      destroy: () => ctrl.destroy(),
    };
  },
};

export class EAnimatedImageElementBuilder {
  private readonly sequenceControl: EArrayControl<EAssetUUID>;
  private readonly addButton: HTMLButtonElement;

  constructor(container: HTMLElement) {
    const seqLabel = document.createElement("div");
    seqLabel.className = "element-card__section-header";
    seqLabel.textContent = "Sequence";
    container.appendChild(seqLabel);

    this.sequenceControl = new EArrayControl<EAssetUUID>(container, sequenceTemplate);

    this.addButton = document.createElement("button");
    this.addButton.className = "button-primary";
    this.addButton.textContent = "+ Add";
    container.appendChild(this.addButton);

    this.sequenceControl.signalValueChanged.on(() => this.updateButton());
    STORE.currentLayerChanged.on(() => this.updateButton());
    this.updateButton();

    this.addButton.addEventListener("click", () => {
      if (!this.isValid()) {
        return;
      }
      const sequence = this.sequenceControl.value.filter((uuid) => uuid !== "");
      STORE.commands.elements.add(STORE.currentLayerUuid!, {
        uuid: crypto.randomUUID(),
        type: EElementType.ANIMATED_IMAGE,
        name: "Animated Image",
        color: "#ffffffff",
        sequence,
        frameRate: 24,
        timeScale: 1,
        loopMode: EAnimatedImageLoopMode.LOOP,
        playByDefault: true,
      });
      this.sequenceControl.value = [];
      this.updateButton();
    });
  }

  private isValid(): boolean {
    return (
      STORE.currentLayerUuid !== null &&
      this.sequenceControl.value.filter((uuid) => uuid !== "").length > 0
    );
  }

  private updateButton(): void {
    this.addButton.disabled = !this.isValid();
  }
}
