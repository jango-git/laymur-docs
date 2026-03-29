/**
 * constraint-registry.ts
 *
 * Declares every constraint type the editor can create.
 * Each entry defines:
 *   - type       : internal key (used in postMessage and state)
 *   - label      : human-readable name for dropdown and card header
 *   - fields     : ordered list of add-form field descriptors
 *   - cardDetail : returns the subtitle string shown on the constraint card
 *
 * To add a new constraint type, append an entry here and add the corresponding
 * handler to PREVIEW_CONSTRAINT_REGISTRY in preview.ts - no other file needs to change.
 *
 * Supported fieldTypes:
 *   "element" : picker populated from state.elements (+ "Layer" option)
 *   "number"  : EUINumberControl (optionally with slider:true for 0-1 range)
 *
 * Paired fields:
 *   group      - string key; fields sharing the same group are rendered as one H:/V: row
 *   groupRole  - "h" | "v" - which cell of the paired row
 *   slider     - true : render as range slider + number input (for 0-1 anchors)
 */

import type { ConstraintState } from "../types";
import { Registry } from "./Registry";

export type ConstraintFieldType = "element" | "number";

export interface ConstraintFieldDescriptor {
  key: string;
  label: string;
  fieldType: ConstraintFieldType;
  required?: boolean;
  excludeSelf?: boolean;
  noLayer?: boolean;
  default?: number;
  min?: number;
  max?: number;
  step?: number;
  group?: string;
  groupRole?: "h" | "v";
  slider?: boolean;
}

export interface ConstraintDescriptor {
  type: string;
  label: string;
  fields: ConstraintFieldDescriptor[];
  cardDetail: (c: ConstraintState, elementLabel: (id: string) => string) => string;
}

