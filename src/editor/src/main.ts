/**
 * main.ts
 *
 * Entry point. Wires assets, elements, and UI together.
 */

import { PreviewBridge } from "./bridge/PreviewBridge";
import { editorState } from "./state";
import { AssetsTab, loadAssetsIntoState } from "./tabs/assets";
import { ConstraintsTab } from "./tabs/constraints";
import { ElementsTab } from "./tabs/elements";
import { ExportTab } from "./tabs/export";
import { LayerTab } from "./tabs/layer";
import { setupTabs } from "./ui";

const previewFrame = document.getElementById("preview-frame") as HTMLIFrameElement;
const previewWrapper = document.getElementById("preview-iframe-wrapper") as HTMLElement;
const previewStage = document.getElementById("preview-stage") as HTMLElement;
const previewSizeLabel = document.getElementById("preview-size-label") as HTMLElement;
const presetBtns = document.querySelectorAll(".preset-btn");
const resizeHandle = document.getElementById("preview-resize-handle");

// --- Preset buttons ---
presetBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    presetBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const w = parseInt((btn as HTMLElement).dataset.w!, 10);
    const h = parseInt((btn as HTMLElement).dataset.h!, 10);
    if (w === 0 && h === 0) {
      // Fill mode
      previewWrapper.classList.remove("framed");
      previewWrapper.style.width = "";
      previewWrapper.style.height = "";
      previewSizeLabel.textContent = "";
    } else {
      const wPx = parseInt(previewWrapper.style.width, 10);
      const hPx = parseInt(previewWrapper.style.height, 10);

      if (w === wPx && h === hPx) {
        applySize(h, w);
      } else {
        applySize(w, h);
      }
    }
  });

  if (btn.classList.contains("active")) {
    requestAnimationFrame(() => btn.dispatchEvent(new MouseEvent("click")));
  }
});

function applySize(w: number, h: number) {
  const stageRect = previewStage.getBoundingClientRect();
  const maxW = stageRect.width - 4;
  const maxH = stageRect.height - 4;

  if (maxW > 0 && maxH > 0 && (w > maxW || h > maxH)) {
    const scale = Math.min(maxW / w, maxH / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  previewWrapper.classList.add("framed");
  previewWrapper.style.width = w + "px";
  previewWrapper.style.height = h + "px";
  previewSizeLabel.textContent = w + " × " + h;
}

// --- Corner resize drag ---
let resizing = false;
let resizeStart: { x: number; y: number; w: number; h: number } | null = null;

resizeHandle!.addEventListener("mousedown", (e) => {
  e.preventDefault();
  resizing = true;
  resizeStart = {
    x: e.clientX,
    y: e.clientY,
    w: previewWrapper.offsetWidth,
    h: previewWrapper.offsetHeight,
  };
  document.body.style.cursor = "se-resize";
  document.body.style.userSelect = "none";
  // Overlay iframe to capture mouse events during drag
  previewFrame.style.pointerEvents = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!resizing || !resizeStart) {return;}
  const dx = e.clientX - resizeStart.x;
  const dy = e.clientY - resizeStart.y;
  const stageRect = previewStage.getBoundingClientRect();
  const newW = Math.max(160, Math.min(resizeStart.w + dx * 2, stageRect.width - 4));
  const newH = Math.max(120, Math.min(resizeStart.h + dy * 2, stageRect.height - 4));
  previewWrapper.style.width = newW + "px";
  previewWrapper.style.height = newH + "px";
  previewSizeLabel.textContent = Math.round(newW) + " × " + Math.round(newH);
});

document.addEventListener("mouseup", () => {
  if (!resizing) {return;}
  resizing = false;
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
  previewFrame.style.pointerEvents = "";
});

setupTabs();

const bridge = new PreviewBridge(previewFrame);

const layerTab = new LayerTab(editorState, bridge, {
  onLayerChange() {
    elementsTab.render();
    constraintsTab.render();
    constraintsTab.refreshAddForm();
  },
});
layerTab.render();
layerTab.renderAddForm();

const elementsTab = new ElementsTab(editorState, bridge, {
  onElementDeleted(id) {
    constraintsTab.removeForElement(id);
    constraintsTab.render();
  },
  onElementsChange() {
    constraintsTab.refreshAddForm();
  },
});
elementsTab.render();

const constraintsTab = new ConstraintsTab(editorState, bridge);
constraintsTab.render();

const exportTab = new ExportTab(editorState, bridge, {
  onInitializePreview() {
    layerTab.initializePreview();
  },
  onSceneLoad() {
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

const assetsTab = new AssetsTab(editorState, {
  onAssetsChange() {
    elementsTab.refreshAddForm();
  },
});
assetsTab.render(); // show placeholder immediately while IndexedDB loads

// Load persisted assets from IndexedDB
loadAssetsIntoState(editorState).then(() => {
  assetsTab.render();
  elementsTab.refreshAddForm();
});
