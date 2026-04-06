export function makeRow(container: HTMLElement, label: string): HTMLElement {
  const row = document.createElement("div");
  row.className = "element-card__row";
  const span = document.createElement("span");
  span.className = "element-card__label";
  span.textContent = label;
  row.appendChild(span);
  container.appendChild(row);
  return row;
}

export function makeSectionHeader(container: HTMLElement, label: string): void {
  const header = document.createElement("div");
  header.className = "element-card__section-header";
  header.textContent = label;
  container.appendChild(header);
}