export const CONSTRAINT_REGISTRY = new Registry<ConstraintDescriptor>([
  {
    type: "distance2d",
    label: "2D Distance",
    fields: [
      { key: "elementA", label: "Element A", fieldType: "element", required: true },
      {
        key: "elementB",
        label: "Element B",
        fieldType: "element",
        required: true,
        excludeSelf: true,
        noLayer: true,
      },
      {
        key: "hAnchorA",
        label: "Anchor A H (L→R)",
        fieldType: "number",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        group: "anchorA",
        groupRole: "h",
        slider: true,
      },
      {
        key: "vAnchorA",
        label: "Anchor A V (B→T)",
        fieldType: "number",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        group: "anchorA",
        groupRole: "v",
        slider: true,
      },
      {
        key: "hAnchorB",
        label: "Anchor B H (L→R)",
        fieldType: "number",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        group: "anchorB",
        groupRole: "h",
        slider: true,
      },
      {
        key: "vAnchorB",
        label: "Anchor B V (B→T)",
        fieldType: "number",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        group: "anchorB",
        groupRole: "v",
        slider: true,
      },
      {
        key: "hDistance",
        label: "H Distance",
        fieldType: "number",
        default: 0,
        step: 1,
        group: "distance",
        groupRole: "h",
      },
      {
        key: "vDistance",
        label: "V Distance",
        fieldType: "number",
        default: 0,
        step: 1,
        group: "distance",
        groupRole: "v",
      },
    ],
    cardDetail(c, elementLabel): string {
      return `${elementLabel(c.fieldValues.elementA as string)} → ${elementLabel(c.fieldValues.elementB as string)}`;
    },
  },
  {
    type: "proportion2d",
    label: "2D Proportion",
    fields: [
      { key: "elementA", label: "Element A", fieldType: "element", required: true, noLayer: false },
      {
        key: "elementB",
        label: "Element B",
        fieldType: "element",
        required: true,
        excludeSelf: true,
        noLayer: true,
      },
      {
        key: "hProportion",
        label: "H Proportion",
        fieldType: "number",
        default: 1,
        step: 0.1,
        group: "proportion",
        groupRole: "h",
      },
      {
        key: "vProportion",
        label: "V Proportion",
        fieldType: "number",
        default: 1,
        step: 0.1,
        group: "proportion",
        groupRole: "v",
      },
    ],
    cardDetail(c, elementLabel): string {
      return `${elementLabel(c.fieldValues.elementA as string)} → ${elementLabel(c.fieldValues.elementB as string)}`;
    },
  },
  {
    type: "size2d",
    label: "2D Size",
    fields: [
      { key: "elementA", label: "Element", fieldType: "element", required: true, noLayer: true },
      { key: "width", label: "Width", fieldType: "number", default: 1, step: 0.1 },
      { key: "height", label: "Height", fieldType: "number", default: 1, step: 0.1 },
    ],
    cardDetail(c, elementLabel): string {
      return elementLabel(c.fieldValues.elementA as string);
    },
  },

  {
    type: "aspect",
    label: "Aspect Ratio",
    fields: [
      {
        key: "elementA",
        label: "Element",
        fieldType: "element",
        required: true,
        noLayer: true,
      },
      { key: "value", label: "Aspect (w/h)", fieldType: "number", default: 1, step: 0.1 },
    ],
    cardDetail(c, elementLabel): string {
      return elementLabel(c.fieldValues.elementA as string);
    },
  },
  {
    type: "horizontal",
    label: "Horizontal Distance",
    fields: [
      { key: "elementA", label: "Element A", fieldType: "element", required: true },
      {
        key: "elementB",
        label: "Element B",
        fieldType: "element",
        required: true,
        excludeSelf: true,
        noLayer: true,
      },
      { key: "distance", label: "Distance", fieldType: "number", default: 0, step: 1 },
      {
        key: "anchorA",
        label: "Anchor A (L→R)",
        fieldType: "number",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        slider: true,
      },
      {
        key: "anchorB",
        label: "Anchor B (L→R)",
        fieldType: "number",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        slider: true,
      },
    ],
    cardDetail(c, elementLabel): string {
      return `${elementLabel(c.fieldValues.elementA as string)} → ${elementLabel(c.fieldValues.elementB as string)}`;
    },
  },
  {
    type: "vertical",
    label: "Vertical Distance",
    fields: [
      { key: "elementA", label: "Element A", fieldType: "element", required: true },
      {
        key: "elementB",
        label: "Element B",
        fieldType: "element",
        required: true,
        excludeSelf: true,
        noLayer: true,
      },
      { key: "distance", label: "Distance", fieldType: "number", default: 0, step: 1 },
      {
        key: "anchorA",
        label: "Anchor A (B→T)",
        fieldType: "number",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        slider: true,
      },
      {
        key: "anchorB",
        label: "Anchor B (B→T)",
        fieldType: "number",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        slider: true,
      },
    ],
    cardDetail(c, elementLabel): string {
      return `${elementLabel(c.fieldValues.elementA as string)} → ${elementLabel(c.fieldValues.elementB as string)}`;
    },
  },
  {
    type: "width",
    label: "Fixed Width",
    fields: [
      { key: "elementA", label: "Element", fieldType: "element", required: true, noLayer: true },
      { key: "value", label: "Width", fieldType: "number", default: 1, step: 0.1 },
    ],
    cardDetail(c, elementLabel): string {
      return elementLabel(c.fieldValues.elementA as string);
    },
  },
  {
    type: "height",
    label: "Fixed Height",
    fields: [
      { key: "elementA", label: "Element", fieldType: "element", required: true, noLayer: true },
      { key: "value", label: "Height", fieldType: "number", default: 1, step: 0.1 },
    ],
    cardDetail(c, elementLabel): string {
      return elementLabel(c.fieldValues.elementA as string);
    },
  },
  {
    type: "horizontalProportion",
    label: "H-Proportion",
    fields: [
      { key: "elementA", label: "Element A", fieldType: "element", required: true, noLayer: false },
      {
        key: "elementB",
        label: "Element B",
        fieldType: "element",
        required: true,
        excludeSelf: true,
        noLayer: true,
      },
      { key: "value", label: "Proportion", fieldType: "number", default: 1, step: 0.1 },
    ],
    cardDetail(c, elementLabel): string {
      return `${elementLabel(c.fieldValues.elementA as string)} → ${elementLabel(c.fieldValues.elementB as string)}`;
    },
  },
  {
    type: "verticalProportion",
    label: "V-Proportion",
    fields: [
      { key: "elementA", label: "Element A", fieldType: "element", required: true, noLayer: false },
      {
        key: "elementB",
        label: "Element B",
        fieldType: "element",
        required: true,
        excludeSelf: true,
        noLayer: true,
      },
      { key: "value", label: "Proportion", fieldType: "number", default: 1, step: 0.1 },
    ],
    cardDetail(c, elementLabel): string {
      return `${elementLabel(c.fieldValues.elementA as string)} → ${elementLabel(c.fieldValues.elementB as string)}`;
    },
  },
]);
