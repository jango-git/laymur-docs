import { EArrayControl } from "../../../controls/EArrayControl/EArrayControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import type { EStoreDeltaElement } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { ETextElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EColor, EElementUuid, ELayerUuid, ETextChunk } from "../../../document/types.misc";
import { ETextResizeMode } from "../../../document/types.misc";
import { makeRow, makeSectionHeader } from "../../../utils/rows";
import { EElementCard } from "./EElementCard";
import { contentTemplate, RESIZE_MODE_OPTIONS } from "./ETextElementCard.Internal";

export class ETextElementCard extends EElementCard {
  private readonly resizeModeControl: ESelectControl<ETextResizeMode>;
  private readonly maxLineWidthControl: ENumberControl;
  private readonly contentControl: EArrayControl<ETextChunk>;

  constructor(container: HTMLElement, uuid: EElementUuid, layerUuid: ELayerUuid) {
    super(container, uuid, layerUuid, "Text");

    this.nameControl.signalValueChanged.on(this.onNameChanged);
    this.colorControl.signalValueChanged.on(this.onColorChanged);

    this.resizeModeControl = new ESelectControl<ETextResizeMode>(
      makeRow(this.bodyRoot, "Resize Mode"),
      {
        options: RESIZE_MODE_OPTIONS,
        value: ETextResizeMode.SCALE,
      },
    );
    this.resizeModeControl.signalValueChanged.on(this.onResizeModeChanged);

    this.maxLineWidthControl = new ENumberControl(makeRow(this.bodyRoot, "Max Line Width"), {
      value: 0,
      min: 0,
      max: 9999,
      step: 1,
      precision: 0,
    });
    this.maxLineWidthControl.signalValueChanged.on(this.onMaxLineWidthChanged);

    makeSectionHeader(this.bodyRoot, "Content");
    this.contentControl = new EArrayControl<ETextChunk>(this.bodyRoot, contentTemplate);
    this.contentControl.signalValueChanged.on(this.onContentChanged);

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type !== EElementType.TEXT) {
      throw new Error("ETextElementCard: initial element is not a text element");
    }

    this.refresh(initial);
    STORE.signals.elements.item.on(this.onElementItemChanged);
  }

  private refresh(element: ETextElement): void {
    this.nameControl.value = element.name;
    this.colorControl.value = element.color;
    this.resizeModeControl.value = element.resizeMode;
    this.maxLineWidthControl.value = element.maxLineWidth;
    this.contentControl.value = element.content;
  }

  private readonly onNameChanged = (name: string): void => {
    STORE.commands.elements.writeText({ uuid: this.uuid, name });
  };

  private readonly onColorChanged = (color: EColor): void => {
    STORE.commands.elements.writeText({ uuid: this.uuid, color });
  };

  private readonly onResizeModeChanged = (resizeMode: ETextResizeMode): void => {
    STORE.commands.elements.writeText({ uuid: this.uuid, resizeMode });
  };

  private readonly onMaxLineWidthChanged = (maxLineWidth: number): void => {
    STORE.commands.elements.writeText({ uuid: this.uuid, maxLineWidth });
  };

  private readonly onContentChanged = (content: ETextChunk[]): void => {
    STORE.commands.elements.writeText({ uuid: this.uuid, content });
  };

  private readonly onElementItemChanged = (delta: EStoreDeltaElement): void => {
    if (delta.element.uuid === this.uuid && delta.element.type === EElementType.TEXT) {
      this.refresh(delta.element);
    }
  };
}
