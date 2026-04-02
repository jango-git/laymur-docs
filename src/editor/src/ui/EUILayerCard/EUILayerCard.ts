import { ENumberControl } from "../../Controls/ENumberControl/ENumberControl";
import type { PolicyDescriptor } from "../../registry/layer-registry";
import { defaultPolicyParams, POLICY_REGISTRY } from "../../registry/layer-registry";
import type { LayerState } from "../../types";

export interface LayerCardCallbacks {
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  onConfigUpdate: (layer: LayerState) => void;
}

export interface LayerCardContext {
  isActive: boolean;
  canDelete: boolean;
  isNameAvailable: (name: string, excludeLayerId: string) => boolean;
}

export class EUILayerCard {
  private readonly layer: LayerState;
  private readonly callbacks: LayerCardCallbacks;
  private readonly context: LayerCardContext;
  private readonly root: HTMLDivElement;
  private readonly fieldsContainer: HTMLDivElement;
  private readonly policyParamControls: ENumberControl[] = [];

  constructor(
    container: HTMLElement,
    layer: LayerState,
    context: LayerCardContext,
    callbacks: LayerCardCallbacks,
  ) {
    this.layer = layer;
    this.callbacks = callbacks;
    this.context = context;

    this.root = document.createElement("div");
    this.root.className = "layer-card";
    if (context.isActive) {
      this.root.classList.add("layer-card-active");
    }
    this.root.draggable = true;

    this.root.appendChild(this.buildHeader());

    this.fieldsContainer = document.createElement("div");
    this.fieldsContainer.className = "layer-card-fields";
    this.root.appendChild(this.fieldsContainer);

    this.renderFields(this.fieldsContainer);

    container.appendChild(this.root);
  }

  public destroy(): void {
    this.destroyPolicyParamControls();
    this.root.remove();
  }

  private buildHeader(): HTMLElement {
    const header = document.createElement("div");
    header.className = "layer-card-header";

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "⠿";

    const activateButton = document.createElement("button");
    activateButton.className = "layer-activate-btn" + (this.context.isActive ? " is-active" : "");
    activateButton.title = this.context.isActive ? "Active layer" : "Set as active layer";
    activateButton.disabled = this.context.isActive;
    activateButton.addEventListener("click", () => {
      this.callbacks.onActivate(this.layer.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "button-icon button-delete";
    deleteButton.textContent = "✕";
    deleteButton.title = "Remove layer";
    deleteButton.disabled = !this.context.canDelete;
    deleteButton.addEventListener("click", () => {
      this.callbacks.onDelete(this.layer.id);
    });

    const typeLabel = document.createElement("span");
    typeLabel.className = "layer-card-type-label";
    typeLabel.textContent = "UIFullscreenLayer";

    header.appendChild(dragHandle);
    header.appendChild(activateButton);
    header.appendChild(typeLabel);
    header.appendChild(deleteButton);

    return header;
  }

  private renderFields(container: HTMLElement): void {
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
      if (newName.length === 0) {
        input.value = this.layer.name;
        return;
      }
      if (!this.context.isNameAvailable(newName, this.layer.id)) {
        input.value = this.layer.name;
        return;
      }
      console.debug(
        "[EUILayerCard] name: %s → %s (id=%s)",
        this.layer.name,
        newName,
        this.layer.id,
      );
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

    for (const definition of POLICY_REGISTRY.all()) {
      const option = document.createElement("option");
      option.value = definition.type;
      option.textContent = definition.label;
      if (definition.type === this.layer.policyType) {
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

    const initialPolicy = POLICY_REGISTRY.get(this.layer.policyType);
    if (initialPolicy === undefined) {
      throw new Error(`EUILayerCard: unknown policy type "${this.layer.policyType}"`);
    }

    this.renderPolicyParams(paramsSection, initialPolicy);

    policySelect.addEventListener("change", () => {
      console.debug(
        "[EUILayerCard] policy: %s → %s (id=%s)",
        this.layer.policyType,
        policySelect.value,
        this.layer.id,
      );
      this.layer.policyType = policySelect.value;
      this.layer.policyParams = defaultPolicyParams(this.layer.policyType);
      this.destroyPolicyParamControls();
      paramsSection.innerHTML = "";

      const newPolicy = POLICY_REGISTRY.get(this.layer.policyType);
      if (newPolicy === undefined) {
        throw new Error(`EUILayerCard: unknown policy type "${this.layer.policyType}"`);
      }

      this.renderPolicyParams(paramsSection, newPolicy);
      this.callbacks.onConfigUpdate(this.layer);
    });
  }

  private renderPolicyParams(container: HTMLElement, policy: PolicyDescriptor): void {
    for (const paramDefinition of policy.params) {
      if (!(paramDefinition.key in this.layer.policyParams)) {
        this.layer.policyParams[paramDefinition.key] = paramDefinition.default;
      }

      const row = document.createElement("div");
      row.className = "layer-field-row";

      const label = document.createElement("span");
      label.className = "add-field-label";
      label.textContent = paramDefinition.label;
      row.appendChild(label);

      const control = new ENumberControl(row, {
        value: this.layer.policyParams[paramDefinition.key],
        min: 1,
        step: 1,
      });

      control.signalValueChanged.on((newValue) => {
        this.layer.policyParams[paramDefinition.key] = newValue;
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
