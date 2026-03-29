/**
 * export.ts
 *
 * Export tab: Save/Load scene as JSON, Export layer(s) as TypeScript.
 */

import { addAssetFromDataURL } from "./assets";
import type { PreviewBridge } from "../bridge/PreviewBridge";
import { ELEMENT_REGISTRY } from "../registry/element-registry";
import type { EditorState } from "../state";
import type { LayerState } from "../types";

const SCENE_VERSION = 1;

export class ExportTab {
  private readonly editorState: EditorState;
  private readonly bridge: PreviewBridge;
  private readonly onInitializePreview: () => void;
  private readonly onSceneLoad: () => void;

  constructor(
    editorState: EditorState,
    bridge: PreviewBridge,
    callbacks: { onInitializePreview: () => void; onSceneLoad?: () => void },
  ) {
    this.editorState = editorState;
    this.bridge = bridge;
    this.onInitializePreview = callbacks.onInitializePreview;
    this.onSceneLoad = callbacks.onSceneLoad ?? (() => {});
  }

  // ─── Public ───────────────────────────────────────────────────────────────

  public render(): void {
    const container = document.getElementById("export-content");
    if (!container) {return;}
    container.innerHTML = "";

    // Save / Load side by side
    const sceneRow = document.createElement("div");
    sceneRow.className = "button-row";

    const saveBtn = document.createElement("button");
    saveBtn.className = "button-primary";
    saveBtn.textContent = "Save Scene";
    saveBtn.addEventListener("click", () => this._saveScene());

    const loadBtn = document.createElement("button");
    loadBtn.className = "button-secondary";
    loadBtn.textContent = "Load Scene";
    loadBtn.addEventListener("click", () => loadInput.click());

    const loadInput = document.createElement("input");
    loadInput.type = "file";
    loadInput.accept = ".json";
    loadInput.hidden = true;
    loadInput.addEventListener("change", async () => {
      const file = loadInput.files![0];
      if (!file) {return;}
      loadInput.value = "";
      const text = await file.text();
      try {
        await this._loadScene(JSON.parse(text));
      } catch (err) {
        console.error("[export] Failed to load scene:", err);
      }
    });

    sceneRow.appendChild(saveBtn);
    sceneRow.appendChild(loadBtn);
    container.appendChild(sceneRow);
    container.appendChild(loadInput);

    const divider = document.createElement("hr");
    divider.className = "export-divider";
    container.appendChild(divider);

    // Export TS: Active Layer / All Layers side by side
    const tsRow = document.createElement("div");
    tsRow.className = "button-row";

    const tsActiveBtn = document.createElement("button");
    tsActiveBtn.className = "button-success";
    tsActiveBtn.textContent = "Export Active Layer";
    tsActiveBtn.addEventListener("click", () => this._exportActiveLayerTs());

    const tsAllBtn = document.createElement("button");
    tsAllBtn.className = "button-success-dim";
    tsAllBtn.textContent = "Export All Layers";
    tsAllBtn.addEventListener("click", () => this._exportAllLayersTs());

    tsRow.appendChild(tsActiveBtn);
    tsRow.appendChild(tsAllBtn);
    container.appendChild(tsRow);
  }

  // ─── Save scene ───────────────────────────────────────────────────────────

