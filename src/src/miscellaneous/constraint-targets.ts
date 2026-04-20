import { STORE } from "../document/store";
import type { EAnyElement } from "../document/types.elements";
import { EElementType } from "../document/types.elements";
import type { EElementUUID, ELayerUUID } from "../document/types.misc";
import { UI_STATE } from "../ui-state/EUIState";

export interface EElementConstraintTarget {
  uuid: EElementUUID;
  name: string;
  dataURL: string;
}

export interface EUniversalConstraintTarget {
  uuid: ELayerUUID | EElementUUID;
  name: string;
  dataURL: string;
}

const ELEMENT_THUMBNAIL =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='%23ddd'/></svg>";

function buildElementThubnail(element: EAnyElement): string {
  let thumbnail = ELEMENT_THUMBNAIL;

  switch (element.type) {
    case EElementType.IMAGE:
    case EElementType.NINE_SLICE:
    case EElementType.PROGRESS:
      {
        const asset = STORE.selectors.assets.selectImage(element.texture);
        if (asset) {
          thumbnail = asset.dataURL;
        }
      }
      break;
    case EElementType.ANIMATED_IMAGE:
      {
        if (element.sequence.length > 0) {
          const asset = STORE.selectors.assets.selectImage(element.sequence[0]);
          if (asset) {
            thumbnail = asset.dataURL;
          }
        }
      }
      break;

    case EElementType.GRAPHICS:
    case EElementType.SCENE:
    case EElementType.TEXT:

    default:
      break;
  }

  return thumbnail;
}

export function getElementConstraintTargets(): EElementConstraintTarget[] {
  const layerUuid = UI_STATE.activeLayerUuid;
  if (layerUuid === undefined) {
    return [];
  }

  return STORE.selectors.elements.selectAll(layerUuid).map((element): EElementConstraintTarget => {
    return {
      uuid: element.uuid,
      name: element.name,
      dataURL: buildElementThubnail(element),
    };
  });
}

export function getUniversalConstraintTargets(): EUniversalConstraintTarget[] {
  const layerUuid = UI_STATE.activeLayerUuid;
  if (layerUuid === undefined) {
    return [];
  }
  const constraintTargets = getElementConstraintTargets();
  const layer = STORE.selectors.layers.select(layerUuid);
  if (layer === undefined) {
    return constraintTargets;
  }
  return [...constraintTargets, { uuid: layer.uuid, name: layer.name, dataURL: ELEMENT_THUMBNAIL }];
}
