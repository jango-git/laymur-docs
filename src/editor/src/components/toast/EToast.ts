enum EToastType {
  WARNING = "WARNING",
  ERROR = "ERROR",
}

const DISMISS_DELAY_MS = 4000;
const FADE_DURATION_MS = 300;

export class EToast {
  private container: HTMLElement | undefined;

  public warning(message: string): void {
    this.push(message, EToastType.WARNING);
  }

  public error(message: string): void {
    this.push(message, EToastType.ERROR);
  }

  private push(message: string, type: EToastType): void {
    const item = document.createElement("div");
    item.className = `toast toast--${type}`;
    item.textContent = message;
    this.getContainer().appendChild(item);

    setTimeout(() => {
      item.classList.add("toast--hidden");
      setTimeout(() => item.remove(), FADE_DURATION_MS);
    }, DISMISS_DELAY_MS);
  }

  private getContainer(): HTMLElement {
    if (this.container === undefined) {
      const container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
      this.container = container;
    }
    return this.container;
  }
}

export const TOAST = new EToast();
