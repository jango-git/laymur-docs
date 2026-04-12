import type { FerrsignView1 } from "ferrsign";
import { Ferrsign1 } from "ferrsign";
import type {
  EArrayControlItem,
  EArrayControlTemplate,
} from "../../../controls/EArrayControl/EArrayControl";
import { EArrayControl } from "../../../controls/EArrayControl/EArrayControl";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { EImageAsset } from "../../../document/types.assets";
import { EElementType } from "../../../document/types.elements";
import type { UUID } from "../../../document/types.misc";
import { EAnimatedImageLoopMode } from "../../../document/types.misc";
import type { EAnimatedImageElementError } from "../../../document/validators/elements";
import { UI_STATE } from "../../../ui-state/ui-state";
import { makeRow } from "../../../utils/rows";
import { TOAST } from "../../toast/EToast";

const sequenceTemplate: EArrayControlTemplate<UUID> = {
  createDefault: () => "",
  buildItem(container, value, onChange): EArrayControlItem<UUID> {
    const ctrl = new EAssetControl<EImageAsset>(
      container,
      () => STORE.selectors.assets.selectAllImages(),
      { value: STORE.selectors.assets.selectImage(value), nullable: false },
    );
    ctrl.signalValueChanged.on(() => onChange());
    return {
      getValue: () => ctrl.value?.uuid ?? "",
      destroy: () => ctrl.destroy(),
    };
  },
};

export class EAnimatedImageElementBuilder {
  private readonly nameControl: EStringControl;
  private readonly sequenceControl: EArrayControl<UUID>;
  private readonly signalBuildAvailabilityInternal = new Ferrsign1<boolean>();

  constructor(container: HTMLElement) {
    this.nameControl = new EStringControl(makeRow(container, "Name"), { placeholder: "name" });
    this.nameControl.signalValueChanged.on(this.handleDataUpdate);

    this.sequenceControl = new EArrayControl<UUID>(
      makeRow(container, "Sequence"),
      sequenceTemplate,
    );
    this.sequenceControl.signalValueChanged.on(this.handleDataUpdate);

    UI_STATE.signalActiveLayerChanged.on(this.handleDataUpdate);
    this.tryUpdateData();
  }

  public get buildAvailabilitySignal(): FerrsignView1<boolean> {
    return this.signalBuildAvailabilityInternal;
  }

  public build(): void {
    const sequence = this.sequenceControl.value.filter((uuid) => uuid !== "");
    STORE.commands.elements.add(UI_STATE.forceActiveLayerUuid, {
      uuid: crypto.randomUUID(),
      type: EElementType.ANIMATED_IMAGE,
      name: this.nameControl.value,
      color: { color: "#ffffff", alpha: 255 },
      sequence,
      frameRate: 24,
      timeScale: 1,
      loopMode: EAnimatedImageLoopMode.LOOP,
      playByDefault: true,
    });

    this.nameControl.value = "";
    this.sequenceControl.value = [];

    this.tryUpdateData();
  }

  private readonly handleDataUpdate = (): void => {
    const error = this.tryUpdateData();
    if (error === undefined) {
      return;
    }

    TOAST.warning(`[EAnimatedImageElementBuilder] ${error.message}`);

    if (error.field === "name") {
      this.nameControl.flash();
    } else if (error.field === "sequence") {
      this.sequenceControl.flash();
    }
  };

  private tryUpdateData(): EAnimatedImageElementError | undefined {
    const sequence = this.sequenceControl.value.filter((uuid) => uuid !== "");
    const error = STORE.validators.elements.animatedImage(
      UI_STATE.activeLayerUuid,
      { name: this.nameControl.value, sequence },
      false,
    );

    this.signalBuildAvailabilityInternal.emit(error === undefined);
    return error;
  }
}
