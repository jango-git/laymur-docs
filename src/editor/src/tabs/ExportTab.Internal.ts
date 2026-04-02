/**
 * ExportTab.Internal.ts
 *
 * Pure codegen helpers for ExportTab: TypeScript source generation and file download.
 * These are module-level functions with no UI or state dependencies.
 */

import type { ConstraintState, ElementState, LayerState } from "../types";
import { TEXT_STYLE_DEFAULTS } from "../types";

export interface SavedScene {
  version: number;
  activeLayerId: string;
  layers: LayerState[];
  assets: Record<string, { name: string; dataURL: string; assetType?: "image" | "font"; fontFamily?: string }>;
}

export function generateTs(layer: LayerState): string {
  const elementIdToName = new Map(layer.elements.map((e) => [e.id, e.name]));
  const resolveElement = (id: string): string =>
    id === "layer" ? "this" : `this.${elementIdToName.get(id)}Element`;

  const laymurImports = new Set<string>(["UIFullscreenLayer"]);
  const threeTypeImports = new Set<string>();

  laymurImports.add(policyTsClassName(layer.policyType));

  for (const element of layer.elements) {
    laymurImports.add(element.type);
    if (element.type === "UIImage") {
      threeTypeImports.add("Texture");
    }
    if (element.type === "UIText" && (element.fieldValues.resizeMode as number | undefined) === 0) {
      laymurImports.add("UITextResizeMode");
    }
  }

  for (const constraint of layer.constraints) {
    for (const cls of constraintTsClasses(constraint.constraintType)) {
      laymurImports.add(cls);
    }
  }

  const lines: string[] = [];

  if (threeTypeImports.size > 0) {
    lines.push(`import type { ${[...threeTypeImports].sort().join(", ")} } from "three";`);
  }
  lines.push(`import {\n  ${[...laymurImports].sort().join(",\n  ")},\n} from "laymur";`);
  lines.push("");

  lines.push(`export class ${layer.name} extends UIFullscreenLayer {`);

  for (const element of layer.elements) {
    lines.push(`  public readonly ${element.name}Element: ${element.type};`);
  }

  const namedConstraints = layer.constraints.filter((c) => c.name !== undefined);
  for (const constraint of namedConstraints) {
    const classes = constraintTsClasses(constraint.constraintType);
    const fieldType = classes.length === 1 ? classes[0] : `[${classes.join(", ")}]`;
    lines.push(`  public readonly ${constraint.name}Constraint: ${fieldType};`);
  }

  if (layer.elements.length > 0 || namedConstraints.length > 0) {
    lines.push("");
  }

  lines.push(`  constructor() {`);
  lines.push(
    `    super({ name: ${JSON.stringify(layer.name)}, resizePolicy: ${policyTsConstructor(layer.policyType, layer.policyParams)} });`,
  );

  if (layer.elements.length > 0) {
    lines.push("");
  }

  for (const element of layer.elements) {
    lines.push(`    this.${element.name}Element = ${elementTsConstructor(element)};`);
    const colorStmt = elementColorStatement(element);
    if (colorStmt !== null) {
      lines.push(`    ${colorStmt}`);
    }
  }

  if (layer.constraints.length > 0) {
    lines.push("");
  }

  for (const constraint of layer.constraints) {
    const stmts = constraintTsStatements(constraint, resolveElement);
    if (constraint.name !== undefined) {
      if (stmts.length === 1) {
        lines.push(`    this.${constraint.name}Constraint = ${stmts[0]};`);
      } else {
        lines.push(`    this.${constraint.name}Constraint = [`);
        for (const stmt of stmts) {
          lines.push(`      ${stmt},`);
        }
        lines.push(`    ];`);
      }
    } else {
      for (const stmt of stmts) {
        lines.push(`    ${stmt};`);
      }
    }
  }

  lines.push(`  }`);
  lines.push(`}`);

  return lines.join("\n") + "\n";
}

