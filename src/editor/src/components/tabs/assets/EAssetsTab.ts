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
    const scrollArea = document.createElement("div");
    scrollArea.className = "tab-scroll-area";
    container.appendChild(scrollArea);

    const cardList = document.createElement("div");
    cardList.id = "assets-grid";
    scrollArea.appendChild(cardList);
    this.cardList = cardList;

    const footer = document.createElement("div");
    footer.className = "tab-footer";
    container.appendChild(footer);

    const addButton = document.createElement("button");
    addButton.id = "button-add-asset";
    addButton.className = "button-primary";
    addButton.textContent = "+ Add Texture";
    footer.appendChild(addButton);

    const fileInput = document.createElement("input");
    fileInput.id = "input-asset-file";
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.hidden = true;
    footer.appendChild(fileInput);

    addButton.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      this.handleFiles(fileInput.files);
      fileInput.value = "";
    });

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
