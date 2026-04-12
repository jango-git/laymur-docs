import { EConstraintsTab } from "./src/components/tabs/constraints/EConstraintsTab";
import { EElementsTab } from "./src/components/tabs/elements/EElementsTab";
import { ELayersTab } from "./src/components/tabs/layers/ELayersTab";
import { EProjectTab } from "./src/components/tabs/project/EProjectTab";
import { EDocumentAutoload } from "./src/miscellaneous/EDocumentAutoload";
import { EDocumentAutosave } from "./src/miscellaneous/EDocumentAutosave";

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll<HTMLButtonElement>(".tab-button");
  const tabPanels = document.querySelectorAll<HTMLElement>(".tab-panel");

  for (const button of tabButtons) {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;
      for (const tabButton of tabButtons) {
        tabButton.classList.toggle("active", tabButton === button);
      }
      for (const panel of tabPanels) {
        panel.classList.toggle("active", panel.id === `tab-${target}`);
      }
    });
  }

  const projectContainerElementId = "tab-project";
  const layersContainerElementId = "tab-layers";
  const elementsContainerElementId = "tab-elements";
  const constraintsContainerElementId = "tab-constraints";

  const projectContainer = document.getElementById(projectContainerElementId);
  const layersContainer = document.getElementById(layersContainerElementId);
  const elementsContainer = document.getElementById(elementsContainerElementId);
  const constraintsContainer = document.getElementById(constraintsContainerElementId);

  if (!projectContainer) {
    throw new Error(
      `[DOMContentLoaded] projectContainer is not defined with id "${projectContainerElementId}"`,
    );
  }
  if (!layersContainer) {
    throw new Error(
      `[DOMContentLoaded] layersContainer is not defined with id "${layersContainerElementId}"`,
    );
  }
  if (!elementsContainer) {
    throw new Error(
      `[DOMContentLoaded] elementsContainer is not defined with id "${elementsContainerElementId}"`,
    );
  }
  if (!constraintsContainer) {
    throw new Error(
      `[DOMContentLoaded] constraintsContainer is not defined with id "${constraintsContainerElementId}"`,
    );
  }

  void (async (): Promise<void> => {
    await EDocumentAutoload.load();

    new EDocumentAutosave();
    new ELayersTab(layersContainer);
    new EElementsTab(elementsContainer);
    new EConstraintsTab(constraintsContainer);
    new EProjectTab(projectContainer);
  })();
});
