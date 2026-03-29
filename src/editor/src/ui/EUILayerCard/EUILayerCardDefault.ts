import type { PolicyDescriptor } from "../../registry/layer-registry";
import { POLICY_REGISTRY, defaultPolicyParams } from "../../registry/layer-registry";
import type { LayerState } from "../../types";
import { EUINumberControl } from "../EUINumberControl/EUINumberControl";
import type { LayerCardCallbacks, LayerCardContext } from "./EUILayerCard";
import { EUILayerCard } from "./EUILayerCard";

export class EUILayerCardDefault extends EUILayerCard {
  private readonly policyParamControls: EUINumberControl[] = [];

  constructor(
    container: HTMLElement,
    layer: LayerState,
    context: LayerCardContext,
    callbacks: LayerCardCallbacks,
  ) {
    super(container, layer, context, callbacks);
    this.renderFields(this.fieldsContainer);
  }

  public override destroy(): void {
    this.destroyPolicyParamControls();
    super.destroy();
  }

  protected renderFields(container: HTMLElement): void {
    this.renderNameRow(container);
    this.renderPolicySection(container);
  }

  private renderNameRow(container: HTMLElement): void {
    const row = document.createElement("div");
    row.className = "layer-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = "Name";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "param-input layer-name-input";
    input.value = this.layer.name;

    input.addEventListener("change", () => {
      const newName = input.value.trim();
      if (!newName) {
        input.value = this.layer.name;
        return;
      }
      if (!this.context.isNameAvailable(newName, this.layer.id)) {
        input.value = this.layer.name;
        return;
      }
      this.layer.name = newName;
      this.callbacks.onConfigUpdate(this.layer);
    });

    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  }

  private renderPolicySection(container: HTMLElement): void {
    const policyRow = document.createElement("div");
    policyRow.className = "layer-field-row";

    const policyLabel = document.createElement("span");
    policyLabel.className = "add-field-label";
    policyLabel.textContent = "Resize Policy";

    const policySelect = document.createElement("select");
    policySelect.className = "param-select";

    for (const def of POLICY_REGISTRY.all()) {
      const option = document.createElement("option");
      option.value = def.type;
      option.textContent = def.label;
      if (def.type === this.layer.policyType) {
        option.selected = true;
      }
      policySelect.appendChild(option);
    }

    policyRow.appendChild(policyLabel);
    policyRow.appendChild(policySelect);
    container.appendChild(policyRow);

    const paramsSection = document.createElement("div");
    paramsSection.className = "layer-policy-params";
    container.appendChild(paramsSection);

    const resizePolicy = POLICY_REGISTRY.get(this.layer.policyType);
    if (!resizePolicy) {
      throw new Error(`Unknown policy type: ${this.layer.policyType}`);
    }

    this.renderPolicyParams(paramsSection, resizePolicy);

    policySelect.addEventListener("change", () => {
      this.layer.policyType = policySelect.value;
      this.layer.policyParams = defaultPolicyParams(this.layer.policyType);
      this.destroyPolicyParamControls();
      paramsSection.innerHTML = "";

      const newResizePolicy = POLICY_REGISTRY.get(this.layer.policyType);
      if (!newResizePolicy) {
        throw new Error(`Unknown policy type: ${this.layer.policyType}`);
      }

      this.renderPolicyParams(paramsSection, newResizePolicy);
      this.callbacks.onConfigUpdate(this.layer);
    });
  }

  private renderPolicyParams(container: HTMLElement, policy: PolicyDescriptor): void {
    for (const paramDef of policy.params) {
      if (!(paramDef.key in this.layer.policyParams)) {
        this.layer.policyParams[paramDef.key] = paramDef.default;
      }

      const row = document.createElement("div");
      row.className = "layer-field-row";

      const label = document.createElement("span");
      label.className = "add-field-label";
      label.textContent = paramDef.label;
      row.appendChild(label);

      const control = new EUINumberControl(row, {
        value: this.layer.policyParams[paramDef.key],
        min: 1,
        step: 1,
      });

      control.signalValueChanged.on((newValue) => {
        this.layer.policyParams[paramDef.key] = newValue;
        this.callbacks.onConfigUpdate(this.layer);
      });

      this.policyParamControls.push(control);
      container.appendChild(row);
    }
  }

  private destroyPolicyParamControls(): void {
    for (const control of this.policyParamControls) {
      control.destroy();
    }
    this.policyParamControls.length = 0;
  }
}
