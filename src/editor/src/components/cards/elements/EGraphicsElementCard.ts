import { EArrayControl } from "../../../controls/EArrayControl/EArrayControl";
import { EVec2Control } from "../../../controls/EVec2Control/EVec2Control";
import type { EStoreDeltaElement } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EGraphicsElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type {
  EAnyGraphicsDrawCommand,
  EColor,
  EElementUuid,
  ELayerUuid,
} from "../../../document/types.misc";
import { makeRow, makeSectionHeader } from "../../../utils/rows";
import { EElementCard } from "./EElementCard";
import { drawCommandTemplate } from "./subcards/EDrawCommandSubcard.Internal";

export class EGraphicsElementCard extends EElementCard {
  private readonly resolutionControl: EVec2Control;
  private readonly drawSequenceControl: EArrayControl<EAnyGraphicsDrawCommand>;

  constructor(container: HTMLElement, uuid: EElementUuid, layerUuid: ELayerUuid) {
    super(container, uuid, layerUuid, "Graphics");

    this.nameControl.signalValueChanged.on(this.onNameChanged);
    this.colorControl.signalValueChanged.on(this.onColorChanged);

    this.resolutionControl = new EVec2Control(makeRow(this.bodyRoot, "Resolution"), {
      labels: ["W", "H"],
      value: [512, 512],
      min: 1,
      max: 4096,
      step: 1,
      precision: 0,
    });
    this.resolutionControl.signalValueChanged.on(this.onResolutionChanged);

    makeSectionHeader(this.bodyRoot, "Draw Sequence");
    this.drawSequenceControl = new EArrayControl<EAnyGraphicsDrawCommand>(
      this.bodyRoot,
      drawCommandTemplate,
    );
    this.drawSequenceControl.signalValueChanged.on(this.onDrawSequenceChanged);

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type !== EElementType.GRAPHICS) {
      throw new Error("EGraphicsElementCard: initial element is not a graphics element");
    }

    this.refresh(initial);
    STORE.signals.elements.item.on(this.onElementItemChanged);
  }

  private refresh(element: EGraphicsElement): void {
    this.nameControl.value = element.name;
    this.colorControl.value = element.color;
    this.resolutionControl.value = [element.resolution[0], element.resolution[1]];
    this.drawSequenceControl.value = element.drawSequence;
  }

  private readonly onNameChanged = (name: string): void => {
    STORE.commands.elements.writeGraphics({ uuid: this.uuid, name });
  };

  private readonly onColorChanged = (color: EColor): void => {
    STORE.commands.elements.writeGraphics({ uuid: this.uuid, color });
  };

  private readonly onResolutionChanged = ([w, h]: [number, number]): void => {
    STORE.commands.elements.writeGraphics({ uuid: this.uuid, resolution: [w, h] });
  };

  private readonly onDrawSequenceChanged = (drawSequence: EAnyGraphicsDrawCommand[]): void => {
    STORE.commands.elements.writeGraphics({ uuid: this.uuid, drawSequence });
  };

  private readonly onElementItemChanged = (delta: EStoreDeltaElement): void => {
    if (delta.element.uuid === this.uuid && delta.element.type === EElementType.GRAPHICS) {
      this.refresh(delta.element);
    }
  };
}
