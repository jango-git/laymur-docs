import type { EStoreSignalsAssets } from "../signals";
import { EStoreDeltaOperation } from "../signals";
import type { EDocument, PartialExceptUUIDField } from "../types";
import { clone } from "../types";
import type { EAnyAsset, EFontAsset, EImageAsset } from "../types.assets";
import { EAssetType } from "../types.assets";
import type { UUID } from "../types.misc";

export class EStoreCommandsAssets {
  constructor(
    private readonly data: EDocument,
    private readonly signals: EStoreSignalsAssets,
  ) {}

  public add(asset: EAnyAsset): void {
    const stored = clone(asset);
    this.data.assets.push(stored);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.ADD, asset: clone(stored) });
  }

  public remove(uuid: UUID): void {
    const index = this.data.assets.findIndex((asset) => asset.uuid === uuid);
    if (index === -1) {
      throw new Error(`[EStoreCommandsAssets] Asset not found: (uuid: ${uuid})`);
    }
    this.data.assets.splice(index, 1);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REMOVE, uuid });
  }

  public reorder(uuids: UUID[]): void {
    const uuidsCopy = clone(uuids);
    this.data.assets.sort(
      (first, second) => uuidsCopy.indexOf(first.uuid) - uuidsCopy.indexOf(second.uuid),
    );
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REORDER, uuids: clone(uuidsCopy) });
  }

  public writeFontAsset(data: PartialExceptUUIDField<EFontAsset>): void {
    const copy = clone(data);
    const asset = this.get(copy.uuid, EAssetType.FONT);
    if (copy.name !== undefined) {
      asset.name = copy.name;
    }
    if (copy.dataURL !== undefined) {
      asset.dataURL = copy.dataURL;
    }
    this.signals["emitItem"]({ asset: clone(asset) });
  }

  public writeImageAsset(data: PartialExceptUUIDField<EImageAsset>): void {
    const copy = clone(data);
    const asset = this.get(copy.uuid, EAssetType.IMAGE);
    if (copy.name !== undefined) {
      asset.name = copy.name;
    }
    if (copy.dataURL !== undefined) {
      asset.dataURL = copy.dataURL;
    }
    this.signals["emitItem"]({ asset: clone(asset) });
  }

  private get(uuid: UUID, type: EAssetType.FONT): EFontAsset;
  private get(uuid: UUID, type: EAssetType.IMAGE): EImageAsset;
  private get<T extends EAnyAsset>(uuid: UUID, type: EAssetType): T {
    for (const asset of this.data.assets) {
      if (asset.type === type && asset.uuid === uuid) {
        return asset as T;
      }
    }
    throw new Error(`[EStoreCommandsAssets] Asset not found: (uuid: ${uuid}, type: ${type})`);
  }
}
