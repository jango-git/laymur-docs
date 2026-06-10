import { STORE } from "../../../../document/store";
import { UI_STATE } from "../../../../ui-state/EUIState";
import { generateLayerCode, layerClassName } from "./export-ts/generate-layer-code";

export function exportActiveLayer(typescript: boolean): void {
  const layerUuid = UI_STATE.activeLayerUuid;
  if (layerUuid === undefined) {
    console.warn("[exportActiveLayer] No active layer");
    return;
  }

  const layerContext = STORE.selectors.layers.selectContext(layerUuid);
  if (layerContext === undefined) {
    console.warn("[exportActiveLayer] Layer context not found");
    return;
  }

  const layer = layerContext.layer;
  const elements = STORE.selectors.elements.selectAll(layerUuid);
  const constraints = STORE.selectors.constraints.selectAll(layerUuid);

  const assetMap = new Map<string, string>();
  for (const asset of STORE.selectors.assets.selectAll()) {
    assetMap.set(asset.uuid, asset.name);
  }

  const code = generateLayerCode(layer, elements, constraints, assetMap, typescript);
  const extension = typescript ? "ts" : "js";
  downloadText(`${layerClassName(layer.name)}.${extension}`, code);
}

function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
