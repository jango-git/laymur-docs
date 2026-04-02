import type { FerrsignView0, FerrsignView2 } from "ferrsign";
import { Ferrsign0, Ferrsign2 } from "ferrsign";
import { EStringControl } from "../../controls/EStringControl/EStringControl";
import { ECard } from "../ECard";

export interface ELayerCardContext {
  validateName(name: string): string | null;
}

export abstract class ELayerCard<TModel extends { name: string }> extends ECard<TModel> {
  protected readonly signalModelChangedInternal = new Ferrsign2<TModel, TModel>();
  private readonly signalActivatedInternal = new Ferrsign0();
  private readonly nameControl: EStringControl;

  constructor(
    container: HTMLElement,
    model: TModel,
    typeLabel: string,
    context: ELayerCardContext,
  ) {
    super(container, model);
    this.root.classList.add("card--layer");

    const indicator = document.createElement("span");
    indicator.className = "card__select-indicator";
    indicator.setAttribute("aria-hidden", "true");
    this.header.appendChild(indicator);

    const label = document.createElement("span");
    label.className = "card__type-label";
    label.textContent = typeLabel;
    this.header.appendChild(label);

    const nameWrap = document.createElement("div");
    nameWrap.className = "card__header-name";
    nameWrap.addEventListener("click", (e) => e.stopPropagation());
    this.header.appendChild(nameWrap);

    this.nameControl = new EStringControl(nameWrap, { value: model.name });

    let reverting = false;
    this.nameControl.signalValueChanged.on((newName, prevName) => {
      if (reverting) {
        return;
      }
      const error = context.validateName(newName);
      if (error !== null) {
        reverting = true;
        this.nameControl.value = prevName;
        reverting = false;
        this.nameControl.flash();
        return;
      }
      const previous = { ...this.model };
      this.model = { ...this.model, name: newName };
      this.signalModelChangedInternal.emit(this.model, previous);
    });

    this.appendDragHandle();
    this.appendDeleteButton();

    this.header.addEventListener("click", this.handleHeaderClick);
  }

  public get signalModelChanged(): FerrsignView2<TModel, TModel> {
    return this.signalModelChangedInternal;
  }

  public get signalActivated(): FerrsignView0 {
    return this.signalActivatedInternal;
  }

  public deactivate(): void {
    delete this.root.dataset.active;
  }

  public override destroy(): void {
    this.nameControl.destroy();
    this.header.removeEventListener("click", this.handleHeaderClick);
    super.destroy();
  }

  private readonly handleHeaderClick = (): void => {
    this.root.dataset.active = "true";
    this.signalActivatedInternal.emit();
  };
}
