import { EStoreDeltaOperation } from "../../../document/signals";
import { STORE } from "../../../document/store";
import type { EAnyAsset } from "../../../document/types.assets";
import { EAssetType } from "../../../document/types.assets";
import { EFontAssetCard } from "../../cards/assets/EFontAssetCard";
import { EImageAssetCard } from "../../cards/assets/EImageAssetCard";

export class EAssetsTab {
  private readonly cardList: HTMLElement;
  private readonly cardMap = new Map<string, HTMLElement>();

  constructor(container: HTMLElement) {
    const cardList = container.querySelector<HTMLElement>("#assets-grid");
    if (!cardList) {
      throw new Error("[EAssetsTab] #assets-grid not found");
    }
    this.cardList = cardList;

    const addButton = container.querySelector<HTMLButtonElement>("#button-add-asset");
    const fileInput = container.querySelector<HTMLInputElement>("#input-asset-file");
    if (addButton && fileInput) {
      addButton.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => {
        this.handleFiles(fileInput.files);
        fileInput.value = "";
      });
    }

    STORE.signals.assets.list.on((delta) => {
      if (delta.operation === EStoreDeltaOperation.ADD) {
        this.addCard(delta.asset);
      } else if (delta.operation === EStoreDeltaOperation.REMOVE) {
        this.removeCard(delta.uuid);
      }
    });

    for (const asset of STORE.selectors.assets.selectAll()) {
      this.addCard(asset);
    }
  }

  private addCard(asset: EAnyAsset): void {
    const wrapper = document.createElement("div");
    wrapper.dataset.uuid = asset.uuid;
    this.cardList.appendChild(wrapper);

    if (asset.type === EAssetType.FONT) {
      new EFontAssetCard(wrapper, asset.uuid);
    } else {
      new EImageAssetCard(wrapper, asset.uuid);
    }

    this.cardMap.set(asset.uuid, wrapper);
  }

  private removeCard(uuid: string): void {
    this.cardMap.get(uuid)?.remove();
    this.cardMap.delete(uuid);
  }

  private handleFiles(files: FileList | null): void {
    if (!files) {
      return;
    }
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (): void => {
        STORE.commands.assets.add({
          uuid: crypto.randomUUID(),
          type: EAssetType.IMAGE,
          name: file.name,
          dataURL: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
