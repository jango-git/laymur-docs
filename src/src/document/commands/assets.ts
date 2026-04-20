import { consoleDebug } from "../../miscellaneous/debug.print";
import { EStoreDeltaOperation } from "../signals";
import type { EStoreSignalsAssets } from "../signals/assets";
import type { EDocument, PartialExceptUUIDField } from "../types";
import { clone } from "../types";
import type { EAnyAsset, EFontAsset, EImageAsset } from "../types.assets";
import { EAssetType } from "../types.assets";
import type { EAssetUUID } from "../types.misc";

export class EStoreCommandsAssets {
  constructor(
    private readonly data: EDocument,
    private readonly signals: EStoreSignalsAssets,
  ) {}

  public add(asset: EAnyAsset): void {
    const stored = clone(asset);
    this.data.assets.push(stored);
    consoleDebug("[EStoreCommandsAssets] command 'add' was evaluated", asset);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.ADD, asset: clone(stored) });
  }

  public remove(uuid: EAssetUUID): void {
    const index = this.data.assets.findIndex((asset) => asset.uuid === uuid);
    if (index === -1) {
      throw new Error(`[EStoreCommandsAssets] Asset not found: (uuid: ${uuid})`);
    }
    this.data.assets.splice(index, 1);
    consoleDebug("[EStoreCommandsAssets] command 'remove' was evaluated", uuid);
    this.signals["emitList"]({ operation: EStoreDeltaOperation.REMOVE, uuid });
  }

  public reorder(uuids: EAssetUUID[]): void {
    const uuidsCopy = clone(uuids);
    this.data.assets.sort(
      (first, second) => uuidsCopy.indexOf(first.uuid) - uuidsCopy.indexOf(second.uuid),
    );
    consoleDebug("[EStoreCommandsAssets] command 'reorder' was evaluated", uuids);
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
    consoleDebug("[EStoreCommandsAssets] command 'writeFontAsset' was evaluated", data);
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
    consoleDebug("[EStoreCommandsAssets] command 'writeImageAsset' was evaluated", data);
    this.signals["emitItem"]({ asset: clone(asset) });
  }

  private get<T extends EAnyAsset>(uuid: EAssetUUID, type: EAssetType): T {
    for (const asset of this.data.assets) {
      if (asset.type === type && asset.uuid === uuid) {
        return asset as T;
      }
    }
    throw new Error(`[EStoreCommandsAssets] Asset not found: (uuid: ${uuid}, type: ${type})`);
  }
}
