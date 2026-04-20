const DRAG_HANDLE_SELECTOR = "[data-drag-handle]";

export function makeSortable(
  container: HTMLElement,
  onReorder: (fromIndex: number, toIndex: number) => void,
): void {
  let dragging: HTMLElement | undefined = undefined;

  const clearDragOver = (): void => {
    container.querySelectorAll(".drag-over-top, .drag-over-bottom").forEach((el) => {
      el.classList.remove("drag-over-top", "drag-over-bottom");
    });
  };

  const findDirectChild = (element: Element | null): HTMLElement | null => {
    let current: Element | null = element;
    while (current !== null && current.parentElement !== container) {
      current = current.parentElement;
    }
    return current as HTMLElement | null;
  };

  container.addEventListener("pointerdown", (e: PointerEvent) => {
    if (dragging !== undefined) {
      return;
    }
    if ((e.target as HTMLElement).closest(DRAG_HANDLE_SELECTOR) === null) {
      return;
    }

    const item = findDirectChild(e.target as HTMLElement);
    if (item === null) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    dragging = item;
    dragging.classList.add("drag-ghost");
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener("pointermove", (e: PointerEvent) => {
    if (dragging === undefined) {
      return;
    }

    const target = findDirectChild(document.elementFromPoint(e.clientX, e.clientY));
    clearDragOver();

    if (target === null || target === dragging) {
      return;
    }

    const rect = target.getBoundingClientRect();
    target.classList.add(
      e.clientY < rect.top + rect.height / 2 ? "drag-over-top" : "drag-over-bottom",
    );
  });

  const finishDrag = (clientX: number, clientY: number): void => {
    if (dragging === undefined) {
      return;
    }

    const current = dragging;
    dragging = undefined;

    const target = findDirectChild(document.elementFromPoint(clientX, clientY));
    clearDragOver();
    current.classList.remove("drag-ghost");

    if (target === null || target === current) {
      return;
    }

    const children = [...container.children] as HTMLElement[];
    const fromIndex = children.indexOf(current);
    const toIndex = children.indexOf(target);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return;
    }

    onReorder(fromIndex, toIndex);
  };

  container.addEventListener("pointerup", (e: PointerEvent) => {
    finishDrag(e.clientX, e.clientY);
  });

  container.addEventListener("pointercancel", () => {
    if (dragging === undefined) {
      return;
    }
    dragging.classList.remove("drag-ghost");
    dragging = undefined;
    clearDragOver();
  });
}
