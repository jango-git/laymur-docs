import { STORE } from "../document/store";
import type { EAnyElement } from "../document/types.elements";
import { UI_STATE } from "../ui-state/EUIState";

export interface EConstraintTarget {
  uuid: string;
  name: string;
  dataURL: string;
}

const ELEMENT_THUMBNAIL =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='%23ddd'/></svg>";

function toConstraintTargets(
  elements: EAnyElement[],
  layer?: { uuid: string; name: string },
): EConstraintTarget[] {
  const result: EConstraintTarget[] = elements.map((element) => ({
    uuid: element.uuid,
    name: element.name,
    dataURL: ELEMENT_THUMBNAIL,
  }));
  if (layer !== undefined) {
    result.push({ uuid: layer.uuid, name: layer.name, dataURL: ELEMENT_THUMBNAIL });
  }
  return result;
}

export function getConstraintElements(): EConstraintTarget[] {
  const layerUuid = UI_STATE.activeLayerUuid;
  if (layerUuid === undefined) {
    return [];
  }
  return toConstraintTargets(STORE.selectors.elements.selectAll(layerUuid));
}

export function getConstraintTargets(): EConstraintTarget[] {
  const layerUuid = UI_STATE.activeLayerUuid;
  if (layerUuid === undefined) {
    return [];
  }
  const elements = STORE.selectors.elements.selectAll(layerUuid);
  const layer = STORE.selectors.constraints.selectLayerInfo(layerUuid);
  return toConstraintTargets(elements, layer);
}
