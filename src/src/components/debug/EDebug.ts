import { EBoolControl } from "../../controls/EBoolControl/EBoolControl";
import { makeRow } from "../../miscellaneous/rows";
import { UI_STATE } from "../../ui-state/EUIState";
import type { EUIDebugState } from "../../ui-state/EUIState.Internal";

type EDebugStateKey = keyof EUIDebugState;

const ITEMS: { key: EDebugStateKey; label: string }[] = [
  { key: "showAspect", label: "Aspect" },
  { key: "showHeight", label: "Height" },
  { key: "showWidth", label: "Width" },
  { key: "showHorizontalDistance", label: "H. Distance" },
  { key: "showHorizontalInterpolation", label: "H. Interpolation" },
  { key: "showVerticalDistance", label: "V. Distance" },
  { key: "showVerticalInterpolation", label: "V. Interpolation" },
];

export class EDebug {
  private readonly controls = new Map<EDebugStateKey, EBoolControl>();

  constructor(container: HTMLElement) {
    const wrapper = document.createElement("div");
    wrapper.className = "debug-toggle";

    const button = document.createElement("button");
    button.className = "button-secondary";
    button.textContent = "Debug";
    wrapper.appendChild(button);

    const popup = document.createElement("div");
    popup.className = "debug-toggle__popup";

    const body = document.createElement("div");
    body.className = "element-card__body";
    popup.appendChild(body);

    const state = UI_STATE.debug;

    for (const { key, label } of ITEMS) {
      const row = makeRow(body, label);

      const control = new EBoolControl(row, { value: state[key] });
      control.signalValueChanged.on((value) => {
        UI_STATE.setDebug({ [key]: value });
      });

      this.controls.set(key, control);
    }

    wrapper.appendChild(popup);
    container.appendChild(wrapper);
  }
}
