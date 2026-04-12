import type {
  EArrayControl,
  EArrayControlItem,
  EArrayControlTemplate,
} from "../../../../controls/EArrayControl/EArrayControl";
import type { EColorControl } from "../../../../controls/EColorControl/EColorControl";
import type { ENumberControl } from "../../../../controls/ENumberControl/ENumberControl";
import { EVec2Control } from "../../../../controls/EVec2Control/EVec2Control";
import type { EAnyGraphicsDrawCommand } from "../../../../document/types.misc";
import { EGraphicsDrawCommandType } from "../../../../document/types.misc";
import { EDrawCommandSubcard } from "./EDrawCommandSubcard";

export interface EDrawCommandControlsArc {
  type: EGraphicsDrawCommandType.ARC;
  xy: EVec2Control;
  fromToAngle: EVec2Control;
  radius: ENumberControl;
  color: EColorControl;
}

export interface EDrawCommandControlsCircle {
  type: EGraphicsDrawCommandType.CIRCLE;
  xy: EVec2Control;
  radius: ENumberControl;
  color: EColorControl;
}

export interface EDrawCommandControlsPolyline {
  type: EGraphicsDrawCommandType.POLYLINE;
  points: EArrayControl<[number, number]>;
  color: EColorControl;
  lineWidth: ENumberControl;
}

export interface EDrawCommandControlsRect {
  type: EGraphicsDrawCommandType.RECT;
  xy: EVec2Control;
  wh: EVec2Control;
  color: EColorControl;
}

export type EAnyDrawCommandControls =
  | EDrawCommandControlsArc
  | EDrawCommandControlsCircle
  | EDrawCommandControlsPolyline
  | EDrawCommandControlsRect;

export const REGISTRY: Record<
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
      color: { color: "#ffffff", alpha: 255 },
    },
  },
  [EGraphicsDrawCommandType.CIRCLE]: {
    label: "Circle",
    default: {
      type: EGraphicsDrawCommandType.CIRCLE,
      x: 0,
      y: 0,
      radius: 50,
      color: { color: "#ffffff", alpha: 255 },
    },
  },
  [EGraphicsDrawCommandType.POLYLINE]: {
    label: "Polyline",
    default: {
      type: EGraphicsDrawCommandType.POLYLINE,
      points: [],
      color: { color: "#ffffff", alpha: 255 },
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
      color: { color: "#ffffff", alpha: 255 },
    },
  },
};

export const pointsTemplate: EArrayControlTemplate<[number, number]> = {
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
    const subcard = new EDrawCommandSubcard(container, value, onChange);
    return {
      getValue: () => subcard.getValue(),
      destroy: () => subcard.destroy(),
    };
  },
};
