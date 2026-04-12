import { EArrayControl } from "../../../../controls/EArrayControl/EArrayControl";
import { EColorControl } from "../../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../../controls/ENumberControl/ENumberControl";
import { ESelectControl } from "../../../../controls/ESelectControl/ESelectControl";
import { EVec2Control } from "../../../../controls/EVec2Control/EVec2Control";
import type { EAnyGraphicsDrawCommand } from "../../../../document/types.misc";
import { EGraphicsDrawCommandType } from "../../../../document/types.misc";
import { makeRow, makeSectionHeader } from "../../../../utils/rows";
import type { EAnyDrawCommandControls } from "./EDrawCommandSubcard.Internal";
import { REGISTRY, pointsTemplate } from "./EDrawCommandSubcard.Internal";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export class EDrawCommandSubcard {
  private type: EGraphicsDrawCommandType;
  private controls!: EAnyDrawCommandControls;
  private readonly fieldsDiv: HTMLDivElement;

  constructor(
    container: HTMLElement,
    value: EAnyGraphicsDrawCommand,
    private readonly onChange: () => void,
  ) {
    this.type = value.type;

    const typeRow = makeRow(container, "Type");
    const typeSelect = new ESelectControl<EGraphicsDrawCommandType>(typeRow, {
      options: Object.values(REGISTRY).map(({ label, default: { type } }) => ({
        label,
        value: type,
      })),
      value: this.type,
    });

    this.fieldsDiv = document.createElement("div");
    container.appendChild(this.fieldsDiv);

    this.buildFields(value.type, value);

    typeSelect.signalValueChanged.on((newType) => {
      this.type = newType;
      this.buildFields(newType, REGISTRY[newType].default);
      this.onChange();
    });
  }

  public getValue(): EAnyGraphicsDrawCommand {
    const controls = this.controls;
    switch (controls.type) {
      case EGraphicsDrawCommandType.RECT:
        return {
          type: EGraphicsDrawCommandType.RECT,
          x: controls.xy.value[0],
          y: controls.xy.value[1],
          width: controls.wh.value[0],
          height: controls.wh.value[1],
          color: controls.color.value,
        };
      case EGraphicsDrawCommandType.CIRCLE:
        return {
          type: EGraphicsDrawCommandType.CIRCLE,
          x: controls.xy.value[0],
          y: controls.xy.value[1],
          radius: controls.radius.value,
          color: controls.color.value,
        };
      case EGraphicsDrawCommandType.ARC:
        return {
          type: EGraphicsDrawCommandType.ARC,
          x: controls.xy.value[0],
          y: controls.xy.value[1],
          radius: controls.radius.value,
          startAngle: controls.fromToAngle.value[0] * DEG_TO_RAD,
          endAngle: controls.fromToAngle.value[1] * DEG_TO_RAD,
          color: controls.color.value,
        };
      case EGraphicsDrawCommandType.POLYLINE:
        return {
          type: EGraphicsDrawCommandType.POLYLINE,
          points: controls.points.value,
          color: controls.color.value,
          lineWidth: controls.lineWidth.value,
        };
    }
  }

  public destroy(): void {
    if (this.controls?.type === EGraphicsDrawCommandType.POLYLINE) {
      this.controls.points.destroy();
    }
  }

  private buildFields(type: EGraphicsDrawCommandType, command: EAnyGraphicsDrawCommand): void {
    if (this.controls?.type === EGraphicsDrawCommandType.POLYLINE) {
      this.controls.points.destroy();
    }
    this.fieldsDiv.innerHTML = "";

    if (type === EGraphicsDrawCommandType.RECT) {
      const position = new EVec2Control(makeRow(this.fieldsDiv, "Position"), {
        labels: ["X", "Y"],
        value: ["x" in command ? command.x : 0, "y" in command ? command.y : 0],
        min: -99999,
        max: 99999,
        step: 1,
        precision: 1,
      });
      position.signalValueChanged.on(this.onChange);

      const size = new EVec2Control(makeRow(this.fieldsDiv, "Size"), {
        labels: ["W", "H"],
        value: [
          "width" in command ? command.width : 100,
          "height" in command ? command.height : 100,
        ],
        min: 0,
        max: 99999,
        step: 1,
        precision: 1,
      });
      size.signalValueChanged.on(this.onChange);

      const color = new EColorControl(makeRow(this.fieldsDiv, "Color"), {
        value: "color" in command ? command.color : { color: "#ffffff", alpha: 255 },
      });
      color.signalValueChanged.on(this.onChange);

      this.controls = { type: EGraphicsDrawCommandType.RECT, xy: position, wh: size, color };
    } else if (type === EGraphicsDrawCommandType.CIRCLE) {
      const position = new EVec2Control(makeRow(this.fieldsDiv, "Center"), {
        labels: ["X", "Y"],
        value: ["x" in command ? command.x : 0, "y" in command ? command.y : 0],
        min: -99999,
        max: 99999,
        step: 1,
        precision: 1,
      });
      position.signalValueChanged.on(this.onChange);

      const radius = new ENumberControl(makeRow(this.fieldsDiv, "Radius"), {
        value: "radius" in command ? command.radius : 50,
        min: 0,
        max: 99999,
        step: 1,
        precision: 1,
      });
      radius.signalValueChanged.on(this.onChange);

      const color = new EColorControl(makeRow(this.fieldsDiv, "Color"), {
        value: "color" in command ? command.color : { color: "#ffffff", alpha: 255 },
      });
      color.signalValueChanged.on(this.onChange);

      this.controls = { type: EGraphicsDrawCommandType.CIRCLE, xy: position, radius, color };
    } else if (type === EGraphicsDrawCommandType.ARC) {
      const position = new EVec2Control(makeRow(this.fieldsDiv, "Center"), {
        labels: ["X", "Y"],
        value: ["x" in command ? command.x : 0, "y" in command ? command.y : 0],
        min: -99999,
        max: 99999,
        step: 1,
        precision: 1,
      });
      position.signalValueChanged.on(this.onChange);

      const radius = new ENumberControl(makeRow(this.fieldsDiv, "Radius"), {
        value: "radius" in command ? command.radius : 50,
        min: 0,
        max: 99999,
        step: 1,
        precision: 1,
      });
      radius.signalValueChanged.on(this.onChange);

      const fromToAngle = new EVec2Control(makeRow(this.fieldsDiv, "Angle"), {
        labels: ["From", "To"],
        value: [
          "startAngle" in command ? command.startAngle * RAD_TO_DEG : 0,
          "endAngle" in command ? command.endAngle * RAD_TO_DEG : 360,
        ],
        min: -360,
        max: 360,
        step: 1,
        precision: 1,
      });
      fromToAngle.signalValueChanged.on(this.onChange);

      const color = new EColorControl(makeRow(this.fieldsDiv, "Color"), {
        value: "color" in command ? command.color : { color: "#ffffff", alpha: 255 },
      });
      color.signalValueChanged.on(this.onChange);

      this.controls = {
        type: EGraphicsDrawCommandType.ARC,
        xy: position,
        radius,
        fromToAngle,
        color,
      };
    } else {
      const lineWidth = new ENumberControl(makeRow(this.fieldsDiv, "Line Width"), {
        value: "lineWidth" in command ? command.lineWidth : 1,
        min: 0.1,
        max: 100,
        step: 0.5,
        precision: 1,
      });
      lineWidth.signalValueChanged.on(this.onChange);

      const color = new EColorControl(makeRow(this.fieldsDiv, "Color"), {
        value: "color" in command ? command.color : { color: "#ffffff", alpha: 255 },
      });
      color.signalValueChanged.on(this.onChange);

      makeSectionHeader(this.fieldsDiv, "Points");
      const points = new EArrayControl<[number, number]>(this.fieldsDiv, pointsTemplate);
      if ("points" in command) {
        points.value = command.points;
      }
      points.signalValueChanged.on(this.onChange);

      this.controls = { type: EGraphicsDrawCommandType.POLYLINE, points, lineWidth, color };
    }
  }
}
