import type { FerrsignView2 } from "ferrsign";
import type { PreviewBridge } from "../../bridge/PreviewBridge";
import type { EBuilderForm } from "../../builder/EBuilder";
import { buildAssetRow, buildStringRow } from "../../builder/form-helpers";
import type { ECardUIImageModel } from "../../cards/element/ECardUIImage";
import { ECardUIImage } from "../../cards/element/ECardUIImage";
import type { EAssetControlItem } from "../../controls/EAssetControl/EAssetControl";

export const DEFAULT_COLOR = "#ffffffff";

export interface BuildCtx {
  fetchTextures(): EAssetControlItem[];
}

export interface CardCtx extends BuildCtx {
  validateName(name: string): string | null;
}

export interface CardHandle {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly signalModelChanged: FerrsignView2<any, any>;
  readonly signalDeleteRequested: FerrsignView2<undefined, undefined>;
  destroy(): void;
}

export interface RegistryEntry {
  label: string;
  createCard(container: HTMLElement, model: { name: string }, ctx: CardCtx): CardHandle;
  buildForm(container: HTMLElement, onChange: () => void, ctx: BuildCtx): EBuilderForm<unknown>;
  validate(model: unknown, existingNames: string[]): string | null;
  toElementModel(builderModel: unknown): { name: string };
  onAdd(id: string, layerId: string, model: { name: string }, bridge: PreviewBridge): void;
  onModelChange(
    id: string,
    layerId: string,
    prev: { name: string },
    next: { name: string },
    bridge: PreviewBridge,
  ): void;
}

export interface UIElement {
  id: string;
  type: UIElementType;
  model: { name: string };
}

export type UIElementType = "UIImage";

interface UIImageBuilderModel {
  name: string;
  texture: EAssetControlItem;
}

export const ELEMENT_REGISTRY: Record<UIElementType, RegistryEntry> = {
  UIImage: {
    label: "UI Image",

    createCard(container, model, ctx): CardHandle {
      return new ECardUIImage(container, model as ECardUIImageModel, ctx);
    },

    buildForm(container, onChange, ctx): EBuilderForm<unknown> {
      const name = buildStringRow(container, "Name", onChange, { placeholder: "element name" });
      const texture = buildAssetRow(container, "Texture", onChange, () => ctx.fetchTextures());
      return {
        getModel: (): UIImageBuilderModel => ({
          name: name.getValue(),
          texture: texture.getValue() ?? { name: "", thumbnail: "" },
        }),
        reset: () => {
          name.reset();
          texture.reset();
        },
        destroy: () => {
          name.destroy();
          texture.destroy();
        },
      };
    },

    validate(model, existingNames): string | null {
      const m = model as UIImageBuilderModel;
      if (m.name.trim() === "") {
        return "Name is required";
      }
      if (existingNames.includes(m.name)) {
        return "Name already taken";
      }
      if (!m.texture || m.texture.thumbnail === "") {
        return "Texture is required";
      }
      return null;
    },

    toElementModel(builderModel): ECardUIImageModel {
      const m = builderModel as UIImageBuilderModel;
      return { name: m.name, color: DEFAULT_COLOR, texture: m.texture };
    },

    onAdd(id, layerId, model, bridge): void {
      const m = model as ECardUIImageModel;
      bridge.addImage(id, layerId, m.texture.thumbnail, m.color);
    },

    onModelChange(id, layerId, prev, next, bridge): void {
      const p = prev as ECardUIImageModel;
      const n = next as ECardUIImageModel;
      if (p.texture !== n.texture) {
        bridge.setImageTexture(id, layerId, n.texture.thumbnail);
      }
      if (p.color !== n.color) {
        bridge.setElementColor(id, layerId, n.color);
      }
    },
  },
};
