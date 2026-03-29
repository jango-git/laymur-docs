import type { ElementState } from "../../types";
import type { ElementCardCallbacks, ElementCardContext } from "./EUIElementCard";
import { EUIElementCard } from "./EUIElementCard";

/** Fallback card for element types with no type-specific fields. */
export class EUIElementCardGeneric extends EUIElementCard {
  constructor(
    container: HTMLElement,
    element: ElementState,
    callbacks: ElementCardCallbacks,
    context: ElementCardContext,
  ) {
    super(container, element, callbacks, context);
    this.renderFields(this.fieldsContainer);
  }

  protected renderFields(container: HTMLElement): void {
    // No type-specific fields for generic elements.
  }
}
