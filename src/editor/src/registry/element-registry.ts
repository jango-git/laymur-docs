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
 *   "number" : EUINumberControl
 */

import { Registry } from "./Registry";

export type ElementFieldType = "asset" | "text" | "number";

export interface ElementFieldDescriptor {
  key: string;
  label: string;
  fieldType: ElementFieldType;
  required?: boolean;
  default?: string | number;
}

export interface ElementDescriptor {
  type: string;
  fields: ElementFieldDescriptor[];
}

export const ELEMENT_REGISTRY = new Registry<ElementDescriptor>([
  {
    type: "UIImage",
    fields: [{ key: "assetId", label: "Texture", fieldType: "asset", required: true }],
  },
]);
