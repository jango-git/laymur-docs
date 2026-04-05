export function makeRow(container: HTMLElement, label: string): HTMLElement {
  const row = document.createElement("div");
  row.className = "element-card__row";
  const lbl = document.createElement("span");
  lbl.className = "element-card__label";
  lbl.textContent = label;
  row.appendChild(lbl);
  container.appendChild(row);
  return row;
}

export function makeSectionHeader(container: HTMLElement, label: string): void {
  const header = document.createElement("div");
  header.className = "element-card__section-header";
  header.textContent = label;
  container.appendChild(header);
}
