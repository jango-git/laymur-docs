import { MathUtils } from "three";
import { EArrayControl } from "../../../../controls/EArrayControl/EArrayControl";
import { EColorControl } from "../../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../../controls/ENumberControl/ENumberControl";
import { ESelectControl } from "../../../../controls/ESelectControl/ESelectControl";
import { EVec2Control } from "../../../../controls/EVec2Control/EVec2Control";
import type { EAnyGraphicsDrawCommand } from "../../../../document/types.misc";
import { EGraphicsDrawCommandType } from "../../../../document/types.misc";
import { DEFAULT_ECOLOR } from "../../../../miscellaneous/defaults";
import { LARGE_VALUE } from "../../../../miscellaneous/math";
import { makeRow, makeSectionHeader } from "../../../../miscellaneous/rows";
import type { EAnyDrawCommandControls } from "./EDrawCommandSubcard.Internal";
import { REGISTRY, pointsTemplate } from "./EDrawCommandSubcard.Internal";

export class EDrawCommandSubcard {
  private controls!: EAnyDrawCommandControls;
  private readonly fieldsDiv: HTMLDivElement;

  constructor(
    container: HTMLElement,
    value: EAnyGraphicsDrawCommand,
    private readonly onChange: () => void,
  ) {
    const selectOptions = Object.values(REGISTRY).map(({ label, default: { type } }) => ({
      label,
      value: type,
    }));
    const typeSelect = new ESelectControl<EGraphicsDrawCommandType>(makeRow(container, "Type"), {
      options: selectOptions,
      value: value.type,
    });
    typeSelect.signalValueChanged.on(this.onTypeSelectChanged);

    this.fieldsDiv = document.createElement("div");
    container.appendChild(this.fieldsDiv);

    this.rebuildFields(value);
  }

  public getValue(): EAnyGraphicsDrawCommand {
    switch (this.controls.type) {
      case EGraphicsDrawCommandType.RECT:
        return {
          type: EGraphicsDrawCommandType.RECT,
          x: this.controls.xy.value[0],
          y: this.controls.xy.value[1],
          width: this.controls.wh.value[0],
          height: this.controls.wh.value[1],
          color: this.controls.color.value,
        };
      case EGraphicsDrawCommandType.CIRCLE:
        return {
          type: EGraphicsDrawCommandType.CIRCLE,
          x: this.controls.xy.value[0],
          y: this.controls.xy.value[1],
          radius: this.controls.radius.value,
          color: this.controls.color.value,
        };
      case EGraphicsDrawCommandType.ARC:
        return {
          type: EGraphicsDrawCommandType.ARC,
          x: this.controls.xy.value[0],
          y: this.controls.xy.value[1],
          radius: this.controls.radius.value,
          startAngle: MathUtils.degToRad(this.controls.fromToAngle.value[0]),
          endAngle: MathUtils.degToRad(this.controls.fromToAngle.value[1]),
          color: this.controls.color.value,
        };
      case EGraphicsDrawCommandType.POLYLINE:
        return {
          type: EGraphicsDrawCommandType.POLYLINE,
          points: this.controls.points.value,
          color: this.controls.color.value,
          lineWidth: this.controls.lineWidth.value,
        };
    }
  }

  public destroy(): void {
    this.destroyPolylinePoints();
  }

