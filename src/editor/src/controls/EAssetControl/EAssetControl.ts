import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";

export interface EAssetControlItem {
  name: string;
  dataURL: string; // data URL
}

interface EAssetControlOptions<T extends EAssetControlItem> {
  value: T | undefined;
  nullable: boolean;
  placeholder: string;
}

const POPUP_MAX_HEIGHT = 200;

export class EAssetControl<T extends EAssetControlItem> {
  private readonly container: HTMLElement;
  private currentValue: T | undefined;
  private readonly nullable: boolean;
  private readonly fetchAssets: () => T[];
  private readonly placeholder: string;

  private readonly root: HTMLDivElement;
  private readonly display: HTMLDivElement;
  private readonly displayThumbnail: HTMLImageElement;
  private readonly displayName: HTMLSpanElement;
  private readonly popup: HTMLDivElement;
  private readonly searchInput: HTMLInputElement;
  private readonly list: HTMLDivElement;

  private readonly signalValueChangedInternal = new Ferrsign2<T | undefined, T | undefined>();

  constructor(
    container: HTMLElement,
    fetchAssets: () => T[],
    options: Partial<EAssetControlOptions<T>> = {},
  ) {
    this.container = container;
    this.currentValue = options.value ?? undefined;
    this.nullable = options.nullable ?? true;
    this.fetchAssets = fetchAssets;
    this.placeholder = options.placeholder ?? "—";

    this.root = document.createElement("div");
    this.root.className = "asset-control";
    this.root.dataset.state = "closed";

    // Display row
    this.display = document.createElement("div");
    this.display.className = "asset-control__display";

    this.displayThumbnail = document.createElement("img");
    this.displayThumbnail.className = "asset-control__display-thumbnail";
    this.displayThumbnail.alt = "";

    this.displayName = document.createElement("span");
    this.displayName.className = "asset-control__display-name";

    this.display.appendChild(this.displayThumbnail);
    this.display.appendChild(this.displayName);

    // Popup
    this.popup = document.createElement("div");
    this.popup.className = "asset-control__popup";

    this.searchInput = document.createElement("input");
    this.searchInput.className = "asset-control__search";
    this.searchInput.type = "text";
    this.searchInput.placeholder = "Search…";

    this.list = document.createElement("div");
    this.list.className = "asset-control__list";

    this.popup.appendChild(this.searchInput);
    this.popup.appendChild(this.list);

    this.root.appendChild(this.display);
    this.root.appendChild(this.popup);
    this.container.appendChild(this.root);

    this.display.addEventListener("click", this.handleDisplayClick);
    this.searchInput.addEventListener("input", this.handleSearchInput);

    this.refreshDisplay();
  }

  public get signalValueChanged(): FerrsignView2<T | undefined, T | undefined> {
    return this.signalValueChangedInternal;
  }

  public get value(): T | undefined {
    return this.currentValue;
  }

  public set value(value: T | undefined) {
    this.applyValue(value);
  }

  public flash(): void {
    this.root.classList.remove("asset-control--flash");
    void this.root.offsetWidth;
    this.root.classList.add("asset-control--flash");
    this.root.addEventListener(
      "animationend",
      () => {
        this.root.classList.remove("asset-control--flash");
      },
      { once: true },
    );
  }

  public destroy(): void {
    this.display.removeEventListener("click", this.handleDisplayClick);
    this.searchInput.removeEventListener("input", this.handleSearchInput);
    document.removeEventListener("mousedown", this.handleDocumentMouseDown);
    this.root.remove();
  }

  private readonly handleDisplayClick = (): void => {
    if (this.root.dataset.state === "open") {
      this.close();
    } else {
      this.open();
    }
  };

  private readonly handleSearchInput = (): void => {
    this.renderList(this.fetchAssets());
  };

  private readonly handleDocumentMouseDown = (event: MouseEvent): void => {
    if (!this.root.contains(event.target as Node)) {
      this.close();
    }
  };

  private open(): void {
    const assets = this.fetchAssets();
    this.searchInput.value = "";
    this.renderList(assets);

    const rect = this.root.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    this.root.dataset.direction = spaceBelow >= POPUP_MAX_HEIGHT ? "down" : "up";
    this.root.dataset.state = "open";

    requestAnimationFrame(() => {
      this.searchInput.focus();
    });

    document.addEventListener("mousedown", this.handleDocumentMouseDown);
  }

  private close(): void {
    this.root.dataset.state = "closed";
    document.removeEventListener("mousedown", this.handleDocumentMouseDown);
  }

  private renderList(assets: T[]): void {
    const query = this.searchInput.value.toLowerCase();
    const filtered =
      query.length > 0 ? assets.filter((a) => a.name.toLowerCase().includes(query)) : assets;

    this.list.innerHTML = "";

    if (this.nullable && this.currentValue !== undefined) {
      const clearItem = document.createElement("div");
      clearItem.className = "asset-control__item asset-control__item--clear";
      clearItem.textContent = "Clear";
      clearItem.addEventListener("mousedown", (event) => {
        event.preventDefault();
        this.applyValue(undefined);
        this.close();
      });
      this.list.appendChild(clearItem);
    }

    for (const asset of filtered) {
      const item = document.createElement("div");
      item.className = "asset-control__item";
      if (this.equals(asset, this.currentValue)) {
        item.dataset.selected = "true";
      }

      const thumb = document.createElement("img");
      thumb.className = "asset-control__item-thumbnail";
      thumb.src = asset.dataURL;
      thumb.alt = "";

      const name = document.createElement("span");
      name.className = "asset-control__item-name";
      name.textContent = asset.name;

      item.appendChild(thumb);
      item.appendChild(name);

      item.addEventListener("mousedown", (event) => {
        event.preventDefault();
        this.applyValue(asset);
        this.close();
      });

      this.list.appendChild(item);
    }
  }

  private applyValue(value: T | undefined): void {
    if (this.equals(value, this.currentValue)) {
      return;
    }
    const previousValue = this.currentValue;
    this.currentValue = value;
    console.debug("[EAssetControl] value: %o → %o", previousValue, this.currentValue);
    this.refreshDisplay();
    this.signalValueChangedInternal.emit(this.currentValue, previousValue);
  }

  private refreshDisplay(): void {
    if (this.currentValue === undefined) {
      this.displayThumbnail.src = "";
      this.displayThumbnail.hidden = true;
      this.displayName.textContent = this.placeholder;
      this.display.dataset.empty = "true";
    } else {
      this.displayThumbnail.src = this.currentValue.dataURL;
      this.displayThumbnail.hidden = false;
      this.displayName.textContent = this.currentValue.name;
      delete this.display.dataset.empty;
    }
  }

  private equals(a: T | undefined, b: T | undefined): boolean {
    if (a === undefined || b === undefined) {
      return a === b;
    }
    const keysA = Object.keys(a) as (keyof T)[];
    if (keysA.length !== Object.keys(b).length) {
      return false;
    }
    return keysA.every((key) => a[key] === b[key]);
  }
}
