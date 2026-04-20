import { EDebug } from "./src/components/debug/EDebug";
import { EConstraintsTab } from "./src/components/tabs/constraints/EConstraintsTab";
import { EElementsTab } from "./src/components/tabs/elements/EElementsTab";
import { ELayersTab } from "./src/components/tabs/layers/ELayersTab";
import { EProjectTab } from "./src/components/tabs/project/EProjectTab";
import { EViewportPresets } from "./src/components/viewport/EViewportPresets";
import { EActiveLayerGuard } from "./src/miscellaneous/EActiveLayerGuard";
import { EDocumentAutoload } from "./src/miscellaneous/EDocumentAutoload";
import { EDocumentAutosave } from "./src/miscellaneous/EDocumentAutosave";
import { EPreviewResizeHandle } from "./src/miscellaneous/EPreviewResizeHandle";

document.addEventListener("DOMContentLoaded", () => {
  new EPreviewResizeHandle(
    document.getElementById("preview-container") as HTMLElement,
    document.getElementById("preview-frame") as HTMLIFrameElement,
    document.getElementById("viewport-content") as HTMLElement,
    document.getElementById("preview-resize-handle") as HTMLElement,
  );

  new EViewportPresets(
    document.getElementById("viewport-toolbar-left") as HTMLElement,
    document.getElementById("preview-container") as HTMLElement,
    document.getElementById("viewport-content") as HTMLElement,
  );

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
  const viewportToolbarContainerElementId = "viewport-toolbar-right";

  const projectContainer = document.getElementById(projectContainerElementId);
  const layersContainer = document.getElementById(layersContainerElementId);
  const elementsContainer = document.getElementById(elementsContainerElementId);
  const constraintsContainer = document.getElementById(constraintsContainerElementId);
  const viewportToolbarContainer = document.getElementById(viewportToolbarContainerElementId);

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
  if (!viewportToolbarContainer) {
    throw new Error(
      `[DOMContentLoaded] viewportToolbarContainer is not defined with id "${viewportToolbarContainerElementId}"`,
    );
  }

  void (async (): Promise<void> => {
    await EDocumentAutoload.load();

    new EActiveLayerGuard();
    new EDocumentAutosave();

    new ELayersTab(layersContainer);
    new EElementsTab(elementsContainer);
    new EConstraintsTab(constraintsContainer);
    new EProjectTab(projectContainer);
    new EDebug(viewportToolbarContainer);
  })();
});