  private rebuildFields(command: EAnyGraphicsDrawCommand): void {
    this.destroyPolylinePoints();
    this.fieldsDiv.innerHTML = "";

    switch (command.type) {
      case EGraphicsDrawCommandType.RECT:
        {
          const position = new EVec2Control(makeRow(this.fieldsDiv, "Position"), {
            labels: ["X", "Y"],
            value: [command.x, command.y],
            min: -LARGE_VALUE,
            max: LARGE_VALUE,
            step: 1,
            precision: 1,
          });
          position.signalValueChanged.on(this.onChange);

          const size = new EVec2Control(makeRow(this.fieldsDiv, "Size"), {
            labels: ["W", "H"],
            value: [command.width, command.height],
            min: 2,
            max: LARGE_VALUE,
            step: 1,
            precision: 1,
          });
          size.signalValueChanged.on(this.onChange);

          const color = new EColorControl(makeRow(this.fieldsDiv, "Color"), {
            value: DEFAULT_ECOLOR,
          });
          color.signalValueChanged.on(this.onChange);

          this.controls = { type: EGraphicsDrawCommandType.RECT, xy: position, wh: size, color };
        }
        break;
      case EGraphicsDrawCommandType.CIRCLE:
        {
          const position = new EVec2Control(makeRow(this.fieldsDiv, "Center"), {
            labels: ["X", "Y"],
            value: [command.x, command.y],
            min: -LARGE_VALUE,
            max: LARGE_VALUE,
            step: 1,
            precision: 1,
          });
          position.signalValueChanged.on(this.onChange);

          const radius = new ENumberControl(makeRow(this.fieldsDiv, "Radius"), {
            value: command.radius,
            min: 0,
            max: LARGE_VALUE,
            step: 1,
            precision: 1,
          });
          radius.signalValueChanged.on(this.onChange);

          const color = new EColorControl(makeRow(this.fieldsDiv, "Color"), {
            value: DEFAULT_ECOLOR,
          });
          color.signalValueChanged.on(this.onChange);

          this.controls = { type: EGraphicsDrawCommandType.CIRCLE, xy: position, radius, color };
        }
        break;
      case EGraphicsDrawCommandType.ARC:
        {
          const position = new EVec2Control(makeRow(this.fieldsDiv, "Center"), {
            labels: ["X", "Y"],
            value: [command.x, command.y],
            min: -LARGE_VALUE,
            max: LARGE_VALUE,
            step: 1,
            precision: 1,
          });
          position.signalValueChanged.on(this.onChange);

          const radius = new ENumberControl(makeRow(this.fieldsDiv, "Radius"), {
            value: command.radius,
            min: 0,
            max: LARGE_VALUE,
            step: 1,
            precision: 1,
          });
          radius.signalValueChanged.on(this.onChange);

          const fromToAngle = new EVec2Control(makeRow(this.fieldsDiv, "Angle"), {
            labels: ["From", "To"],
            value: [MathUtils.radToDeg(command.startAngle), MathUtils.radToDeg(command.endAngle)],
            min: -360,
            max: 360,
            step: 1,
            precision: 1,
          });
          fromToAngle.signalValueChanged.on(this.onChange);

          const color = new EColorControl(makeRow(this.fieldsDiv, "Color"), {
            value: DEFAULT_ECOLOR,
          });
          color.signalValueChanged.on(this.onChange);

          this.controls = {
            type: EGraphicsDrawCommandType.ARC,
            xy: position,
            radius,
            fromToAngle,
            color,
          };
        }
        break;
      case EGraphicsDrawCommandType.POLYLINE:
        {
          const lineWidth = new ENumberControl(makeRow(this.fieldsDiv, "Line Width"), {
            value: command.lineWidth,
            min: 0.1,
            max: 100,
            step: 0.5,
            precision: 1,
          });
          lineWidth.signalValueChanged.on(this.onChange);

          const color = new EColorControl(makeRow(this.fieldsDiv, "Color"), {
            value: DEFAULT_ECOLOR,
          });
          color.signalValueChanged.on(this.onChange);

          makeSectionHeader(this.fieldsDiv, "Points");
          const points = new EArrayControl<[number, number]>(this.fieldsDiv, pointsTemplate);
          points.value = command.points;
          points.signalValueChanged.on(this.onChange);

          this.controls = { type: EGraphicsDrawCommandType.POLYLINE, points, lineWidth, color };
        }
        break;
    }
  }

  private destroyPolylinePoints(): void {
    const controls = this.controls as EAnyDrawCommandControls | undefined;
    if (controls?.type === EGraphicsDrawCommandType.POLYLINE) {
      controls.points.destroy();
    }
  }

  private readonly onTypeSelectChanged = (newType: EGraphicsDrawCommandType): void => {
    this.rebuildFields(REGISTRY[newType].default);
    this.onChange();
  };
}
