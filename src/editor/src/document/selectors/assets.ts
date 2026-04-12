import type { EDocument } from "../types";
import { clone } from "../types";
import type { EAnyAsset, EFontAsset, EImageAsset } from "../types.assets";
import { EAssetType } from "../types.assets";
import type { EAssetUuid } from "../types.misc";

export class EStoreSelectorsAssets {
  constructor(private readonly data: EDocument) {}

  public selectAll(): EAnyAsset[] {
    return clone(this.data.assets);
  }

  public selectAllFonts(): EFontAsset[] {
    return clone(this.data.assets.filter((asset): asset is EFontAsset => asset.type === EAssetType.FONT));
  }

  public selectAllImages(): EImageAsset[] {
    return clone(this.data.assets.filter((asset): asset is EImageAsset => asset.type === EAssetType.IMAGE));
  }

  public selectFont(uuid: EAssetUuid): EFontAsset | undefined {
    return this.selectAllFonts().find((asset): asset is EFontAsset => asset.uuid === uuid);
  }

  public selectImage(uuid: EAssetUuid): EImageAsset | undefined {
    return this.selectAllImages().find((asset): asset is EImageAsset => asset.uuid === uuid);
  }
}
