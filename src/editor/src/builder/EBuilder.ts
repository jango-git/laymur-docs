import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";
import { ESelectControl } from "../controls/ESelectControl/ESelectControl";

export interface EBuilderForm<TModel> {
  getModel(): TModel;
  reset(): void;
  destroy(): void;
}

export interface EBuilderTypeSpec<TType, TModel> {
  label: string;
  value: TType;
  buildForm(container: HTMLElement, onChange: () => void): EBuilderForm<TModel>;
}

export class EBuilder<TType, TModel> {
  private readonly root: HTMLDivElement;
  private readonly formContainer: HTMLDivElement;
  private readonly addButton: HTMLButtonElement;
  private readonly errorDiv: HTMLDivElement;

  private readonly typeControl: ESelectControl<TType>;
  private currentType: TType;
  private currentForm: EBuilderForm<TModel>;

  private readonly validate: (type: TType, model: TModel) => string | null;

  private readonly signalAddRequestedInternal = new Ferrsign2<
    { type: TType; model: TModel },
    undefined
  >();

  constructor(
    container: HTMLElement,
    types: EBuilderTypeSpec<TType, TModel>[],
    validate: (type: TType, model: TModel) => string | null,
  ) {
    this.validate = validate;

    this.root = document.createElement("div");
    this.root.className = "builder";

    const typeRow = document.createElement("div");
    typeRow.className = "builder__type-row";

    const typeLabel = document.createElement("span");
    typeLabel.className = "builder__type-label";
    typeLabel.textContent = "Type";
    typeRow.appendChild(typeLabel);

    const typeControlContainer = document.createElement("div");
    typeControlContainer.className = "builder__type-control";
    typeRow.appendChild(typeControlContainer);

    this.typeControl = new ESelectControl<TType>(typeControlContainer, {
      options: types.map((t) => ({ label: t.label, value: t.value })),
      value: types[0].value,
    });

    this.root.appendChild(typeRow);

    this.formContainer = document.createElement("div");
    this.formContainer.className = "builder__form";
    this.root.appendChild(this.formContainer);

    this.addButton = document.createElement("button");
    this.addButton.className = "builder__add-btn";
    this.addButton.textContent = "Add";
    this.addButton.disabled = true;
    this.addButton.addEventListener("click", this.handleAdd);
    this.root.appendChild(this.addButton);

    this.errorDiv = document.createElement("div");
    this.errorDiv.className = "builder__error";
    this.root.appendChild(this.errorDiv);

    container.appendChild(this.root);

    this.currentType = types[0].value;
    this.currentForm = types[0].buildForm(this.formContainer, () => this.revalidate());
    this.revalidate();

    this.typeControl.signalValueChanged.on((type) => {
      this.currentForm.destroy();
      this.formContainer.innerHTML = "";
      this.currentType = type;
      const spec = types.find((t) => t.value === type);
      if (!spec) {
        throw new Error(`No type spec found for type ${type}`);
      }
      this.currentForm = spec.buildForm(this.formContainer, () => this.revalidate());
      this.revalidate();
    });
  }

  public get signalAddRequested(): FerrsignView2<{ type: TType; model: TModel }, undefined> {
    return this.signalAddRequestedInternal;
  }

  public destroy(): void {
    this.typeControl.destroy();
    this.currentForm.destroy();
    this.root.remove();
  }

  private revalidate(): void {
    const error = this.validate(this.currentType, this.currentForm.getModel());
    this.addButton.disabled = error !== null;
    this.errorDiv.textContent = error ?? "";
  }

  private readonly handleAdd = (): void => {
    this.signalAddRequestedInternal.emit(
      { type: this.currentType, model: this.currentForm.getModel() },
      undefined,
    );
    this.currentForm.reset();
    this.revalidate();
  };
}