  private _saveScene(): void {
    const usedAssetIds = this._collectUsedAssetIds();

    const assets: Record<string, { name: string; dataURL: string }> = {};
    for (const id of usedAssetIds) {
      const meta = this.editorState.assets[id];
      if (meta) {assets[id] = { name: meta.name, dataURL: meta.dataURL };}
    }

    const json = {
      version: SCENE_VERSION,
      activeLayerId: this.editorState.activeLayerId,
      layers: this.editorState.layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        policyType: layer.policyType,
        policyParams: { ...layer.policyParams },
        elements: layer.elements.map((el) => ({
          id: el.id,
          type: el.type,
          name: el.name,
          fieldValues: { ...el.fieldValues },
        })),
        constraints: layer.constraints.map((c) => ({
          id: c.id,
          constraintType: c.constraintType,
          ...(c.name !== undefined ? { name: c.name } : {}),
          fieldValues: { ...c.fieldValues },
        })),
      })),
      assets,
    };

    _downloadFile(JSON.stringify(json, null, 2), "scene.json", "application/json");
  }

  private _collectUsedAssetIds(): Set<string> {
    const ids = new Set<string>();
    for (const layer of this.editorState.layers) {
      for (const el of layer.elements) {
        const descriptor = ELEMENT_REGISTRY.get(el.type);
        if (!descriptor) {continue;}
        for (const field of descriptor.fields) {
          const val = el.fieldValues[field.key];
          if (field.fieldType === "asset" && val) {
            ids.add(val as string);
          }
        }
      }
    }
    return ids;
  }

  // ─── Load scene ───────────────────────────────────────────────────────────

  private async _loadScene(json: any): Promise<void> {
    // TODO: type properly
    if (json?.version !== SCENE_VERSION) {
      console.error("[export] Unsupported scene version:", json?.version);
      return;
    }

    for (const [id, assetData] of Object.entries(json.assets ?? {})) {
      // TODO: type properly
      await addAssetFromDataURL(this.editorState, id, assetData.name, assetData.dataURL);
    }

    this.editorState.resetState(json.layers, json.activeLayerId);

    this.bridge.resetScene();
    this.onInitializePreview();

    for (const layer of this.editorState.layers) {
      for (const el of layer.elements) {
        if (el.type === "UIImage") {
          const dataURL = this.editorState.assets[el.fieldValues.assetId as string]?.dataURL;
          if (dataURL) {this.bridge.addImage(el.id, layer.id, dataURL);}
        }
      }
      for (const c of layer.constraints) {
        this.bridge.addConstraint(c.id, layer.id, c.constraintType, c.fieldValues);
      }
    }

    this.onSceneLoad();
  }

  // ─── TypeScript export ────────────────────────────────────────────────────

  private _exportActiveLayerTs(): void {
    const layer = this.editorState.activeLayer();
    _downloadFile(_generateTs(layer), `${layer.name}.ts`, "text/plain");
  }

  private _exportAllLayersTs(): void {
    for (const layer of this.editorState.layers) {
      _downloadFile(_generateTs(layer), `${layer.name}.ts`, "text/plain");
    }
  }
}

// ─── TS codegen (module-level pure functions) ─────────────────────────────────

