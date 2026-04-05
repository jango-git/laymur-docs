import type {
  EArrayControlItem,
  EArrayControlTemplate,
} from "../../../controls/EArrayControl/EArrayControl";
import { EArrayControl } from "../../../controls/EArrayControl/EArrayControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import type { ESelectControlOption } from "../../../controls/ESelectControl/ESelectControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { STORE } from "../../../document/store";
import type { EGraphicsElement } from "../../../document/types.elements";
import { EElementType } from "../../../document/types.elements";
import type { EElementUUID, EGraphicsDrawCommand } from "../../../document/types.misc";
import { makeRow, makeSectionHeader } from "./helpers";

// ─── Draw command item ────────────────────────────────────────────────────────

type DrawType = "rect" | "circle" | "arc" | "polyline";

const DRAW_TYPE_OPTIONS: ESelectControlOption<DrawType>[] = [
  { label: "Rect", value: "rect" },
  { label: "Circle", value: "circle" },
  { label: "Arc", value: "arc" },
  { label: "Polyline", value: "polyline" },
];

function detectDrawType(cmd: EGraphicsDrawCommand): DrawType {
  if ("points" in cmd) {
    return "polyline";
  }
  if ("startAngle" in cmd) {
    return "arc";
  }
  if ("width" in cmd) {
    return "rect";
  }
  return "circle";
}

function defaultDrawCmd(type: DrawType): EGraphicsDrawCommand {
  switch (type) {
    case "rect":
      return { x: 0, y: 0, width: 100, height: 100, color: "#ffffffff" };
    case "circle":
      return { x: 0, y: 0, radius: 50, color: "#ffffffff" };
    case "arc":
      return { x: 0, y: 0, radius: 50, startAngle: 0, endAngle: Math.PI * 2, color: "#ffffffff" };
    case "polyline":
      return { points: [], color: "#ffffffff", lineWidth: 1 };
  }
}

const pointsTemplate: EArrayControlTemplate<[number, number]> = {
  createDefault: () => [0, 0],
  buildItem(container, [px, py]: [number, number], onChange): EArrayControlItem<[number, number]> {
    const xCtrl = new ENumberControl(container, {
      value: px,
      min: -99999,
      max: 99999,
      step: 1,
      precision: 1,
    });
    const yCtrl = new ENumberControl(container, {
      value: py,
      min: -99999,
      max: 99999,
      step: 1,
      precision: 1,
    });
    xCtrl.signalValueChanged.on(() => onChange());
    yCtrl.signalValueChanged.on(() => onChange());
    return {
      getValue: (): [number, number] => [xCtrl.value, yCtrl.value],
      destroy: (): void => {},
    };
  },
};

const drawCommandTemplate: EArrayControlTemplate<EGraphicsDrawCommand> = {
  createDefault: () => defaultDrawCmd("rect"),
  buildItem(container, value, onChange): EArrayControlItem<EGraphicsDrawCommand> {
    let type = detectDrawType(value);

    const typeRow = makeRow(container, "Type");
    const typeSelect = new ESelectControl<DrawType>(typeRow, {
      options: DRAW_TYPE_OPTIONS,
      value: type,
    });

    const fieldsDiv = document.createElement("div");
    container.appendChild(fieldsDiv);

    let xCtrl: ENumberControl | undefined = undefined;
    let yCtrl: ENumberControl | undefined = undefined;
    let widthCtrl: ENumberControl | undefined = undefined;
    let heightCtrl: ENumberControl | undefined = undefined;
    let radiusCtrl: ENumberControl | undefined = undefined;
    let startAngleCtrl: ENumberControl | undefined = undefined;
    let endAngleCtrl: ENumberControl | undefined = undefined;
    let pointsCtrl: EArrayControl<[number, number]> | undefined = undefined;
    let lineWidthCtrl: ENumberControl | undefined = undefined;
    let colorCtrl: EColorControl | undefined = undefined;

    function makeF(label: string): HTMLElement {
      return makeRow(fieldsDiv, label);
    }

    function buildFields(t: DrawType, cmd: EGraphicsDrawCommand): void {
      pointsCtrl?.destroy();
      fieldsDiv.innerHTML = "";
      xCtrl = yCtrl = widthCtrl = heightCtrl = undefined;
      radiusCtrl = startAngleCtrl = endAngleCtrl = undefined;
      pointsCtrl = lineWidthCtrl = colorCtrl = undefined;

      if (t !== "polyline") {
        xCtrl = new ENumberControl(makeF("X"), {
          value: "x" in cmd ? cmd.x : 0,
          min: -99999,
          max: 99999,
          step: 1,
          precision: 1,
        });
        xCtrl.signalValueChanged.on(() => onChange());

        yCtrl = new ENumberControl(makeF("Y"), {
          value: "y" in cmd ? cmd.y : 0,
          min: -99999,
          max: 99999,
          step: 1,
          precision: 1,
        });
        yCtrl.signalValueChanged.on(() => onChange());
      }

      if (t === "rect") {
        widthCtrl = new ENumberControl(makeF("W"), {
          value: "width" in cmd ? cmd.width : 100,
          min: 0,
          max: 99999,
          step: 1,
          precision: 1,
        });
        widthCtrl.signalValueChanged.on(() => onChange());

        heightCtrl = new ENumberControl(makeF("H"), {
          value: "height" in cmd ? cmd.height : 100,
          min: 0,
          max: 99999,
          step: 1,
          precision: 1,
        });
        heightCtrl.signalValueChanged.on(() => onChange());
      }

      if (t === "circle" || t === "arc") {
        radiusCtrl = new ENumberControl(makeF("Radius"), {
          value: "radius" in cmd ? cmd.radius : 50,
          min: 0,
          max: 99999,
          step: 1,
          precision: 1,
        });
        radiusCtrl.signalValueChanged.on(() => onChange());
      }

      if (t === "arc") {
        startAngleCtrl = new ENumberControl(makeF("Start °"), {
          value: "startAngle" in cmd ? cmd.startAngle : 0,
          min: -6.2832,
          max: 6.2832,
          step: 0.01,
          precision: 3,
        });
        startAngleCtrl.signalValueChanged.on(() => onChange());

        endAngleCtrl = new ENumberControl(makeF("End °"), {
          value: "endAngle" in cmd ? cmd.endAngle : Math.PI * 2,
          min: -6.2832,
          max: 6.2832,
          step: 0.01,
          precision: 3,
        });
        endAngleCtrl.signalValueChanged.on(() => onChange());
      }

      if (t === "polyline") {
        makeSectionHeader(fieldsDiv, "Points");
        pointsCtrl = new EArrayControl<[number, number]>(fieldsDiv, pointsTemplate);
        if ("points" in cmd) {
          pointsCtrl.value = cmd.points;
        }
        pointsCtrl.signalValueChanged.on(() => onChange());

        lineWidthCtrl = new ENumberControl(makeF("Line Width"), {
          value: "lineWidth" in cmd ? cmd.lineWidth : 1,
          min: 0.1,
          max: 100,
          step: 0.5,
          precision: 1,
        });
        lineWidthCtrl.signalValueChanged.on(() => onChange());
      }

      colorCtrl = new EColorControl(makeF("Color"), {
        value: "color" in cmd ? cmd.color : "#ffffffff",
      });
      colorCtrl.signalValueChanged.on(() => onChange());
    }

    buildFields(type, value);

    typeSelect.signalValueChanged.on((newType) => {
      type = newType;
      buildFields(newType, defaultDrawCmd(newType));
      onChange();
    });

    function getValue(): EGraphicsDrawCommand {
      switch (type) {
        case "rect":
          return {
            x: xCtrl!.value,
            y: yCtrl!.value,
            width: widthCtrl!.value,
            height: heightCtrl!.value,
            color: colorCtrl!.value,
          };
        case "circle":
          return {
            x: xCtrl!.value,
            y: yCtrl!.value,
            radius: radiusCtrl!.value,
            color: colorCtrl!.value,
          };
        case "arc":
          return {
            x: xCtrl!.value,
            y: yCtrl!.value,
            radius: radiusCtrl!.value,
            startAngle: startAngleCtrl!.value,
            endAngle: endAngleCtrl!.value,
            color: colorCtrl!.value,
          };
        case "polyline":
          return {
            points: pointsCtrl!.value,
            color: colorCtrl!.value,
            lineWidth: lineWidthCtrl!.value,
          };
      }
    }

    return {
      getValue,
      destroy: (): void => {
        pointsCtrl?.destroy();
      },
    };
  },
};

