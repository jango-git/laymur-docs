import type {
  EArrayControlItem,
  EArrayControlTemplate,
} from "../../../controls/EArrayControl/EArrayControl";
import { EAssetControl } from "../../../controls/EAssetControl/EAssetControl";
import { EBoolControl } from "../../../controls/EBoolControl/EBoolControl";
import { EColorControl } from "../../../controls/EColorControl/EColorControl";
import { ENumberControl } from "../../../controls/ENumberControl/ENumberControl";
import type { ESelectControlOption } from "../../../controls/ESelectControl/ESelectControl";
import { ESelectControl } from "../../../controls/ESelectControl/ESelectControl";
import { EStringControl } from "../../../controls/EStringControl/EStringControl";
import { STORE } from "../../../document/store";
import type { EFontAsset } from "../../../document/types.assets";
import type { ETextChunk } from "../../../document/types.misc";
import {
  ETextAlign,
  ETextFontStyle,
  ETextFontWeight,
  ETextResizeMode,
} from "../../../document/types.misc";
import { generateAssetUUID } from "../../../miscellaneous/generate-uuid";
import { makeRow } from "../../../miscellaneous/rows";

const ALIGN_OPTIONS: ESelectControlOption<ETextAlign>[] = [
  { label: "Left", value: ETextAlign.LEFT },
  { label: "Center", value: ETextAlign.CENTER },
  { label: "Right", value: ETextAlign.RIGHT },
];

const FONT_STYLE_OPTIONS: ESelectControlOption<ETextFontStyle>[] = [
  { label: "Normal", value: ETextFontStyle.NORMAL },
  { label: "Italic", value: ETextFontStyle.ITALIC },
  { label: "Oblique", value: ETextFontStyle.OBLIQUE },
];

const FONT_WEIGHT_OPTIONS: ESelectControlOption<ETextFontWeight>[] = [
  { label: "Normal", value: ETextFontWeight.NORMAL },
  { label: "Bold", value: ETextFontWeight.BOLD },
  { label: "Bolder", value: ETextFontWeight.BOLDER },
  { label: "Lighter", value: ETextFontWeight.LIGHTER },
];

export const RESIZE_MODE_OPTIONS: ESelectControlOption<ETextResizeMode>[] = [
  { label: "Scale", value: ETextResizeMode.SCALE },
  { label: "Break", value: ETextResizeMode.BREAK },
];

const DEFAULT_CHUNK_STYLE: ETextChunk["style"] = {
  color: { color: "#ffffff", alpha: 255 },
  align: ETextAlign.LEFT,
  font: generateAssetUUID(),
  fontSize: 16,
  fontStyle: ETextFontStyle.NORMAL,
  fontWeight: ETextFontWeight.NORMAL,
  lineHeight: 1.2,
  enableShadow: false,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: { color: "#000000", alpha: 1 },
  enableStroke: false,
  strokeColor: { color: "#000000", alpha: 1 },
  strokeThickness: 1,
};

