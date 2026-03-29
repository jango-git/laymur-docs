/**
 * ui.js
 *
 * Tab switching.
 */

export function setupTabs(): void {
  const tabsElement = document.getElementById("tabs");
  if (!tabsElement) {
    throw new Error("Tabs element not found");
  }

  tabsElement.addEventListener("click", (event) => {
    const clickedButton = (event.target as HTMLElement).closest<HTMLElement>(".tab-button");
    if (!clickedButton) {
      return;
    }

    const clickedTab = clickedButton.dataset.tab;

    document.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.toggle("active", button === clickedButton);
    });

    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${clickedTab}`);
    });
  });
}
