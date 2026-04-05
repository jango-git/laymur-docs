import { STORE } from "../../../document/store";
import { EElementType } from "../../../document/types.elements";

export class EGraphicsElementBuilder {
  private readonly addButton: HTMLButtonElement;

  constructor(container: HTMLElement) {
    this.addButton = document.createElement("button");
    this.addButton.className = "button-primary";
    this.addButton.textContent = "+ Add";
    container.appendChild(this.addButton);

    STORE.currentLayerChanged.on(() => this.updateButton());
    this.updateButton();

    this.addButton.addEventListener("click", () => {
      if (!this.isValid()) {
        return;
      }
      STORE.commands.elements.add(STORE.currentLayerUuid!, {
        uuid: crypto.randomUUID(),
        type: EElementType.GRAPHICS,
        name: "Graphics",
        color: "#ffffffff",
        resolution: [512, 512],
        drawSequence: [],
      });
    });
  }

  private isValid(): boolean {
    return STORE.currentLayerUuid !== null;
  }

  private updateButton(): void {
    this.addButton.disabled = !this.isValid();
  }
}
