export interface EUIElementPickerConfig<T> {
  items: T[];
  /** Функция, возвращающая уникальный ID для элемента */
  getId: (item: T) => string;
  /** Функция для отрисовки DOM-узла (содержимого) элемента списка */
  renderItem: (item: T) => HTMLElement;
  /** Функция фильтрации. Возвращает true, если элемент подходит под запрос */
  filterItem: (item: T, query: string) => boolean;

  currentId?: string | null;
  excludeId?: string | null;
  placeholderText?: string;
  emptyText?: string;
}

export class EUIElementPicker<T> {
  private readonly config: EUIElementPickerConfig<T>;
  private readonly modal: HTMLElement;
  private readonly listContainer: HTMLElement;
  private readonly searchInput: HTMLInputElement;
  private resolvePromise: ((id: string | null) => void) | null = null;

  constructor(config: EUIElementPickerConfig<T>) {
    this.config = config;
    this.modal = this.createDOM();

    this.listContainer = this.modal.querySelector(".ep-list") as HTMLElement;
    this.searchInput = this.modal.querySelector(".ep-search") as HTMLInputElement;

    this.modal.querySelector(".ep-backdrop")!.addEventListener("click", () => this.close(null));
    this.modal.querySelector(".ep-close")!.addEventListener("click", () => this.close(null));

    this.searchInput.addEventListener("input", (event) => {
      const query = (event.target as HTMLInputElement).value.toLowerCase().trim();
      this.renderList(query);
    });
  }

  public async open(): Promise<string | null> {
    document.body.appendChild(this.modal);
    this.renderList("");

    requestAnimationFrame(() => this.searchInput.focus());

    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  private close(selectedId: string | null = null): void {
    if (this.resolvePromise) {
      this.resolvePromise(selectedId);
      this.resolvePromise = null;
    }
    this.destroy();
  }

  private destroy(): void {
    if (this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }

  private renderList(query: string): void {
    this.listContainer.innerHTML = "";

    const {
      items,
      getId,
      filterItem,
      excludeId,
      renderItem,
      currentId,
      emptyText,
      placeholderText,
    } = this.config;

    const filtered = items.filter((item) => {
      if (excludeId && getId(item) === excludeId) {
        return false;
      }
      if (query && !filterItem(item, query)) {
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      const paragraph = document.createElement("p");
      paragraph.className = "ep-placeholder-text";
      paragraph.textContent = query
        ? (placeholderText ?? "No matches.")
        : (emptyText ?? "No items.");
      this.listContainer.appendChild(paragraph);
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const item of filtered) {
      const id = getId(item);
      const row = document.createElement("div");
      row.className = "ep-item";
      if (id === currentId) {
        row.classList.add("ep-item-selected");
      }

      row.appendChild(renderItem(item));

      row.addEventListener("click", () => this.close(id));
      fragment.appendChild(row);
    }

    this.listContainer.appendChild(fragment);
  }

  private createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.className = "element-picker-modal";
    element.innerHTML = `
      <div class="ep-backdrop"></div>
      <div class="ep-popup">
        <div class="ep-header">
          <input type="text" class="ep-search" placeholder="Search…" />
          <button class="ep-close" aria-label="Close">✕</button>
        </div>
        <div class="ep-list"></div>
      </div>
    `;
    return element;
  }
}
