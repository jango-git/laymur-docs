import { EAssetsTab } from "./src/components/tabs/assets/EAssetsTab";
import { EConstraintsTab } from "./src/components/tabs/constraints/EConstraintsTab";
import { EElementsTab } from "./src/components/tabs/elements/EElementsTab";
import { EExportTab } from "./src/components/tabs/export/EExportTab";
import { ELayersTab } from "./src/components/tabs/layers/ELayersTab";

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll<HTMLButtonElement>(".tab-button");
  const tabPanels = document.querySelectorAll<HTMLElement>(".tab-panel");

  for (const button of tabButtons) {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;
      for (const b of tabButtons) {
        b.classList.toggle("active", b === button);
      }
      for (const panel of tabPanels) {
        panel.classList.toggle("active", panel.id === `tab-${target}`);
      }
    });
  }


  const assetsContainerElementId = "tab-assets";
  const layersContainerElementId = "tab-layers";
  const elementsContainerElementId = "tab-elements";
  const constraintsContainerElementId = "tab-constraints";
  const exportContainerElementId = "tab-export";

  const assetsContainer = document.getElementById(assetsContainerElementId);
  const layersContainer = document.getElementById(layersContainerElementId);
  const elementsContainer = document.getElementById(elementsContainerElementId);
  const constraintsContainer = document.getElementById(constraintsContainerElementId);
  const exportContainer = document.getElementById(exportContainerElementId);

  if (!assetsContainer) {
    throw new Error(
      `[DOMContentLoaded] assetsContainer is not defined with id "${assetsContainerElementId}"`,
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
  if (!exportContainer) {
    throw new Error(
      `[DOMContentLoaded] exportContainer is not defined with id "${exportContainerElementId}"`,
    );
  }

  new EAssetsTab(assetsContainer);
  new ELayersTab(layersContainer);
  new EElementsTab(elementsContainer);
  new EConstraintsTab(constraintsContainer);
  new EExportTab(exportContainer);
});
