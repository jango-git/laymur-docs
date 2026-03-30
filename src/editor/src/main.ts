/**
 * main.ts
 *
 * Entry point. Wires assets, elements, and UI together.
 */

import { PreviewBridge } from "./bridge/PreviewBridge";
import { EDITOR_STATE } from "./state";
import { AssetsTab } from "./tabs/AssetsTab";
import { loadAssetsIntoState } from "./tabs/AssetsTab.Internal";
import { ConstraintsTab } from "./tabs/ConstraintsTab";
import { ElementsTab } from "./tabs/ElementsTab";
import { ExportTab } from "./tabs/ExportTab";
import { LayersTab } from "./tabs/LayersTab";
import { setupTabs } from "./ui";
import { PreviewToolbar } from "./ui/PreviewToolbar/PreviewToolbar";

const previewFrame = document.getElementById("preview-frame") as HTMLIFrameElement;
const previewWrapper = document.getElementById("preview-iframe-wrapper") as HTMLElement;
const previewStage = document.getElementById("preview-stage") as HTMLElement;
const previewToolbarEl = document.getElementById("preview-toolbar") as HTMLElement;

setupTabs();

const bridge = new PreviewBridge(previewFrame);

const previewToolbar = new PreviewToolbar(
  bridge,
  previewToolbarEl,
  previewWrapper,
  previewStage,
  previewFrame,
);

const layerTab = new LayersTab(EDITOR_STATE, bridge, {
  onLayerChange(): void {
    previewToolbar.setActiveLayer(EDITOR_STATE.activeLayerId);
    elementsTab.render();
    constraintsTab.render();
    constraintsTab.refreshAddForm();
  },
  onAfterInitialize(): void {
    previewToolbar.setActiveLayer(EDITOR_STATE.activeLayerId);
  },
});
layerTab.render();
layerTab.renderAddForm();

const elementsTab = new ElementsTab(EDITOR_STATE, bridge, {
  onElementDeleted(id): void {
    constraintsTab.removeForElement(id);
    constraintsTab.render();
  },
  onElementsChange(): void {
    constraintsTab.refreshAddForm();
  },
});
elementsTab.render();

const constraintsTab = new ConstraintsTab(EDITOR_STATE, bridge);
constraintsTab.render();

const exportTab = new ExportTab(EDITOR_STATE, bridge, {
  onInitializePreview(): void {
    layerTab.initializePreview();
  },
  onSceneLoad(): void {
    layerTab.render();
    layerTab.renderAddForm();
    elementsTab.render();
    constraintsTab.render();
    constraintsTab.refreshAddForm();
    assetsTab.render();
    elementsTab.refreshAddForm();
  },
});
exportTab.render();

const assetsTab = new AssetsTab(EDITOR_STATE, {
  onAssetsChange(): void {
    elementsTab.refreshAddForm();
  },
});
assetsTab.render(); // show placeholder immediately while IndexedDB loads

// Load persisted assets from IndexedDB
loadAssetsIntoState(EDITOR_STATE).then(() => {
  assetsTab.render();
  elementsTab.refreshAddForm();
});
