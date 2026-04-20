enum Orientation {
  PORTRAIT = "portrait",
  LANDSCAPE = "landscape",
}

enum Preset {
  FULL = "full",
  PHONE = "phone",
  TABLET = "tablet",
}

const RATIOS: Record<Exclude<Preset, Preset.FULL>, Record<Orientation, [number, number]>> = {
  [Preset.PHONE]: { [Orientation.PORTRAIT]: [9, 16], [Orientation.LANDSCAPE]: [16, 9] },
  [Preset.TABLET]: { [Orientation.PORTRAIT]: [3, 4], [Orientation.LANDSCAPE]: [4, 3] },
};

export class EViewportPresets {
  private readonly previewContainer: HTMLElement;
  private readonly viewport: HTMLElement;

  private activePreset: Preset = Preset.FULL;
  private orientation: Orientation = Orientation.PORTRAIT;

  private readonly fullButton: HTMLButtonElement;
  private readonly phoneButton: HTMLButtonElement;
  private readonly tabletButton: HTMLButtonElement;

  private readonly phoneIcon: HTMLSpanElement;
  private readonly tabletIcon: HTMLSpanElement;

  constructor(container: HTMLElement, previewContainer: HTMLElement, viewport: HTMLElement) {
    this.previewContainer = previewContainer;
    this.viewport = viewport;

    const fullIcon = this.createIcon("square");
    this.phoneIcon = this.createIcon(Orientation.PORTRAIT);
    this.tabletIcon = this.createIcon(Orientation.PORTRAIT);

    this.fullButton = this.createButton(fullIcon, "Full", this.onFullClicked);
    this.phoneButton = this.createButton(this.phoneIcon, "Phone", this.onPhoneClicked);
    this.tabletButton = this.createButton(this.tabletIcon, "Tablet", this.onTabletClicked);

    container.appendChild(this.fullButton);
    container.appendChild(this.phoneButton);
    container.appendChild(this.tabletButton);

    this.updateButtons();
  }

  private createIcon(modifier: Orientation | "square"): HTMLSpanElement {
    const icon = document.createElement("span");
    icon.className = `viewport-preset-icon viewport-preset-icon--${modifier}`;
    return icon;
  }

  private createButton(
    icon: HTMLSpanElement,
    label: string,
    onClick: () => void,
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = "viewport-preset-button";
    button.appendChild(icon);
    button.appendChild(document.createTextNode(label));
    button.addEventListener("click", onClick);
    return button;
  }

  private readonly onFullClicked = (): void => {
    this.activePreset = Preset.FULL;
    this.applyFull();
    this.updateButtons();
  };

  private readonly onPhoneClicked = (): void => {
    if (this.activePreset === Preset.PHONE) {
      this.orientation =
        this.orientation === Orientation.PORTRAIT ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
    } else {
      this.activePreset = Preset.PHONE;
      this.orientation = Orientation.PORTRAIT;
    }
    this.applyAspectRatio(...RATIOS[Preset.PHONE][this.orientation]);
    this.updateButtons();
  };

  private readonly onTabletClicked = (): void => {
    if (this.activePreset === Preset.TABLET) {
      this.orientation =
        this.orientation === Orientation.PORTRAIT ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
    } else {
      this.activePreset = Preset.TABLET;
      this.orientation = Orientation.PORTRAIT;
    }
    this.applyAspectRatio(...RATIOS[Preset.TABLET][this.orientation]);
    this.updateButtons();
  };

  private applyFull(): void {
    this.previewContainer.style.width = `${this.viewport.clientWidth}px`;
    this.previewContainer.style.height = `${this.viewport.clientHeight}px`;
  }

  private applyAspectRatio(ratioWidth: number, ratioHeight: number): void {
    const maxWidth = this.viewport.clientWidth;
    const maxHeight = this.viewport.clientHeight;
    const scale = Math.min(maxWidth / ratioWidth, maxHeight / ratioHeight);
    this.previewContainer.style.width = `${Math.floor(ratioWidth * scale)}px`;
    this.previewContainer.style.height = `${Math.floor(ratioHeight * scale)}px`;
  }

  private updateButtons(): void {
    this.fullButton.classList.toggle(
      "viewport-preset-button--active",
      this.activePreset === Preset.FULL,
    );
    this.phoneButton.classList.toggle(
      "viewport-preset-button--active",
      this.activePreset === Preset.PHONE,
    );
    this.tabletButton.classList.toggle(
      "viewport-preset-button--active",
      this.activePreset === Preset.TABLET,
    );

    this.phoneIcon.className = `viewport-preset-icon viewport-preset-icon--${this.activePreset === Preset.PHONE ? this.orientation : Orientation.PORTRAIT}`;
    this.tabletIcon.className = `viewport-preset-icon viewport-preset-icon--${this.activePreset === Preset.TABLET ? this.orientation : Orientation.PORTRAIT}`;
  }
}
