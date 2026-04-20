import type { EAnyConstraint } from "../../../../../document/types.constraints";
import type { EAnyElement } from "../../../../../document/types.elements";
import type { EAnyLayer } from "../../../../../document/types.layers";
import { ELayerType } from "../../../../../document/types.layers";
import type { EElementUUID, ELayerUUID } from "../../../../../document/types.misc";
import { generateConstraintStatement } from "./generate-constraint-statement";
import { generateElementDeclaration } from "./generate-element-declaration";
import { generateResizePolicyCode } from "./generate-resize-policy";
import { nameToIdentifier } from "./name-to-identifier";

function layerTypeToClass(type: ELayerType): string {
  switch (type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case ELayerType.FULLSCREEN:
      return "UIFullscreenLayer";
  }
}

export function generateLayerCode(
  layer: EAnyLayer,
  elements: EAnyElement[],
  constraints: EAnyConstraint[],
  assetMap: Map<string, string>,
): string {
  const fullscreenLayer = layer;

  const elementNames = new Map<string, string>();
  const usedNames = new Set<string>();

  for (const element of elements) {
    let base = nameToIdentifier(element.name) || "element";
    let name = base;
    let counter = 2;
    while (usedNames.has(name)) {
      name = `${base}${counter++}`;
    }
    usedNames.add(name);
    elementNames.set(element.uuid, name);
  }

  const ref = (uuid: ELayerUUID | EElementUUID): string => {
    if (uuid === layer.uuid) {
      return "this";
    }
    const name = elementNames.get(uuid);
    return name !== undefined ? `this.${name}` : `/* unknown: ${uuid} */`;
  };

  const imports = new Set<string>();

  const layerClass = layerTypeToClass(layer.type);
  imports.add(layerClass);

  const { code: resizePolicyCode, import: resizePolicyImport } =
    generateResizePolicyCode(fullscreenLayer);
  imports.add(resizePolicyImport);

  const elementDeclarations: string[] = [];
  for (const element of elements) {
    const name = elementNames.get(element.uuid)!;
    const { code, imports: elImports } = generateElementDeclaration(name, element, assetMap);
    elementDeclarations.push(code);
    for (const imp of elImports) {
      imports.add(imp);
    }
  }

  const constraintStatements: string[] = [];
  for (const constraint of constraints) {
    const { code, imports: cImports } = generateConstraintStatement(constraint, ref);
    constraintStatements.push(code);
    for (const imp of cImports) {
      imports.add(imp);
    }
  }

  const className = `UI${layer.name}Layer`;
  const lines: string[] = [];

  lines.push(`import {`);
  for (const imp of [...imports].sort()) {
    lines.push(`  ${imp},`);
  }
  lines.push(`} from "laymur";`);
  lines.push(``);
  lines.push(`export class ${className} extends ${layerClass} {`);

  if (elementDeclarations.length > 0) {
    for (const decl of elementDeclarations) {
      lines.push(`  ${decl}`);
    }
    lines.push(``);
  }

  lines.push(`  constructor() {`);
  lines.push(`    super({`);
  lines.push(`      name: "${layer.name}",`);
  lines.push(`      resizePolicy: ${resizePolicyCode},`);
  lines.push(`    });`);

  if (constraintStatements.length > 0) {
    lines.push(``);
    for (const stmt of constraintStatements) {
      lines.push(`    ${stmt}`);
    }
  }

  lines.push(`  }`);
  lines.push(`}`);

  return lines.join("\n");
}
