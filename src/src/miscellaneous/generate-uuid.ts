import type { EAssetUUID, EConstraintUUID, EElementUUID, ELayerUUID } from "../document/types.misc";

export function generateAssetUUID(): EAssetUUID {
  return crypto.randomUUID() as EAssetUUID;
}

export function generateLayerUUID(): ELayerUUID {
  return crypto.randomUUID() as ELayerUUID;
}

export function generateElementUUID(): EElementUUID {
  return crypto.randomUUID() as EElementUUID;
}

export function generateConstraintUUID(): EConstraintUUID {
  return crypto.randomUUID() as EConstraintUUID;
}
