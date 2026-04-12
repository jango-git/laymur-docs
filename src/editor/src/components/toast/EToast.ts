enum EToastType {
  WARNING = "warning",
  ERROR = "error",
}

const DISMISS_DELAY_MS = 4000;
const FADE_DURATION_MS = 300;

export class EToast {
  private container: HTMLElement | undefined;

  private static parseMessage(message: string): Node[] {
    const nodes: Node[] = [];
    const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let last = 0;
    let match: RegExpExecArray | null;

    while ((match = re.exec(message)) !== null) {
      if (match.index > last) {
        nodes.push(document.createTextNode(message.slice(last, match.index)));
      }
      if (match[2] !== undefined) {
        const el = document.createElement("strong");
        el.textContent = match[2];
        nodes.push(el);
      } else if (match[3] !== undefined) {
        const el = document.createElement("em");
        el.textContent = match[3];
        nodes.push(el);
      }
      last = match.index + match[0].length;
    }

    if (last < message.length) {
      nodes.push(document.createTextNode(message.slice(last)));
    }

    return nodes;
  }

  public warning(message: string): void {
    this.push(message, EToastType.WARNING);
  }

  public error(message: string): void {
    this.push(message, EToastType.ERROR);
  }

  private push(message: string, type: EToastType): void {
    const item = document.createElement("div");
    item.className = `toast toast--${type}`;
    item.append(...EToast.parseMessage(message));
    this.getContainer().appendChild(item);

    const dismiss = (): void => {
      item.classList.add("toast--hidden");
      setTimeout(() => item.remove(), FADE_DURATION_MS);
    };

    item.addEventListener("click", dismiss, { once: true });
    setTimeout(dismiss, DISMISS_DELAY_MS);
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
