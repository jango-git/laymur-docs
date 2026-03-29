export function makeSortable(
  container: HTMLElement,
  onReorder: (fromIndex: number, toIndex: number) => void,
): void {
  let dragging: HTMLElement | null = null;

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
    dragging = null;
    container.querySelectorAll(".drag-over").forEach((el) => {
      el.classList.remove("drag-over");
    });
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
    container.querySelectorAll(".drag-over").forEach((el) => {
      el.classList.remove("drag-over");
    });
    target.classList.add("drag-over");
  });

  container.addEventListener("dragleave", (e: DragEvent) => {
    if (!container.contains(e.relatedTarget as Node)) {
      container.querySelectorAll(".drag-over").forEach((el) => {
        el.classList.remove("drag-over");
      });
    }
  });

  container.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault();
    const target = (e.target as HTMLElement).closest("[draggable]");
    if (target === null || target === dragging || !container.contains(target)) {
      return;
    }
    target.classList.remove("drag-over");

    if (dragging === null) {
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