function _generateTs(layer: LayerState) {
  const elementIdToName = new Map(layer.elements.map((e) => [e.id, e.name]));
  const resolveEl = (id: string) =>
    id === "layer" ? "this" : `this.${elementIdToName.get(id)}Element`;

  // ── Collect imports ─────────────────────────────────────────────────────
  const laymurImports = new Set(["UIFullscreenLayer"]);
  const threeTypeImports = new Set();

  const policyClass = _policyTsClassName(layer.policyType);
  laymurImports.add(policyClass);

  for (const el of layer.elements) {
    laymurImports.add(el.type);
    if (el.type === "UIImage") {threeTypeImports.add("Texture");}
  }

  for (const c of layer.constraints as any[]) {
    // TODO: type properly
    for (const cls of _constraintTsClasses(c.constraintType)) {
      laymurImports.add(cls);
    }
  }

  // ── Build lines ─────────────────────────────────────────────────────────
  const lines = [];

  if (threeTypeImports.size > 0) {
    lines.push(`import type { ${[...threeTypeImports].sort().join(", ")} } from "three";`);
  }
  lines.push(`import {\n  ${[...laymurImports].sort().join(",\n  ")},\n} from "laymur";`);
  lines.push("");

  lines.push(`export class ${layer.name} extends UIFullscreenLayer {`);

  // Element fields
  for (const el of layer.elements) {
    lines.push(`  public readonly ${el.name}Element: ${el.type};`);
  }

  // Named constraint fields
  const namedConstraints = layer.constraints.filter((c) => c.name);
  for (const c of namedConstraints) {
    const classes = _constraintTsClasses(c.constraintType);
    const fieldType = classes.length === 1 ? classes[0] : `[${classes.join(", ")}]`;
    lines.push(`  public readonly ${c.name}Constraint: ${fieldType};`);
  }

  if (layer.elements.length > 0 || namedConstraints.length > 0) {lines.push("");}

  lines.push(`  constructor() {`);
  lines.push(
    `    super({ name: ${JSON.stringify(layer.name)}, resizePolicy: ${_policyTsConstructor(layer.policyType, layer.policyParams)} });`,
  );

  if (layer.elements.length > 0) {lines.push("");}

  // Element instantiation
  for (const el of layer.elements) {
    lines.push(`    this.${el.name}Element = ${_elementTsConstructor(el)};`);
  }

  if (layer.constraints.length > 0) {lines.push("");}

  // Constraint instantiation
  for (const c of layer.constraints) {
    const stmts = _constraintTsStatements(c, resolveEl);
    if (c.name) {
      if (stmts.length === 1) {
        lines.push(`    this.${c.name}Constraint = ${stmts[0]};`);
      } else {
        lines.push(`    this.${c.name}Constraint = [`);
        for (let i = 0; i < stmts.length; i++) {
          lines.push(`      ${stmts[i]},`);
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

function _policyTsClassName(policyType: string) {
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

function _policyTsConstructor(policyType: string, p: any) {
  // TODO: type properly
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

function _elementTsConstructor(el: any) {
  // TODO: type properly
  if (el.type === "UIImage") {
    const assetId = el.fieldValues.assetId ?? "texture";
    return `new UIImage(this, /* TODO: place texture ${assetId} */)`;
  }
  return `new ${el.type}(this /* TODO */)`;
}

function _constraintTsClasses(constraintType: string) {
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

function _constraintTsStatements(c: any, resolveEl: any) {
  // TODO: type properly
  const fv = c.fieldValues;
  const a = resolveEl(fv.elementA);
  const b = fv.elementB !== undefined ? resolveEl(fv.elementB) : null;

  switch (c.constraintType) {
    case "horizontal":
      return [
        `new UIHorizontalDistanceConstraint(${a}, ${b}, { distance: ${fv.distance}, anchorA: ${fv.anchorA}, anchorB: ${fv.anchorB} })`,
      ];
    case "vertical":
      return [
        `new UIVerticalDistanceConstraint(${a}, ${b}, { distance: ${fv.distance}, anchorA: ${fv.anchorA}, anchorB: ${fv.anchorB} })`,
      ];
    case "aspect":
      return [`new UIAspectConstraint(${a}, { aspect: ${fv.value} })`];
    case "width":
      return [`new UIWidthConstraint(${a}, { width: ${fv.value} })`];
    case "height":
      return [`new UIHeightConstraint(${a}, { height: ${fv.value} })`];
    case "horizontalProportion":
      return [`new UIHorizontalProportionConstraint(${a}, ${b}, { proportion: ${fv.value} })`];
    case "verticalProportion":
      return [`new UIVerticalProportionConstraint(${a}, ${b}, { proportion: ${fv.value} })`];
    case "size2d":
      return [
        `new UIWidthConstraint(${a}, { width: ${fv.width} })`,
        `new UIHeightConstraint(${a}, { height: ${fv.height} })`,
      ];
    case "distance2d":
      return [
        `new UIHorizontalDistanceConstraint(${a}, ${b}, { distance: ${fv.hDistance}, anchorA: ${fv.hAnchorA}, anchorB: ${fv.hAnchorB} })`,
        `new UIVerticalDistanceConstraint(${a}, ${b}, { distance: ${fv.vDistance}, anchorA: ${fv.vAnchorA}, anchorB: ${fv.vAnchorB} })`,
      ];
    case "proportion2d":
      return [
        `new UIHorizontalProportionConstraint(${a}, ${b}, { proportion: ${fv.hProportion} })`,
        `new UIVerticalProportionConstraint(${a}, ${b}, { proportion: ${fv.vProportion} })`,
      ];
    default:
      return [`/* unknown constraint: ${c.constraintType} */`];
  }
}

function _downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
