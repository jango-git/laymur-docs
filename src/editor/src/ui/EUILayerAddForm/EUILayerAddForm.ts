import type { PolicyParamDescriptor } from "../../registry/layer-registry";
import { POLICY_REGISTRY, defaultPolicyParams } from "../../registry/layer-registry";
import { EUINumberControl } from "../EUINumberControl/EUINumberControl";

export interface EUILayerAddFormCallbackPack {
  onLayerAdded: (data: {
    name: string;
    policyType: string;
    policyParameters: Record<string, number>;
  }) => unknown;
  isNameAvailable: (name: string) => boolean;
}

export class EUILayerAddForm {
  private readonly nameInput: HTMLInputElement;
  private readonly policySelect: HTMLSelectElement;
  private readonly addButton: HTMLButtonElement;
  private readonly paramsSection: HTMLElement;
  private numberControls: EUINumberControl[] = [];
  private policyParams: Record<string, number> = {};

  constructor(
    container: HTMLElement,
    private readonly callbacks: EUILayerAddFormCallbackPack,
  ) {
    container.innerHTML = "";

    const nameRow = document.createElement("div");
    nameRow.className = "layer-field-row";
    const nameLabel = document.createElement("span");
    nameLabel.className = "add-field-label";
    nameLabel.textContent = "Name";
    this.nameInput = document.createElement("input");
    this.nameInput.type = "text";
    this.nameInput.className = "param-input";
    this.nameInput.placeholder = "Layer name";
    nameRow.appendChild(nameLabel);
    nameRow.appendChild(this.nameInput);
    container.appendChild(nameRow);

    const policyRow = document.createElement("div");
    policyRow.className = "layer-field-row";
    const policyLabel = document.createElement("span");
    policyLabel.className = "add-field-label";
    policyLabel.textContent = "Resize Policy";
    this.policySelect = document.createElement("select");
    this.policySelect.className = "param-select";
    for (const def of POLICY_REGISTRY.all()) {
      const opt = document.createElement("option");
      opt.value = def.type;
      opt.textContent = def.label;
      this.policySelect.appendChild(opt);
    }
    policyRow.appendChild(policyLabel);
    policyRow.appendChild(this.policySelect);
    container.appendChild(policyRow);

    this.paramsSection = document.createElement("div");
    this.paramsSection.className = "layer-policy-params";
    container.appendChild(this.paramsSection);

    this.addButton = document.createElement("button");
    this.addButton.className = "button-primary button-full";
    this.addButton.textContent = "+ Add Layer";
    this.addButton.disabled = true;
    container.appendChild(this.addButton);

    this.policyParams = defaultPolicyParams(this.policySelect.value);
    this.renderPolicyParameters();

    this.policySelect.addEventListener("change", () => {
      this.policyParams = defaultPolicyParams(this.policySelect.value);
      this.renderPolicyParameters();
      this.syncButton();
    });

    this.nameInput.addEventListener("input", () => this.syncButton());
    this.addButton.addEventListener("click", () => this.handleAdd());
  }

  public destroy(): void {
    this.destroyNumberControls();
  }

  private renderPolicyParameters(): void {
    this.destroyNumberControls();
    this.paramsSection.innerHTML = "";

    const paramDefs = POLICY_REGISTRY.get(this.policySelect.value)?.params ?? [];
    for (const paramDef of paramDefs) {
      this.paramsSection.appendChild(this.buildParametersRow(paramDef));
    }
  }

  private buildParametersRow(paramDef: PolicyParamDescriptor): HTMLElement {
    const row = document.createElement("div");
    row.className = "layer-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = paramDef.label;

    const initialValue = this.policyParams[paramDef.key] ?? paramDef.default;
    this.policyParams[paramDef.key] = initialValue;

    const control = new EUINumberControl(row, { value: initialValue, min: 0 });

    control.signalValueChanged.on((v) => {
      this.policyParams[paramDef.key] = v;
    });

    this.numberControls.push(control);
    row.insertBefore(label, row.firstChild);
    return row;
  }

  private handleAdd(): void {
    const name = this.nameInput.value.trim();
    if (!name || !this.callbacks.isNameAvailable(name)) {
      return;
    }

    this.callbacks.onLayerAdded({
      name,
      policyType: this.policySelect.value,
      policyParameters: { ...this.policyParams },
    });
  }

  private syncButton(): void {
    const name = this.nameInput.value.trim();
    this.addButton.disabled = !name || !this.callbacks.isNameAvailable(name);
  }

  private destroyNumberControls(): void {
    for (const control of this.numberControls) {
      control.destroy();
    }
    this.numberControls = [];
  }
}
