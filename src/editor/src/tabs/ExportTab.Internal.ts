/**
 * ExportTab.Internal.ts
 *
 * Pure codegen helpers for ExportTab: TypeScript source generation and file download.
 * These are module-level functions with no UI or state dependencies.
 */

import type { ConstraintState, ElementState, LayerState } from "../types";

export interface SavedScene {
  version: number;
  activeLayerId: string;
  layers: LayerState[];
  assets: Record<string, { name: string; dataURL: string }>;
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
  return `new ${element.type}(this /* TODO */)`;
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

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