function policyTsClassName(policyType: string): string {
  const map: Record<string, string> = {
    none: "UIResizePolicyNone",
    cover: "UIResizePolicyCover",
    fit: "UIResizePolicyFit",
    cross: "UIResizePolicyCross",
    crossInverted: "UIResizePolicyCrossInverted",
    fixedWidth: "UIResizePolicyFixedWidth",
    fixedHeight: "UIResizePolicyFixedHeight",
  };
  return map[policyType] ?? "UIResizePolicyNone";
}

function policyTsConstructor(policyType: string, policyParams: Record<string, number>): string {
  const p = policyParams;
  switch (policyType) {
    case "cover":
      return `new UIResizePolicyCover(${p.rectWidth}, ${p.rectHeight})`;
    case "fit":
      return `new UIResizePolicyFit(${p.rectWidth}, ${p.rectHeight})`;
    case "cross":
      return `new UIResizePolicyCross(${p.fixedWidthLandscape}, ${p.fixedHeightPortrait})`;
    case "crossInverted":
      return `new UIResizePolicyCrossInverted(${p.fixedWidthLandscape}, ${p.fixedHeightPortrait})`;
    case "fixedWidth":
      return `new UIResizePolicyFixedWidth(${p.fixedWidthLandscape}, ${p.fixedWidthPortrait})`;
    case "fixedHeight":
      return `new UIResizePolicyFixedHeight(${p.fixedHeightLandscape}, ${p.fixedHeightPortrait})`;
    case "none":
    default:
      return `new UIResizePolicyNone()`;
  }
}

function elementTsConstructor(element: ElementState): string {
  if (element.type === "UIImage") {
    const assetId = (element.fieldValues.assetId as string | undefined) ?? "texture";
    return `new UIImage(this, /* TODO: place texture ${assetId} */)`;
  }
  if (element.type === "UIText") {
    const content = (element.fieldValues.content as string | undefined) ?? "";
    const resizeMode = (element.fieldValues.resizeMode as number | undefined) ?? 0;
    const maxLineWidth = (element.fieldValues.maxLineWidth as number | undefined) ?? 1024;
    const padding = (element.fieldValues.padding as number | undefined) ?? 0;
    const opts: string[] = [];
    if (resizeMode !== 1) {
      opts.push(`resizeMode: UITextResizeMode.BREAK`);
    }
    if (maxLineWidth !== 1024) {
      opts.push(`maxLineWidth: ${maxLineWidth}`);
    }
    if (padding !== 0) {
      opts.push(`padding: ${padding}`);
    }
    opts.push(textStyleTsOpt(element.fieldValues));
    const optStr = opts.length > 0 ? `, { ${opts.join(", ")} }` : "";
    return `new UIText(this, ${JSON.stringify(content)}${optStr})`;
  }
  return `new ${element.type}(this /* TODO */)`;
}

export function elementColorStatement(element: ElementState): string | null {
  const color = element.fieldValues.color as string | undefined;
  if (color === undefined || color === "#ffffffff") {
    return null;
  }
  return `this.${element.name}Element.color.set(${JSON.stringify(color)});`;
}

function constraintTsClasses(constraintType: string): string[] {
  const map: Record<string, string[]> = {
    horizontal: ["UIHorizontalDistanceConstraint"],
    vertical: ["UIVerticalDistanceConstraint"],
    aspect: ["UIAspectConstraint"],
    width: ["UIWidthConstraint"],
    height: ["UIHeightConstraint"],
    horizontalProportion: ["UIHorizontalProportionConstraint"],
    verticalProportion: ["UIVerticalProportionConstraint"],
    size2d: ["UIWidthConstraint", "UIHeightConstraint"],
    distance2d: ["UIHorizontalDistanceConstraint", "UIVerticalDistanceConstraint"],
    proportion2d: ["UIHorizontalProportionConstraint", "UIVerticalProportionConstraint"],
  };
  return map[constraintType] ?? [];
}

