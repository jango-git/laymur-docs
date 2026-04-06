import type {
  EArrayControlItem,
  EArrayControlTemplate,
} from "../../../controls/EArrayControl/EArrayControl";
import { EArrayControl } from "../../../controls/EArrayControl/EArrayControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { EVec2Control } from "../../../controls/EVec2Control/EVec2Control";
import type { EAnyGraphicsDrawCommand } from "../../../document/types.misc";
import { EGraphicsDrawCommandType } from "../../../document/types.misc";
import { makeRow, makeSectionHeader } from "../../../utils/rows";

const REGISTRY: Record<
  EGraphicsDrawCommandType,
  { label: string; default: EAnyGraphicsDrawCommand }
> = {
  [EGraphicsDrawCommandType.ARC]: {
    label: "Arc",
    default: {
      type: EGraphicsDrawCommandType.ARC,
      x: 0,
      y: 0,
      radius: 50,
      startAngle: 0,
      endAngle: Math.PI * 2,
      color: "#ffffffff",
    },
  },
  [EGraphicsDrawCommandType.CIRCLE]: {
    label: "Circle",
    default: { type: EGraphicsDrawCommandType.CIRCLE, x: 0, y: 0, radius: 50, color: "#ffffffff" },
  },
  [EGraphicsDrawCommandType.POLYLINE]: {
    label: "Polyline",
    default: {
      type: EGraphicsDrawCommandType.POLYLINE,
      points: [],
      color: "#ffffffff",
      lineWidth: 1,
    },
  },
  [EGraphicsDrawCommandType.RECT]: {
    label: "Rect",
    default: {
      type: EGraphicsDrawCommandType.RECT,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      color: "#ffffffff",
    },
  },
};

const pointsTemplate: EArrayControlTemplate<[number, number]> = {
  createDefault: () => [0, 0],
  buildItem(container, [px, py]: [number, number], onChange): EArrayControlItem<[number, number]> {
    const control = new EVec2Control(container, {
      labels: ["X", "Y"],
      min: -2048,
      max: 2048,
      step: 1,
      precision: 1,
      value: [px, py],
    });

    control.signalValueChanged.on(onChange);
    return { getValue: (): [number, number] => control.value, destroy: (): void => {} };
  },
};

