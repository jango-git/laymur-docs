import { STORE } from "../../../document/store";
import { EElementType } from "../../../document/types.elements";
import { ESceneUpdateMode } from "../../../document/types.misc";

export class ESceneElementBuilder {
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
        type: EElementType.SCENE,
        name: "Scene",
        color: "#ffffffff",
        updateMode: ESceneUpdateMode.EVERY_FRAME,
        resolutionFactor: 1,
        clearColor: "#000000ff",
        enableDepthBuffer: false,
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