export const contentTemplate: EArrayControlTemplate<ETextChunk> = {
  createDefault: (): ETextChunk => ({ text: "", style: { ...DEFAULT_CHUNK_STYLE } }),

  buildItem(container, value, onChange): EArrayControlItem<ETextChunk> {
    const { text, style } = value;

    const textRow = makeRow(container, "Text");
    const textCtrl = new EStringControl(textRow, { value: text });
    textCtrl.signalValueChanged.on(() => onChange());

    const colorRow = makeRow(container, "Color");
    const colorCtrl = new EColorControl(colorRow, { value: style.color });
    colorCtrl.signalValueChanged.on(() => onChange());

    const alignRow = makeRow(container, "Align");
    const alignCtrl = new ESelectControl<ETextAlign>(alignRow, {
      options: ALIGN_OPTIONS,
      value: style.align,
    });
    alignCtrl.signalValueChanged.on(() => onChange());

    const fontRow = makeRow(container, "Font");
    const fontCtrl = new EAssetControl<EFontAsset>(
      fontRow,
      () => STORE.selectors.assets.selectAllFonts(),
      {
        value: STORE.selectors.assets.selectFont(style.font),
        nullable: true,
      },
    );
    fontCtrl.signalValueChanged.on(() => onChange());

    const fontSizeRow = makeRow(container, "Size");
    const fontSizeCtrl = new ENumberControl(fontSizeRow, {
      value: style.fontSize,
      min: 1,
      max: 500,
      step: 1,
      precision: 0,
    });
    fontSizeCtrl.signalValueChanged.on(() => onChange());

    const fontStyleRow = makeRow(container, "Font Style");
    const fontStyleCtrl = new ESelectControl<ETextFontStyle>(fontStyleRow, {
      options: FONT_STYLE_OPTIONS,
      value: style.fontStyle,
    });
    fontStyleCtrl.signalValueChanged.on(() => onChange());

    const fontWeightRow = makeRow(container, "Weight");
    const fontWeightCtrl = new ESelectControl<ETextFontWeight>(fontWeightRow, {
      options: FONT_WEIGHT_OPTIONS,
      value: style.fontWeight,
    });
    fontWeightCtrl.signalValueChanged.on(() => onChange());

    const lineHeightRow = makeRow(container, "Line H");
    const lineHeightCtrl = new ENumberControl(lineHeightRow, {
      value: style.lineHeight,
      min: 0,
      max: 10,
      step: 0.1,
      precision: 2,
    });
    lineHeightCtrl.signalValueChanged.on(() => onChange());

    // Shadow
    const shadowRow = makeRow(container, "Shadow");
    const enableShadowCtrl = new EBoolControl(shadowRow, { value: style.enableShadow });

    const shadowGroup = document.createElement("div");
    shadowGroup.style.display = style.enableShadow ? "" : "none";
    container.appendChild(shadowGroup);

    const shadowOffXRow = makeRow(shadowGroup, "S.Offset X");
    const shadowOffXCtrl = new ENumberControl(shadowOffXRow, {
      value: style.shadowOffsetX,
      min: -100,
      max: 100,
      step: 1,
      precision: 1,
    });
    const shadowOffYRow = makeRow(shadowGroup, "S.Offset Y");
    const shadowOffYCtrl = new ENumberControl(shadowOffYRow, {
      value: style.shadowOffsetY,
      min: -100,
      max: 100,
      step: 1,
      precision: 1,
    });
    const shadowBlurRow = makeRow(shadowGroup, "S.Blur");
    const shadowBlurCtrl = new ENumberControl(shadowBlurRow, {
      value: style.shadowBlur,
      min: 0,
      max: 100,
      step: 1,
      precision: 1,
    });
    const shadowColorRow = makeRow(shadowGroup, "S.Color");
    const shadowColorCtrl = new EColorControl(shadowColorRow, { value: style.shadowColor });

    enableShadowCtrl.signalValueChanged.on((next) => {
      shadowGroup.style.display = next ? "" : "none";
      onChange();
    });
    shadowOffXCtrl.signalValueChanged.on(() => onChange());
    shadowOffYCtrl.signalValueChanged.on(() => onChange());
    shadowBlurCtrl.signalValueChanged.on(() => onChange());
    shadowColorCtrl.signalValueChanged.on(() => onChange());

    // Stroke
    const strokeRow = makeRow(container, "Stroke");
    const enableStrokeCtrl = new EBoolControl(strokeRow, { value: style.enableStroke });

    const strokeGroup = document.createElement("div");
    strokeGroup.style.display = style.enableStroke ? "" : "none";
    container.appendChild(strokeGroup);

    const strokeColorRow = makeRow(strokeGroup, "St.Color");
    const strokeColorCtrl = new EColorControl(strokeColorRow, { value: style.strokeColor });
    const strokeThickRow = makeRow(strokeGroup, "St.Thickness");
    const strokeThickCtrl = new ENumberControl(strokeThickRow, {
      value: style.strokeThickness,
      min: 0,
      max: 100,
      step: 0.5,
      precision: 1,
    });

    enableStrokeCtrl.signalValueChanged.on((next) => {
      strokeGroup.style.display = next ? "" : "none";
      onChange();
    });
    strokeColorCtrl.signalValueChanged.on(() => onChange());
    strokeThickCtrl.signalValueChanged.on(() => onChange());

    return {
      getValue: (): ETextChunk => ({
        text: textCtrl.value,
        style: {
          color: colorCtrl.value,
          align: alignCtrl.value,
          font: fontCtrl.value?.uuid ?? generateAssetUUID(),
          fontSize: fontSizeCtrl.value,
          fontStyle: fontStyleCtrl.value,
          fontWeight: fontWeightCtrl.value,
          lineHeight: lineHeightCtrl.value,
          enableShadow: enableShadowCtrl.value,
          shadowOffsetX: shadowOffXCtrl.value,
          shadowOffsetY: shadowOffYCtrl.value,
          shadowBlur: shadowBlurCtrl.value,
          shadowColor: shadowColorCtrl.value,
          enableStroke: enableStrokeCtrl.value,
          strokeColor: strokeColorCtrl.value,
          strokeThickness: strokeThickCtrl.value,
        },
      }),
      destroy: (): void => {
        fontCtrl.destroy();
      },
    };
  },
};
