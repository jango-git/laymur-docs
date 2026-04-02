interface ECardSectionOptions {
  label?: string;
}

export class ECardSection {
  public readonly body: HTMLDivElement;
  private readonly root: HTMLDivElement;

  constructor(container: HTMLElement, options: ECardSectionOptions = {}) {
    this.root = document.createElement("div");
    this.root.className = "card-section";

    if (options.label !== undefined) {
      const header = document.createElement("div");
      header.className = "card-section__header";
      header.textContent = options.label;
      this.root.appendChild(header);
    }

    this.body = document.createElement("div");
    this.body.className = "card-section__body";

    this.root.appendChild(this.body);
    container.appendChild(this.root);
  }

  public destroy(): void {
    this.root.remove();
  }
}
