import type { EStoreSignalsAssets } from "../signals";
import { EStoreDeltaOperation } from "../signals";
import type { EDocument, PartialExceptUUID } from "../types";
import type { EAnyAsset, EFontAsset, EImageAsset } from "../types.assets";
import { EAssetType } from "../types.assets";
import type { EAssetUuid } from "../types.misc";

export class EStoreCommandsAssets {
  constructor(
    private readonly data: EDocument,
    private readonly signals: EStoreSignalsAssets,
  ) {}

  public add(asset: EAnyAsset): void {
    this.data.assets.push(asset);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.ADD, asset });
  }

  public remove(uuid: EAssetUuid): void {
    const index = this.data.assets.findIndex((a) => a.uuid === uuid);
    if (index === -1) {
      throw new Error(`[EStoreCommandsAssets] Asset not found: (uuid: ${uuid})`);
    }
    this.data.assets.splice(index, 1);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REMOVE, uuid });
  }

  public reorder(uuids: EAssetUuid[]): void {
    this.data.assets.sort((a, b) => uuids.indexOf(a.uuid) - uuids.indexOf(b.uuid));
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REORDER, uuids });
  }

  public writeFontAsset(data: PartialExceptUUID<EFontAsset>): void {
    const asset = this.get(data.uuid, EAssetType.FONT);
    if (data.name !== undefined) {
      asset.name = data.name;
    }
    if (data.dataURL !== undefined) {
      asset.dataURL = data.dataURL;
    }
    this.signals["emitItem"]({ asset });
  }

  public writeImageAsset(data: PartialExceptUUID<EImageAsset>): void {
    const asset = this.get(data.uuid, EAssetType.IMAGE);
    if (data.name !== undefined) {
      asset.name = data.name;
    }
    if (data.dataURL !== undefined) {
      asset.dataURL = data.dataURL;
    }
    this.signals["emitItem"]({ asset });
  }

  private get(uuid: EAssetUuid, type: EAssetType.FONT): EFontAsset;
  private get(uuid: EAssetUuid, type: EAssetType.IMAGE): EImageAsset;
  private get<T extends EAnyAsset>(uuid: EAssetUuid, type: EAssetType): T {
    for (const asset of this.data.assets) {
      if (asset.type === type && asset.uuid === uuid) {
        return asset as T;
      }
    }
    throw new Error(`[EStoreCommandsAssets] Asset not found: (uuid: ${uuid}, type: ${type})`);
  }
}