// ─── Card ─────────────────────────────────────────────────────────────────────

export class EGraphicsElementCard {
  private readonly colorControl: EColorControl;
  private readonly resolutionWControl: ENumberControl;
  private readonly resolutionHControl: ENumberControl;
  private readonly drawSequenceControl: EArrayControl<EGraphicsDrawCommand>;

  constructor(
    private readonly container: HTMLElement,
    private readonly uuid: EElementUUID,
  ) {
    const root = document.createElement("div");
    root.className = "element-card";

    const colorRow = makeRow(root, "Color");
    this.colorControl = new EColorControl(colorRow);

    const resRow = makeRow(root, "Resolution");
    const resWLabel = document.createElement("span");
    resWLabel.className = "element-card__label";
    resWLabel.textContent = "W";
    resRow.appendChild(resWLabel);
    this.resolutionWControl = new ENumberControl(resRow, {
      value: 512,
      min: 1,
      max: 4096,
      step: 1,
      precision: 0,
    });
    const resHLabel = document.createElement("span");
    resHLabel.className = "element-card__label";
    resHLabel.textContent = "H";
    resRow.appendChild(resHLabel);
    this.resolutionHControl = new ENumberControl(resRow, {
      value: 512,
      min: 1,
      max: 4096,
      step: 1,
      precision: 0,
    });

    makeSectionHeader(root, "Draw Sequence");
    this.drawSequenceControl = new EArrayControl<EGraphicsDrawCommand>(root, drawCommandTemplate);

    this.container.appendChild(root);

    this.colorControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeGraphics({ uuid: this.uuid, color: next });
    });
    this.resolutionWControl.signalValueChanged.on((next) => {
      const h = this.resolutionHControl.value;
      STORE.commands.elements.writeGraphics({
        uuid: this.uuid,
        resolution: [next, h],
      });
    });
    this.resolutionHControl.signalValueChanged.on((next) => {
      const w = this.resolutionWControl.value;
      STORE.commands.elements.writeGraphics({
        uuid: this.uuid,
        resolution: [w, next],
      });
    });
    this.drawSequenceControl.signalValueChanged.on((next) => {
      STORE.commands.elements.writeGraphics({ uuid: this.uuid, drawSequence: next });
    });

    const initial = STORE.selectors.elements.select(uuid);
    if (initial?.type === EElementType.GRAPHICS) {
      this.refresh(initial);
    }

    STORE.signals.elements.item.on((delta) => {
      if (delta.element.uuid === this.uuid && delta.element.type === EElementType.GRAPHICS) {
        this.refresh(delta.element);
      }
    });
  }

  private refresh(element: EGraphicsElement): void {
    this.colorControl.value = element.color;
    this.resolutionWControl.value = element.resolution[0];
    this.resolutionHControl.value = element.resolution[1];
    this.drawSequenceControl.value = element.drawSequence;
  }
}
