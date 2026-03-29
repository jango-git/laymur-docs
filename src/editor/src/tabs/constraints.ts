/**
 * constraints.ts
 *
 * Constraints tab: add form + constraint list + preview sync.
 * Form fields are driven entirely by constraint-registry - no per-type branching here.
 *
 * Paired fields: fields sharing the same `group` key are rendered as a single H:/V: row.
 */

import type { PreviewBridge } from "../bridge/PreviewBridge";
import { CONSTRAINT_REGISTRY } from "../registry/constraint-registry";
import { makeSortable } from "../sortable";
import type { EditorState } from "../state";
import type { ConstraintAddFormContext } from "../ui/EUIConstraintAddForm/EUIConstraintAddForm";
import { EUIConstraintAddForm } from "../ui/EUIConstraintAddForm/EUIConstraintAddForm";
import type {
  ConstraintCardCallbacks,
  ConstraintCardContext,
} from "../ui/EUIConstraintCard/EUIConstraintCard";
import { EUIConstraintCardFieldDriven } from "../ui/EUIConstraintCard/EUIConstraintCardFieldDriven";

export class ConstraintsTab {
  private readonly editorState: EditorState;
  private readonly bridge: PreviewBridge;
  private activeConstraintCards: EUIConstraintCardFieldDriven[] = [];
  private readonly constraintAddForm: EUIConstraintAddForm | null = null;

  constructor(editorState: EditorState, bridge: PreviewBridge) {
    this.editorState = editorState;
    this.bridge = bridge;

    const context: ConstraintAddFormContext = {
      getElements: () => this.editorState.activeLayer().elements,
      getAssetUrl: (assetId) => this.editorState.assets[assetId]?.url,
      isNameAvailable: (name) =>
        !this.editorState.isNameTaken(name, this.editorState.activeLayer()),
    };

    this.constraintAddForm = new EUIConstraintAddForm(context, {
      onAdd: ({ constraintType, name, fieldValues }) => {
        if (!CONSTRAINT_REGISTRY.has(constraintType)) {
          return;
        }

        const id = this.editorState.generateConstraintId();
        const layer = this.editorState.activeLayer();
        layer.constraints.push({ id, constraintType, name, fieldValues });
        this.bridge.addConstraint(id, layer.id, constraintType, fieldValues);

        this.render();
      },
    });
  }

  // ─── Public ───────────────────────────────────────────────────────────────

  public refreshAddForm(): void {
    this.constraintAddForm?.refresh();
  }

  public render(): void {
    for (const card of this.activeConstraintCards) {
      card.destroy();
    }
    this.activeConstraintCards = [];

    const list = document.getElementById("constraints-list");
    if (!list) {
      return;
    }
    list.innerHTML = "";

    const layer = this.editorState.activeLayer();

    if (layer.constraints.length === 0) {
      const placeholder = document.createElement("p");
      placeholder.className = "placeholder-text";
      placeholder.textContent = "No constraints.";
      list.appendChild(placeholder);
      return;
    }

    const context: ConstraintCardContext = {
      getElements: () => this.editorState.activeLayer().elements,
      getAssetUrl: (assetId) => this.editorState.assets[assetId]?.url,
      isNameAvailable: (name, excludeConstraintId) =>
        !this.editorState.isNameTaken(name, this.editorState.activeLayer(), {
          excludeConstraintId,
        }),
    };

    const callbacks: ConstraintCardCallbacks = {
      onFieldsUpdate: (constraint) => this._postUpdate(constraint),
      onDelete: (id) => this._removeConstraint(id),
    };

    for (const constraint of layer.constraints) {
      const descriptor = CONSTRAINT_REGISTRY.get(constraint.constraintType);
      if (!descriptor) {
        continue;
      }
      const card = new EUIConstraintCardFieldDriven(
        list,
        constraint,
        descriptor,
        callbacks,
        context,
      );
      this.activeConstraintCards.push(card);
    }

    makeSortable(list, (fromIndex, toIndex) => {
      const sortLayer = this.editorState.activeLayer();
      const [moved] = sortLayer.constraints.splice(fromIndex, 1);
      sortLayer.constraints.splice(toIndex, 0, moved);
      this.render();
    });
  }

  public removeForElement(elementId: string): void {
    const toRemove = this.editorState
      .activeLayer()
      .constraints.filter(
        (c) => c.fieldValues.elementA === elementId || c.fieldValues.elementB === elementId,
      );
    for (const c of toRemove) {
      this._removeConstraint(c.id);
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private _postUpdate(constraint: {
    id: string;
    constraintType: string;
    fieldValues: Record<string, string | number>;
  }): void {
    this.bridge.updateConstraint(
      constraint.id,
      this.editorState.activeLayer().id,
      constraint.constraintType,
      constraint.fieldValues,
    );
  }

  private _removeConstraint(id: string): void {
    const layer = this.editorState.activeLayer();
    layer.constraints = layer.constraints.filter((c) => c.id !== id);
    this.bridge.removeConstraint(id, layer.id);
    this.render();
  }
}
