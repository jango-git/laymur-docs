type ETheme = "light" | "dark";

export class EThemeSwitch {
  private readonly lightButton: HTMLButtonElement;
  private readonly darkButton: HTMLButtonElement;
  private theme: ETheme = "dark";

  constructor(
    container: HTMLElement,
    private readonly frame: HTMLIFrameElement,
  ) {
    const wrapper = document.createElement("div");
    wrapper.className = "theme-switch";

    this.lightButton = this.createSwatch("light", "Light theme");
    this.darkButton = this.createSwatch("dark", "Dark theme");
    wrapper.appendChild(this.lightButton);
    wrapper.appendChild(this.darkButton);

    container.appendChild(wrapper);

    // The preview is a separate document, so it needs data-theme set on its own
    // <html>. A freshly (re)loaded iframe starts without it, so re-apply on load.
    this.frame.addEventListener("load", () => this.applyToFrame());

    // Sync once with the OS/browser preference at startup; not persisted.
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.apply(prefersDark ? "dark" : "light");
  }

  private createSwatch(theme: ETheme, title: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = `theme-switch__swatch theme-switch__swatch--${theme}`;
    button.title = title;
    button.addEventListener("click", () => this.apply(theme));
    return button;
  }

  private apply(theme: ETheme): void {
    this.theme = theme;
    document.documentElement.dataset.theme = theme;
    this.applyToFrame();
    this.lightButton.classList.toggle("theme-switch__swatch--active", theme === "light");
    this.darkButton.classList.toggle("theme-switch__swatch--active", theme === "dark");
  }

  private applyToFrame(): void {
    const document = this.frame.contentDocument;
    if (document !== null) {
      document.documentElement.dataset.theme = this.theme;
    }
  }
}
