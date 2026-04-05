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

  container.addEventListener("dragstart", (e: DragEvent) => {
    const target = (e.target as HTMLElement).closest("[draggable]");
    if (target === null || !container.contains(target)) {
      return;
    }
    dragging = target as HTMLElement;
    if (e.dataTransfer !== null) {
      e.dataTransfer.effectAllowed = "move";
    }
    setTimeout(() => {
      dragging?.classList.add("drag-ghost");
    }, 0);
  });

  container.addEventListener("dragend", () => {
    dragging?.classList.remove("drag-ghost");
    dragging = undefined;
    clearDragOver();
  });

  container.addEventListener("dragover", (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer !== null) {
      e.dataTransfer.dropEffect = "move";
    }
    const target = (e.target as HTMLElement).closest("[draggable]");
    if (target === null || target === dragging || !container.contains(target)) {
      return;
    }
    clearDragOver();
    const rect = target.getBoundingClientRect();
    const isTopHalf = e.clientY < rect.top + rect.height / 2;
    target.classList.add(isTopHalf ? "drag-over-top" : "drag-over-bottom");
  });

  container.addEventListener("dragleave", (e: DragEvent) => {
    if (!container.contains(e.relatedTarget as Node)) {
      clearDragOver();
    }
  });

  container.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault();
    const target = (e.target as HTMLElement).closest("[draggable]");
    if (target === null || target === dragging || !container.contains(target)) {
      return;
    }
    target.classList.remove("drag-over-top", "drag-over-bottom");

    if (dragging === undefined) {
      return;
    }

    const children = [...container.querySelectorAll("[draggable]")] as HTMLElement[];
    const fromIndex = children.indexOf(dragging);
    const toIndex = children.indexOf(target as HTMLElement);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return;
    }
    onReorder(fromIndex, toIndex);
  });
}
