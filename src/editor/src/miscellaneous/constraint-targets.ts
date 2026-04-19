import { STORE } from "../document/store";
import type { EElementUUID, ELayerUUID } from "../document/types.misc";
import { UI_STATE } from "../ui-state/EUIState";

export interface EElementConstraintTarget {
  uuid: EElementUUID;
  name: string;
  dataURL: string;
}

export interface EUniversalConstraintTarget {
  uuid: EElementUUID | ELayerUUID;
  name: string;
  dataURL: string;
}

const ELEMENT_THUMBNAIL =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='%23ddd'/></svg>";

export function getElementConstraintTargets(): EElementConstraintTarget[] {
  const layerUuid = UI_STATE.activeLayerUuid;
  if (layerUuid === undefined) {
    return [];
  }

  return STORE.selectors.elements.selectAll(layerUuid).map((element) => ({
    uuid: element.uuid,
    name: element.name,
    dataURL: ELEMENT_THUMBNAIL,
  }));
}

export function getUniversalConstraintTargets(): EUniversalConstraintTarget[] {
  const layerUuid = UI_STATE.activeLayerUuid;
  if (layerUuid === undefined) {
    return [];
  }
  const constraintTargets = getElementConstraintTargets();
  const layer = STORE.selectors.constraints.selectLayerInfo(layerUuid);
  if (layer === undefined) {
    return constraintTargets;
  }
  return [...constraintTargets, { uuid: layer.uuid, name: layer.name, dataURL: ELEMENT_THUMBNAIL }];
}
