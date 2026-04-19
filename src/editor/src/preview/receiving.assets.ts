import { UIAnimatedImage, UIImage, UINineSlice, UIProgress, UIText } from "laymur";
import { Texture } from "three";
import { clone } from "../document/types";
import type { EAnyAsset } from "../document/types.assets";
import { EAssetType } from "../document/types.assets";
import type { UUID } from "../document/types.misc";
import {
  ASSET_DATABASE,
  LAYER_DATABASE,
  loadTexture,
  resolveFontAsset,
  resolveTextureAsset,
} from "./internal";

export async function updateAsset(asset: EAnyAsset): Promise<void> {
  if (asset.type === EAssetType.FONT) {
    const oldFontFace = resolveFontAsset(asset.uuid);
    document.fonts.delete(oldFontFace);

    const fontFace = new FontFace(asset.name, `url(${asset.dataURL})`);
    await fontFace.load();
    document.fonts.add(fontFace);
    ASSET_DATABASE.set(asset.uuid, fontFace);

    for (const layerContext of LAYER_DATABASE.values()) {
      for (const element of layerContext.elements.values()) {
        if (
          !(element instanceof UIText) ||
          !element.content.some((span) => span.style.fontFamily === oldFontFace.family)
        ) {
          continue;
        }
        element.content = element.content.map((span) => {
          const result = clone(span);
          if (span.style.fontFamily === oldFontFace.family) {
            result.style.fontFamily = fontFace.family;
          }
          return result;
        });
      }
    }
  } else {
    const oldTexture = resolveTextureAsset(asset.uuid);
    const newTexture = await loadTexture(asset.dataURL);

    for (const ctx of LAYER_DATABASE.values()) {
      for (const element of ctx.elements.values()) {
        if (element instanceof UIAnimatedImage) {
          for (const frame of element.sequence) {
            if (frame.texture === oldTexture) {
              frame.set(newTexture);
            }
          }
        } else if (
          element instanceof UIImage ||
          element instanceof UINineSlice ||
          element instanceof UIProgress
        ) {
          if (element.texture.texture === oldTexture) {
            element.texture.set(newTexture);
          }
        }
      }
    }

    oldTexture.dispose();
    ASSET_DATABASE.set(asset.uuid, newTexture);
  }
}

export function removeAsset(uuid: UUID): void {
  const asset = ASSET_DATABASE.get(uuid);
  if (!asset) {
    throw new Error(`Asset not found: ${uuid}`);
  }

  if (asset instanceof Texture) {
    for (const ctx of LAYER_DATABASE.values()) {
      for (const element of ctx.elements.values()) {
        if (element instanceof UIAnimatedImage) {
          for (const frame of element.sequence) {
            if (frame.texture === asset) {
              throw new Error("Cannot remove texture in use");
            }
          }
        } else if (
          element instanceof UIImage ||
          element instanceof UINineSlice ||
          element instanceof UIProgress
        ) {
          if (element.texture.texture === asset) {
            throw new Error("Cannot remove texture in use");
          }
        }
      }
    }
    asset.dispose();
  } else {
    for (const ctx of LAYER_DATABASE.values()) {
      for (const element of ctx.elements.values()) {
        if (element instanceof UIText) {
          for (const span of element.content) {
            if (span.style.fontFamily === asset.family) {
              throw new Error("Cannot remove font in use");
            }
          }
        }
      }
    }
    document.fonts.delete(asset);
  }

  ASSET_DATABASE.delete(uuid);
}