function constraintTsStatements(
  constraint: ConstraintState,
  resolveElement: (id: string) => string,
): string[] {
  const fv = constraint.fieldValues;
  const elementA = resolveElement(fv.elementA as string);
  const elementBId = fv.elementB as string | undefined;
  const elementB = elementBId !== undefined ? resolveElement(elementBId) : null;

  switch (constraint.constraintType) {
    case "horizontal":
      return [
        `new UIHorizontalDistanceConstraint(${elementA}, ${elementB}, { distance: ${fv.distance}, anchorA: ${fv.anchorA}, anchorB: ${fv.anchorB} })`,
      ];
    case "vertical":
      return [
        `new UIVerticalDistanceConstraint(${elementA}, ${elementB}, { distance: ${fv.distance}, anchorA: ${fv.anchorA}, anchorB: ${fv.anchorB} })`,
      ];
    case "aspect":
      return [`new UIAspectConstraint(${elementA}, { aspect: ${fv.value} })`];
    case "width":
      return [`new UIWidthConstraint(${elementA}, { width: ${fv.value} })`];
    case "height":
      return [`new UIHeightConstraint(${elementA}, { height: ${fv.value} })`];
    case "horizontalProportion":
      return [
        `new UIHorizontalProportionConstraint(${elementA}, ${elementB}, { proportion: ${fv.value} })`,
      ];
    case "verticalProportion":
      return [
        `new UIVerticalProportionConstraint(${elementA}, ${elementB}, { proportion: ${fv.value} })`,
      ];
    case "size2d":
      return [
        `new UIWidthConstraint(${elementA}, { width: ${fv.width} })`,
        `new UIHeightConstraint(${elementA}, { height: ${fv.height} })`,
      ];
    case "distance2d":
      return [
        `new UIHorizontalDistanceConstraint(${elementA}, ${elementB}, { distance: ${fv.hDistance}, anchorA: ${fv.hAnchorA}, anchorB: ${fv.hAnchorB} })`,
        `new UIVerticalDistanceConstraint(${elementA}, ${elementB}, { distance: ${fv.vDistance}, anchorA: ${fv.vAnchorA}, anchorB: ${fv.vAnchorB} })`,
      ];
    case "proportion2d":
      return [
        `new UIHorizontalProportionConstraint(${elementA}, ${elementB}, { proportion: ${fv.hProportion} })`,
        `new UIVerticalProportionConstraint(${elementA}, ${elementB}, { proportion: ${fv.vProportion} })`,
      ];
    default:
      return [`/* unknown constraint: ${constraint.constraintType} */`];
  }
}

function textStyleTsOpt(fv: Record<string, unknown>): string {
  const d = TEXT_STYLE_DEFAULTS;
  const s = (key: string, def: string): string => JSON.stringify((fv[key] as string | undefined) ?? def);
  const n = (key: string, def: number): number => (fv[key] as number | undefined) ?? def;
  const b = (key: string, def: boolean): boolean => (fv[key] as boolean | undefined) ?? def;
  const fields = [
    `color: ${s("style_color", d.color)}`,
    `align: ${s("style_align", d.align)}`,
    `fontFamily: ${s("style_fontFamily", d.fontFamily)}`,
    `fontSize: ${n("style_fontSize", d.fontSize)}`,
    `fontStyle: ${s("style_fontStyle", d.fontStyle)}`,
    `fontWeight: ${s("style_fontWeight", d.fontWeight)}`,
    `lineHeight: ${n("style_lineHeight", d.lineHeight)}`,
    `enableShadow: ${b("style_enableShadow", d.enableShadow)}`,
    `shadowOffsetX: ${n("style_shadowOffsetX", d.shadowOffsetX)}`,
    `shadowOffsetY: ${n("style_shadowOffsetY", d.shadowOffsetY)}`,
    `shadowBlur: ${n("style_shadowBlur", d.shadowBlur)}`,
    `shadowColor: ${s("style_shadowColor", d.shadowColor)}`,
    `enableStroke: ${b("style_enableStroke", d.enableStroke)}`,
    `strokeColor: ${s("style_strokeColor", d.strokeColor)}`,
    `strokeThickness: ${n("style_strokeThickness", d.strokeThickness)}`,
  ];
  return `commonStyle: { ${fields.join(", ")} }`;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
