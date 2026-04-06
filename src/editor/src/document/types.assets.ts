import type { EAssetUuid } from "./types.misc";

export enum EAssetType {
  FONT = "FONT",
  IMAGE = "IMAGE",
}

interface EAsset {
  uuid: EAssetUuid;
  type: EAssetType;
  name: string;
  dataURL: string;
}

export interface EFontAsset extends EAsset {
  type: EAssetType.FONT;
}

export interface EImageAsset extends EAsset {
  type: EAssetType.IMAGE;
}

export type EAnyAsset = EFontAsset | EImageAsset;
