/**
 * element-registry.ts
 *
 * Declares every UIElement type the editor can create.
 * Each entry defines:
 *   - type   : UIElement class name (shown in dropdown)
 *   - fields : ordered list of creation-time field descriptors
 *
 * To add a new element type, append an entry here - no other file needs to change.
 *
 * Supported fieldTypes:
 *   "asset"  : EUIElementPicker populated from state.assets
 *   "text"   : plain text input
 *   "number" : ENumberControl
 */

import { TEXT_STYLE_DEFAULTS } from "../types";
import { Registry } from "./Registry";

export type ElementFieldType =
  | "asset"
  | "text"
  | "textarea"
  | "number"
  | "color"
  | "select"
  | "checkbox"
  | "section";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface ElementFieldDescriptor {
  key: string;
  label: string;
  fieldType: ElementFieldType;
  required?: boolean;
  default?: string | number | boolean;
  step?: number;
  options?: SelectOption[];
}

export interface ElementDescriptor {
  type: string;
  fields: ElementFieldDescriptor[];
}

const COLOR_FIELD: ElementFieldDescriptor = {
  key: "color",
  label: "Color",
  fieldType: "color",
  default: "#ffffffff",
};

export const ELEMENT_REGISTRY = new Registry<ElementDescriptor>([
  {
    type: "UIImage",
    fields: [{ key: "assetId", label: "Texture", fieldType: "asset", required: true }, COLOR_FIELD],
  },
  {
    type: "UIText",
    fields: [
      { key: "content", label: "Content", fieldType: "textarea", required: true, default: "" },
      {
        key: "resizeMode",
        label: "Resize Mode",
        fieldType: "select",
        default: 1,
        options: [
          { value: 0, label: "Break" },
          { value: 1, label: "Scale" },
        ],
      },
      { key: "maxLineWidth", label: "Max Line Width", fieldType: "number", default: 1024 },
      { key: "padding", label: "Padding", fieldType: "number", default: 0 },
      COLOR_FIELD,
      { key: "_style_section", label: "Style", fieldType: "section" },
      {
        key: "style_color",
        label: "Color",
        fieldType: "color",
        default: TEXT_STYLE_DEFAULTS.color,
      },
      {
        key: "style_align",
        label: "Align",
        fieldType: "select",
        default: TEXT_STYLE_DEFAULTS.align,
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ],
      },
      {
        key: "style_fontFamily",
        label: "Font Family",
        fieldType: "text",
        default: TEXT_STYLE_DEFAULTS.fontFamily,
      },
      {
        key: "style_fontSize",
        label: "Font Size",
        fieldType: "number",
        default: TEXT_STYLE_DEFAULTS.fontSize,
      },
      {
        key: "style_fontStyle",
        label: "Font Style",
        fieldType: "select",
        default: TEXT_STYLE_DEFAULTS.fontStyle,
        options: [
          { value: "normal", label: "Normal" },
          { value: "italic", label: "Italic" },
          { value: "oblique", label: "Oblique" },
        ],
      },
      {
        key: "style_fontWeight",
        label: "Font Weight",
        fieldType: "select",
        default: TEXT_STYLE_DEFAULTS.fontWeight,
        options: [
          { value: "normal", label: "Normal" },
          { value: "bold", label: "Bold" },
          { value: "bolder", label: "Bolder" },
          { value: "lighter", label: "Lighter" },
        ],
      },
      {
        key: "style_lineHeight",
        label: "Line Height",
        fieldType: "number",
        default: TEXT_STYLE_DEFAULTS.lineHeight,
        step: 0.1,
      },
      {
        key: "style_enableShadow",
        label: "Shadow",
        fieldType: "checkbox",
        default: TEXT_STYLE_DEFAULTS.enableShadow,
      },
      {
        key: "style_shadowOffsetX",
        label: "Shadow Offset X",
        fieldType: "number",
        default: TEXT_STYLE_DEFAULTS.shadowOffsetX,
      },
      {
        key: "style_shadowOffsetY",
        label: "Shadow Offset Y",
        fieldType: "number",
        default: TEXT_STYLE_DEFAULTS.shadowOffsetY,
      },
      {
        key: "style_shadowBlur",
        label: "Shadow Blur",
        fieldType: "number",
        default: TEXT_STYLE_DEFAULTS.shadowBlur,
      },
      {
        key: "style_shadowColor",
        label: "Shadow Color",
        fieldType: "color",
        default: TEXT_STYLE_DEFAULTS.shadowColor,
      },
      {
        key: "style_enableStroke",
        label: "Stroke",
        fieldType: "checkbox",
        default: TEXT_STYLE_DEFAULTS.enableStroke,
      },
      {
        key: "style_strokeColor",
        label: "Stroke Color",
        fieldType: "color",
        default: TEXT_STYLE_DEFAULTS.strokeColor,
      },
      {
        key: "style_strokeThickness",
        label: "Stroke Thickness",
        fieldType: "number",
        default: TEXT_STYLE_DEFAULTS.strokeThickness,
      },
    ],
  },
]);
