/**
 * main.ts
 *
 * Entry point. Wires assets, elements, and UI together.
 */

import { PreviewBridge } from "./bridge/PreviewBridge";
import { EDITOR_BUS } from "./events";
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
const bus = EDITOR_BUS;

new PreviewToolbar(bridge, bus, previewToolbarEl, previewWrapper, previewStage, previewFrame);

const layersTab = new LayersTab(EDITOR_STATE, bridge, bus);
layersTab.render();
layersTab.renderAddForm();

new ElementsTab(EDITOR_STATE, bridge, bus).render();
new ConstraintsTab(EDITOR_STATE, bridge, bus).render();
new ExportTab(EDITOR_STATE, bridge, bus).render();

const assetsTab = new AssetsTab(EDITOR_STATE, bus, bridge);
assetsTab.render();

// Load persisted assets from IndexedDB
loadAssetsIntoState(EDITOR_STATE).then(() => {
  assetsTab.render();
  bus.assetsChanged.emit();
});
