import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";
import { EStringControl } from "../../controls/EStringControl/EStringControl";
import { ECard } from "../ECard";

export interface EElementCardContext {
  validateName(name: string): string | null;
}

export abstract class EElementCard<TModel extends { name: string }> extends ECard<TModel> {
  protected readonly signalModelChangedInternal = new Ferrsign2<TModel, TModel>();
  private readonly nameControl: EStringControl;

  constructor(
    container: HTMLElement,
    model: TModel,
    typeLabel: string,
    context: EElementCardContext,
  ) {
    super(container, model);
    this.root.classList.add("card--element");

    const label = document.createElement("span");
    label.className = "card__type-label";
    label.textContent = typeLabel;
    this.header.appendChild(label);

    const nameWrap = document.createElement("div");
    nameWrap.className = "card__header-name";
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
  }

  public get signalModelChanged(): FerrsignView2<TModel, TModel> {
    return this.signalModelChangedInternal;
  }

  public override destroy(): void {
    this.nameControl.destroy();
    super.destroy();
  }
}
