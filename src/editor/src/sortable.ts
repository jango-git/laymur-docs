/**
 * sortable.js
 *
 * Minimal HTML5 drag-and-drop reorder utility.
 * Each direct child of the container must have draggable="true".
 *
 * @param {HTMLElement} container - parent whose [draggable] children are sortable
 * @param {(fromIndex: number, toIndex: number) => void} onReorder
 */
export function makeSortable(
  container: HTMLElement,
  onReorder: (fromIndex: number, toIndex: number) => void,
) {
  let dragging: HTMLElement | null = null;

  container.addEventListener("dragstart", (e: DragEvent) => {
    const target = (e.target as HTMLElement).closest("[draggable]");
    if (!target || !container.contains(target)) {
      return;
    }
    dragging = target;
    e.dataTransfer!.effectAllowed = "move";
    setTimeout(() => dragging?.classList.add("drag-ghost"), 0);
  });

  container.addEventListener("dragend", () => {
    dragging?.classList.remove("drag-ghost");
    dragging = null;
    container.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
  });

  container.addEventListener("dragover", (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "move";
    const target = (e.target as HTMLElement).closest("[draggable]");
    if (!target || target === dragging || !container.contains(target)) {
      return;
    }
    container.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
    target.classList.add("drag-over");
  });

  container.addEventListener("dragleave", (e: DragEvent) => {
    if (!container.contains(e.relatedTarget as Node)) {
      container.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
    }
  });

  container.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault();
    const target = (e.target as HTMLElement).closest("[draggable]");
    if (!target || target === dragging || !container.contains(target)) {
      return;
    }
    target.classList.remove("drag-over");
    const children = [...container.querySelectorAll("[draggable]")] as HTMLElement[];
    const fromIndex = children.indexOf(dragging!);
    const toIndex = children.indexOf(target);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return;
    }
    onReorder(fromIndex, toIndex);
  });
}
