import type { EAssetControlItem } from "../../controls/EAssetControl/EAssetControl";
import { EAssetControl } from "../../controls/EAssetControl/EAssetControl";
import { EColorControl } from "../../controls/EColorControl/EColorControl";
import { EElementCard } from "./EElementCard";

export interface ECardUIImageModel {
  name: string;
  color: string; // #RRGGBBAA
  texture: EAssetControlItem;
}

export interface ECardUIImageContext {
  validateName(name: string): string | null;
  fetchTextures(): EAssetControlItem[];
}

export class ECardUIImage extends EElementCard<ECardUIImageModel> {
  private readonly colorControl: EColorControl;
  private readonly textureControl: EAssetControl<EAssetControlItem>;

  constructor(container: HTMLElement, model: ECardUIImageModel, context: ECardUIImageContext) {
    super(container, model, "UIImage", context);

    this.colorControl = new EColorControl(this.addRow("Color"), { value: model.color });

    this.textureControl = new EAssetControl<EAssetControlItem>(
      this.addRow("Texture"),
      context.fetchTextures,
      { value: model.texture, nullable: false },
    );

    this.colorControl.signalValueChanged.on((color) => {
      const previous = { ...this.model };
      this.model = { ...this.model, color };
      this.signalModelChangedInternal.emit(this.model, previous);
    });

    this.textureControl.signalValueChanged.on((texture) => {
      if (texture === null) {
        return;
      }
      const previous = { ...this.model };
      this.model = { ...this.model, texture };
      this.signalModelChangedInternal.emit(this.model, previous);
    });
  }

  public override destroy(): void {
    this.colorControl.destroy();
    this.textureControl.destroy();
    super.destroy();
  }
}