export const drawCommandTemplate: EArrayControlTemplate<EAnyGraphicsDrawCommand> = {
  createDefault: () => REGISTRY[EGraphicsDrawCommandType.RECT].default,
  buildItem(container, value, onChange): EArrayControlItem<EAnyGraphicsDrawCommand> {
    let type = value.type;

    const typeRow = makeRow(container, "Type");
    const typeSelect = new ESelectControl<EGraphicsDrawCommandType>(typeRow, {
      options: Object.values(REGISTRY).map(({ label, default: { type } }) => ({
        label,
        value: type,
      })),
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

    function buildFields(t: EGraphicsDrawCommandType, cmd: EAnyGraphicsDrawCommand): void {
      pointsCtrl?.destroy();
      fieldsDiv.innerHTML = "";
      xCtrl = yCtrl = widthCtrl = heightCtrl = undefined;
      radiusCtrl = startAngleCtrl = endAngleCtrl = undefined;
      pointsCtrl = lineWidthCtrl = colorCtrl = undefined;

      if (t !== EGraphicsDrawCommandType.POLYLINE) {
        xCtrl = new ENumberControl(makeRow(fieldsDiv, "X"), {
          value: "x" in cmd ? cmd.x : 0,
          min: -99999,
          max: 99999,
          step: 1,
          precision: 1,
        });
        xCtrl.signalValueChanged.on(() => onChange());

        yCtrl = new ENumberControl(makeRow(fieldsDiv, "Y"), {
          value: "y" in cmd ? cmd.y : 0,
          min: -99999,
          max: 99999,
          step: 1,
          precision: 1,
        });
        yCtrl.signalValueChanged.on(() => onChange());
      }

      if (t === EGraphicsDrawCommandType.RECT) {
        widthCtrl = new ENumberControl(makeRow(fieldsDiv, "W"), {
          value: "width" in cmd ? cmd.width : 100,
          min: 0,
          max: 99999,
          step: 1,
          precision: 1,
        });
        widthCtrl.signalValueChanged.on(() => onChange());

        heightCtrl = new ENumberControl(makeRow(fieldsDiv, "H"), {
          value: "height" in cmd ? cmd.height : 100,
          min: 0,
          max: 99999,
          step: 1,
          precision: 1,
        });
        heightCtrl.signalValueChanged.on(() => onChange());
      }

      if (t === EGraphicsDrawCommandType.CIRCLE || t === EGraphicsDrawCommandType.ARC) {
        radiusCtrl = new ENumberControl(makeRow(fieldsDiv, "Radius"), {
          value: "radius" in cmd ? cmd.radius : 50,
          min: 0,
          max: 99999,
          step: 1,
          precision: 1,
        });
        radiusCtrl.signalValueChanged.on(() => onChange());
      }

      if (t === EGraphicsDrawCommandType.ARC) {
        startAngleCtrl = new ENumberControl(makeRow(fieldsDiv, "Start °"), {
          value: "startAngle" in cmd ? cmd.startAngle : 0,
          min: -6.2832,
          max: 6.2832,
          step: 0.01,
          precision: 3,
        });
        startAngleCtrl.signalValueChanged.on(() => onChange());

        endAngleCtrl = new ENumberControl(makeRow(fieldsDiv, "End °"), {
          value: "endAngle" in cmd ? cmd.endAngle : Math.PI * 2,
          min: -6.2832,
          max: 6.2832,
          step: 0.01,
          precision: 3,
        });
        endAngleCtrl.signalValueChanged.on(() => onChange());
      }

      if (t === EGraphicsDrawCommandType.POLYLINE) {
        makeSectionHeader(fieldsDiv, "Points");
        pointsCtrl = new EArrayControl<[number, number]>(fieldsDiv, pointsTemplate);
        if ("points" in cmd) {
          pointsCtrl.value = cmd.points;
        }
        pointsCtrl.signalValueChanged.on(() => onChange());

        lineWidthCtrl = new ENumberControl(makeRow(fieldsDiv, "Line Width"), {
          value: "lineWidth" in cmd ? cmd.lineWidth : 1,
          min: 0.1,
          max: 100,
          step: 0.5,
          precision: 1,
        });
        lineWidthCtrl.signalValueChanged.on(() => onChange());
      }

      colorCtrl = new EColorControl(makeRow(fieldsDiv, "Color"), {
        value: "color" in cmd ? cmd.color : "#ffffffff",
      });
      colorCtrl.signalValueChanged.on(() => onChange());
    }

    buildFields(type, value);

    typeSelect.signalValueChanged.on((newType) => {
      type = newType;
      buildFields(newType, REGISTRY[newType].default);
      onChange();
    });

    function getValue(): EAnyGraphicsDrawCommand {
      switch (type) {
        case EGraphicsDrawCommandType.RECT:
          return {
            type: EGraphicsDrawCommandType.RECT,
            x: xCtrl!.value,
            y: yCtrl!.value,
            width: widthCtrl!.value,
            height: heightCtrl!.value,
            color: colorCtrl!.value,
          };
        case EGraphicsDrawCommandType.CIRCLE:
          return {
            type: EGraphicsDrawCommandType.CIRCLE,
            x: xCtrl!.value,
            y: yCtrl!.value,
            radius: radiusCtrl!.value,
            color: colorCtrl!.value,
          };
        case EGraphicsDrawCommandType.ARC:
          return {
            type: EGraphicsDrawCommandType.ARC,
            x: xCtrl!.value,
            y: yCtrl!.value,
            radius: radiusCtrl!.value,
            startAngle: startAngleCtrl!.value,
            endAngle: endAngleCtrl!.value,
            color: colorCtrl!.value,
          };
        case EGraphicsDrawCommandType.POLYLINE:
          return {
            type: EGraphicsDrawCommandType.POLYLINE,
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
