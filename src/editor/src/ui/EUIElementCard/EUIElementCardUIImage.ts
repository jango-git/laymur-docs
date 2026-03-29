/**
 * EUIElementCardUIImage — element card for UIImage elements.
 *
 * Adds a texture picker row using EUIElementPicker<AssetPickerItem>.
 */

import type { ElementState } from "../../types";
import { EUIElementPicker } from "../EUIElementPicker/EUIElementPicker";
import type { ElementCardCallbacks, ElementCardContext} from "./EUIElementCard";
import { EUIElementCard } from "./EUIElementCard";

interface AssetPickerItem {
  id: string;
  name: string;
  url: string;
  dataURL: string;
}

export class EUIElementCardUIImage extends EUIElementCard {
  constructor(
    container: HTMLElement,
    element: ElementState,
    callbacks: ElementCardCallbacks,
    context: ElementCardContext,
  ) {
    super(container, element, callbacks, context);
    this.renderFields(this.fieldsContainer);
  }

  protected renderFields(container: HTMLElement): void {
    const assetId = this.element.fieldValues["assetId"] as string | undefined;
    const assets = this.context.getAssets();
    const meta = assetId ? assets[assetId] : undefined;

    const row = document.createElement("div");
    row.className = "layer-field-row";

    const label = document.createElement("span");
    label.className = "add-field-label";
    label.textContent = "Texture";

    const picker = document.createElement("div");
    picker.className = "element-texture-row";
    picker.title = "Click to change texture";

    const thumb = document.createElement("img");
    thumb.className = "element-texture-thumb";
    thumb.src = meta?.url ?? "";

    const nameSp = document.createElement("span");
    nameSp.className = "element-texture-name";
    nameSp.textContent = meta?.name ?? "(none)";

    picker.appendChild(thumb);
    picker.appendChild(nameSp);

    picker.addEventListener("click", async (e) => {
      e.stopPropagation();
      const currentAssets = this.context.getAssets();
      const currentAssetId = this.element.fieldValues["assetId"] as string | undefined;

      const items: AssetPickerItem[] = Object.entries(currentAssets).map(([id, m]) => ({
        id,
        name: m.name,
        url: m.url,
        dataURL: m.dataURL,
      }));

      if (items.length === 0) {return;}

      const pickerModal = new EUIElementPicker<AssetPickerItem>({
        items,
        getId: (item) => item.id,
        renderItem: (item) => {
          const wrapper = document.createElement("div");
          wrapper.className = "picker-item-content";
          const img = document.createElement("img");
          img.src = item.url;
          img.className = "picker-btn-thumb";
          const name = document.createElement("span");
          name.className = "picker-btn-name";
          name.textContent = item.name;
          wrapper.appendChild(img);
          wrapper.appendChild(name);
          return wrapper;
        },
        filterItem: (item, query) => item.name.toLowerCase().includes(query),
        currentId: currentAssetId ?? null,
      });

      const newId = await pickerModal.open();
      if (!newId || newId === this.element.fieldValues["assetId"]) {return;}

      this.element.fieldValues["assetId"] = newId;
      const newMeta = this.context.getAssets()[newId];
      thumb.src = newMeta?.url ?? "";
      nameSp.textContent = newMeta?.name ?? "(none)";
      this.callbacks.onTextureChange(this.element.id, newId, newMeta?.dataURL ?? "");
    });

    row.appendChild(label);
    row.appendChild(picker);
    container.appendChild(row);
  }
}
