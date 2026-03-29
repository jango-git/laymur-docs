export interface EUIElementPickerConfig<T> {
  items: T[];
  getId: (item: T) => string;
  renderItem: (item: T) => HTMLElement;
  filterItem: (item: T, query: string) => boolean;
  currentId?: string | null;
  excludeId?: string | null;
  placeholderText?: string;
  emptyText?: string;
}

export class EUIElementPicker<T> {
  private readonly config: EUIElementPickerConfig<T>;
  private readonly modal: HTMLDivElement;
  private readonly listContainer: HTMLDivElement;
  private readonly searchInput: HTMLInputElement;
  private resolvePromise: ((id: string | null) => void) | null = null;

  constructor(config: EUIElementPickerConfig<T>) {
    this.config = config;

    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.className = "ep-search";
    this.searchInput.placeholder = "Search…";
    this.searchInput.addEventListener("input", this.handleSearchInput);

    const closeButton = document.createElement("button");
    closeButton.className = "ep-close";
    closeButton.setAttribute("aria-label", "Close");
    closeButton.textContent = "✕";
    closeButton.addEventListener("click", () => {
      this.close(null);
    });

    const header = document.createElement("div");
    header.className = "ep-header";
    header.appendChild(this.searchInput);
    header.appendChild(closeButton);

    this.listContainer = document.createElement("div");
    this.listContainer.className = "ep-list";

    const popup = document.createElement("div");
    popup.className = "ep-popup";
    popup.appendChild(header);
    popup.appendChild(this.listContainer);

    const backdrop = document.createElement("div");
    backdrop.className = "ep-backdrop";
    backdrop.addEventListener("click", () => {
      this.close(null);
    });

    this.modal = document.createElement("div");
    this.modal.className = "element-picker-modal";
    this.modal.appendChild(backdrop);
    this.modal.appendChild(popup);
  }

  public open(): Promise<string | null> {
    document.body.appendChild(this.modal);
    this.renderList("");
    requestAnimationFrame(() => {
      this.searchInput.focus();
    });
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  private close(selectedId: string | null): void {
    if (this.resolvePromise !== null) {
      this.resolvePromise(selectedId);
      this.resolvePromise = null;
    }
    this.modal.remove();
  }

  private readonly handleSearchInput = (): void => {
    const query = this.searchInput.value.toLowerCase().trim();
    this.renderList(query);
  };

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
      if (excludeId !== null && excludeId !== undefined && getId(item) === excludeId) {
        return false;
      }
      if (query.length > 0 && !filterItem(item, query)) {
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      const paragraph = document.createElement("p");
      paragraph.className = "ep-placeholder-text";
      paragraph.textContent =
        query.length > 0 ? (placeholderText ?? "No matches.") : (emptyText ?? "No items.");
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
      row.addEventListener("click", () => {
        this.close(id);
      });
      fragment.appendChild(row);
    }

    this.listContainer.appendChild(fragment);
  }
}
