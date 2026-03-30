import type { PreviewBridge } from "../bridge/PreviewBridge";
import { makeSortable } from "../miscellaneous/make-sortable";
import { CONSTRAINT_REGISTRY } from "../registry/constraint-registry";
import type { EditorState } from "../state";
import type { AssetMeta } from "../types";
import type { ConstraintAddFormContext } from "../ui/EUIConstraintAddForm/EUIConstraintAddForm";
import { EUIConstraintAddForm } from "../ui/EUIConstraintAddForm/EUIConstraintAddForm";
import {
  EUIConstraintCard,
  type ConstraintCardCallbacks,
  type ConstraintCardContext,
} from "../ui/EUIConstraintCard/EUIConstraintCard";

export class ConstraintsTab {
  private activeConstraintCards: EUIConstraintCard[] = [];
  private readonly constraintAddForm: EUIConstraintAddForm;

  constructor(
    private readonly editorState: EditorState,
    private readonly bridge: PreviewBridge,
  ) {
    const context: ConstraintAddFormContext = {
      getElements: () => this.editorState.activeLayer().elements,
      getAssetUrl: (assetId) => {
        const asset = this.editorState.assets[assetId] as AssetMeta | undefined;
        return asset?.url;
      },
      isNameAvailable: (name) =>
        !this.editorState.isLayerChildNameTaken(name, this.editorState.activeLayer()),
    };

    this.constraintAddForm = new EUIConstraintAddForm(context, {
      onAdd: ({ constraintType, name, fieldValues }): void => {
        if (!CONSTRAINT_REGISTRY.has(constraintType)) {
          return;
        }
        const id = this.editorState.generateConstraintId();
        const layer = this.editorState.activeLayer();
        console.debug(
          "[ConstraintsTab] add constraint id=%s type=%s layerId=%s",
          id,
          constraintType,
          layer.id,
        );
        layer.constraints.push({ id, constraintType, name, fieldValues });
        this.bridge.addConstraint(id, layer.id, constraintType, fieldValues);
        this.render();
      },
    });
  }

  public refreshAddForm(): void {
    this.constraintAddForm.refresh();
  }

  public render(): void {
    for (const card of this.activeConstraintCards) {
      card.destroy();
    }
    this.activeConstraintCards = [];

    const list = document.getElementById("constraints-list");
    if (list === null) {
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

    const cardContext: ConstraintCardContext = {
      getElements: () => this.editorState.activeLayer().elements,
      getAssetUrl: (assetId) => {
        const asset = this.editorState.assets[assetId] as AssetMeta | undefined;
        return asset?.url;
      },
      isNameAvailable: (name, excludeConstraintId) =>
        !this.editorState.isLayerChildNameTaken(name, this.editorState.activeLayer(), {
          excludeConstraintId,
        }),
    };

    const callbacks: ConstraintCardCallbacks = {
      onFieldsUpdate: (constraint) => {
        this.updateConstraintInPreview(constraint);
      },
      onDelete: (id) => {
        this.removeConstraint(id);
      },
    };

    for (const constraint of layer.constraints) {
      const descriptor = CONSTRAINT_REGISTRY.get(constraint.constraintType);
      if (descriptor === undefined) {
        continue;
      }
      const card = new EUIConstraintCard(list, constraint, descriptor, callbacks, cardContext);
      this.activeConstraintCards.push(card);
    }

    makeSortable(list, (fromIndex, toIndex) => {
      console.debug("[ConstraintsTab] reorder constraint from=%d to=%d", fromIndex, toIndex);
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
    for (const constraint of toRemove) {
      this.removeConstraint(constraint.id);
    }
  }

  private updateConstraintInPreview(constraint: {
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

  private removeConstraint(id: string): void {
    const layer = this.editorState.activeLayer();
    console.debug("[ConstraintsTab] remove constraint id=%s layerId=%s", id, layer.id);
    layer.constraints = layer.constraints.filter((c) => c.id !== id);
    this.bridge.removeConstraint(id, layer.id);
    this.render();
  }
}
