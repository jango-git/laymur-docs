import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";
import { makeSortable } from "../../miscellaneous/make-sortable";

export interface EArrayControlItem<TItem> {
  getValue(): TItem;
  destroy(): void;
}

export interface EArrayControlTemplate<TItem> {
  createDefault(): TItem;
  buildItem(container: HTMLElement, value: TItem, onChange: () => void): EArrayControlItem<TItem>;
}

interface ActiveItem<TItem> {
  root: HTMLDivElement;
  item: EArrayControlItem<TItem>;
}

export class EArrayControl<TItem> {
  private readonly root: HTMLDivElement;
  private readonly list: HTMLDivElement;
  private readonly activeItems: ActiveItem<TItem>[] = [];
  private lastValues: TItem[];

  private readonly signalValueChangedInternal = new Ferrsign2<TItem[], TItem[]>();

  constructor(
    container: HTMLElement,
    private readonly template: EArrayControlTemplate<TItem>,
    options: Partial<{ value: TItem[] }> = {},
  ) {
    this.lastValues = [...(options.value ?? [])];

    this.root = document.createElement("div");
    this.root.className = "array-control";

    this.list = document.createElement("div");
    this.list.className = "array-control__list";
    this.root.appendChild(this.list);

    const addButton = document.createElement("button");
    addButton.className = "array-control__add-btn";
    addButton.textContent = "+ Add";
    addButton.addEventListener("click", this.handleAdd);
    this.root.appendChild(addButton);

    container.appendChild(this.root);

    for (const value of this.lastValues) {
      this.appendItem(value);
    }

    makeSortable(this.list, (fromIndex, toIndex) => {
      const previous = this.collectValues();

      const children = [...this.list.children] as HTMLElement[];
      const moving = children[fromIndex];
      if (toIndex > fromIndex) {
        children[toIndex].after(moving);
      } else {
        children[toIndex].before(moving);
      }

      const [moved] = this.activeItems.splice(fromIndex, 1);
      this.activeItems.splice(toIndex, 0, moved);

      this.updateIndices();
      this.emit(previous);
    });
  }

  public get value(): TItem[] {
    return this.collectValues();
  }

  public get signalValueChanged(): FerrsignView2<TItem[], TItem[]> {
    return this.signalValueChangedInternal;
  }

  public set value(items: TItem[]) {
    for (const { item } of this.activeItems) {
      item.destroy();
    }
    this.activeItems.length = 0;
    this.list.innerHTML = "";
    for (const item of items) {
      this.appendItem(item);
    }
    this.lastValues = this.collectValues();
  }

  public flash(): void {
    this.root.classList.remove("array-control--flash");
    void this.root.offsetWidth;
    this.root.classList.add("array-control--flash");
    this.root.addEventListener(
      "animationend",
      () => {
        this.root.classList.remove("array-control--flash");
      },
      { once: true },
    );
  }

  public destroy(): void {
    for (const { item } of this.activeItems) {
      item.destroy();
    }
    this.root.remove();
  }

  private appendItem(value: TItem): void {
    const root = document.createElement("div");
    root.className = "array-control__item";
    root.draggable = true;

    const header = document.createElement("div");
    header.className = "array-control__item-header";

    const indexLabel = document.createElement("span");
    indexLabel.className = "array-control__item-index";
    indexLabel.textContent = String(this.activeItems.length + 1);
    header.appendChild(indexLabel);

    const dragHandle = document.createElement("span");
    dragHandle.className = "array-control__drag-handle";
    dragHandle.textContent = "⠿";
    header.appendChild(dragHandle);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "array-control__delete-btn";
    deleteBtn.textContent = "✕";
    header.appendChild(deleteBtn);

    root.appendChild(header);

    const body = document.createElement("div");
    body.className = "array-control__item-body";
    root.appendChild(body);

    this.list.appendChild(root);

    const item = this.template.buildItem(body, value, () => {
      this.emit(this.lastValues);
    });

    deleteBtn.addEventListener("click", () => {
      const previous = this.collectValues();
      const idx = this.activeItems.findIndex((a) => a.root === root);
      if (idx === -1) {
        return;
      }
      this.activeItems[idx].item.destroy();
      this.activeItems.splice(idx, 1);
      root.remove();
      this.updateIndices();
      this.emit(previous);
    });

    this.activeItems.push({ root, item });
  }

  private updateIndices(): void {
    for (let i = 0; i < this.activeItems.length; i++) {
      const label = this.activeItems[i].root.querySelector(".array-control__item-index");
      if (label !== null) {
        label.textContent = String(i + 1);
      }
    }
  }

  private collectValues(): TItem[] {
    return this.activeItems.map((a) => a.item.getValue());
  }

  private emit(previous: TItem[]): void {
    const next = this.collectValues();
    this.lastValues = next;
    this.signalValueChangedInternal.emit(next, previous);
  }

  private readonly handleAdd = (): void => {
    const previous = this.collectValues();
    this.appendItem(this.template.createDefault());
    this.emit(previous);
  };
}
