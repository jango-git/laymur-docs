import { EStoreDeltaOperation } from "../../../document/signals";
import type { EStoreDeltaAssetList } from "../../../document/signals/assets";
import { STORE } from "../../../document/store";
import type { EAnyAsset } from "../../../document/types.assets";
import { EAssetType } from "../../../document/types.assets";
import type { UUID } from "../../../document/types.misc";
import { consoleDebug } from "../../../miscellaneous/debug.print";
import { EFontAssetCard } from "../../cards/assets/EFontAssetCard";
import { EImageAssetCard } from "../../cards/assets/EImageAssetCard";
import { EExportJSAction } from "./actions/EExportJSAction";
import { EExportTSAction } from "./actions/EExportTSAction";
import { ELoadAction } from "./actions/ELoadAction";
import { EResetAction } from "./actions/EResetAction";
import { ESaveAction } from "./actions/ESaveAction";

export class EProjectTab {
  private readonly cardList: HTMLElement;
  private readonly cardMap = new Map<string, HTMLElement>();

  private readonly loadAction = new ELoadAction();
  private readonly saveAction = new ESaveAction();
  private readonly resetAction = new EResetAction();
  private readonly exportTSAction = new EExportTSAction();
  private readonly exportJSAction = new EExportJSAction();

  private readonly imageFileInput: HTMLInputElement;
  private readonly fontFileInput: HTMLInputElement;

  constructor(container: HTMLElement) {
    // Header
    {
      const header = document.createElement("div");
      header.className = "project-header";
      container.appendChild(header);

      const loadButton = document.createElement("button");
      loadButton.className = "button-secondary";
      loadButton.textContent = "Load";
      loadButton.addEventListener("click", this.onLoadClick);
      header.appendChild(loadButton);

      const saveButton = document.createElement("button");
      saveButton.className = "button-secondary";
      saveButton.textContent = "Save";
      saveButton.addEventListener("click", this.onSaveClick);
      header.appendChild(saveButton);

      const resetButton = document.createElement("button");
      resetButton.className = "button-secondary";
      resetButton.textContent = "Reset";
      resetButton.addEventListener("click", this.onResetClick);
      header.appendChild(resetButton);

      const exportTSButton = document.createElement("button");
      exportTSButton.className = "button-secondary";
      exportTSButton.textContent = "Export TS";
      exportTSButton.addEventListener("click", this.onExportTSClick);
      header.appendChild(exportTSButton);

      const exportJSButton = document.createElement("button");
      exportJSButton.className = "button-secondary";
      exportJSButton.textContent = "Export JS";
      exportJSButton.addEventListener("click", this.onExportJSClick);
      header.appendChild(exportJSButton);
    }

    // Body
    {
      const scrollArea = document.createElement("div");
      scrollArea.className = "tab-scroll-area";
      container.appendChild(scrollArea);

      const cardList = document.createElement("div");
      cardList.id = "assets-grid";
      scrollArea.appendChild(cardList);
      this.cardList = cardList;
    }

    // Footer
    {
      const footer = document.createElement("div");
      footer.className = "tab-footer";
      container.appendChild(footer);

      const addImageButton = document.createElement("button");
      addImageButton.className = "button-primary";
      addImageButton.textContent = "+ Add Image";
      addImageButton.addEventListener("click", this.onAddImageClick);
      footer.appendChild(addImageButton);

      const addFontButton = document.createElement("button");
      addFontButton.className = "button-primary";
      addFontButton.textContent = "+ Add Font";
      addFontButton.addEventListener("click", this.onAddFontClick);
      footer.appendChild(addFontButton);

      const imageFileInput = document.createElement("input");
      imageFileInput.type = "file";
      imageFileInput.accept = "image/*";
      imageFileInput.multiple = true;
      imageFileInput.hidden = true;
      imageFileInput.addEventListener("change", this.onImageFileChange);
      footer.appendChild(imageFileInput);
      this.imageFileInput = imageFileInput;

      const fontFileInput = document.createElement("input");
      fontFileInput.type = "file";
      fontFileInput.accept = ".ttf,.otf,.woff,.woff2";
      fontFileInput.multiple = true;
      fontFileInput.hidden = true;
      fontFileInput.addEventListener("change", this.onFontFileChange);
      footer.appendChild(fontFileInput);
      this.fontFileInput = fontFileInput;

      STORE.signals.setup.on(this.onSetup);
      STORE.signals.assets.list.on(this.onAssetsListChange);

      for (const asset of STORE.selectors.assets.selectAll()) {
        this.addCard(asset);
      }
    }
  }

  private addCard(asset: EAnyAsset): void {
    if (asset.type === EAssetType.FONT) {
      new EFontAssetCard(this.cardList, asset.uuid);
    } else {
      new EImageAssetCard(this.cardList, asset.uuid);
    }

    this.cardMap.set(asset.uuid, this.cardList.lastElementChild as HTMLElement);
  }

  private removeCard(uuid: UUID): void {
    this.cardMap.get(uuid)?.remove();
    this.cardMap.delete(uuid);
  }

  private handleImageFiles(files: FileList | null): void {
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

  private handleFontFiles(files: FileList | null): void {
    if (!files) {
      return;
    }
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (): void => {
        STORE.commands.assets.add({
          uuid: crypto.randomUUID(),
          type: EAssetType.FONT,
          name: file.name,
          dataURL: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  private readonly onAssetsListChange = (delta: EStoreDeltaAssetList): void => {
    consoleDebug("[EProjectTab] onAssetsListChange:", delta);
    if (delta.operation === EStoreDeltaOperation.ADD) {
      this.addCard(delta.asset);
    } else if (delta.operation === EStoreDeltaOperation.REMOVE) {
      this.removeCard(delta.uuid);
    }
  };

  private readonly onLoadClick = (): void => {
    this.loadAction.execute();
  };

  private readonly onSaveClick = (): void => {
    this.saveAction.execute();
  };

  private readonly onResetClick = (): void => {
    this.resetAction.execute();
  };

  private readonly onExportTSClick = (): void => {
    this.exportTSAction.execute();
  };

  private readonly onExportJSClick = (): void => {
    this.exportJSAction.execute();
  };

  private readonly onAddImageClick = (): void => {
    this.imageFileInput.click();
  };

  private readonly onAddFontClick = (): void => {
    this.fontFileInput.click();
  };

  private readonly onImageFileChange = (): void => {
    consoleDebug("[EProjectTab] onImageFileChange");
    this.handleImageFiles(this.imageFileInput.files);
    this.imageFileInput.value = "";
  };

  private readonly onFontFileChange = (): void => {
    consoleDebug("[EProjectTab] onFontFileChange");
    this.handleFontFiles(this.fontFileInput.files);
    this.fontFileInput.value = "";
  };

  private readonly onSetup = (): void => {
    consoleDebug("[EProjectTab] onSetup");
    for (const wrapper of this.cardMap.values()) {
      wrapper.remove();
    }
    this.cardMap.clear();

    for (const asset of STORE.selectors.assets.selectAll()) {
      this.addCard(asset);
    }
  };
}
