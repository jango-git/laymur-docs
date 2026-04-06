export class EExportTab {
  constructor(private readonly container: HTMLElement) {
    // Create tab structure
    const scrollArea = document.createElement("div");
    scrollArea.className = "tab-scroll-area";
    container.appendChild(scrollArea);

    const content = document.createElement("div");
    content.id = "export-content";
    scrollArea.appendChild(content);
  }
}
