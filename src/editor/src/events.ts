import { Ferrsign0, Ferrsign1 } from "ferrsign";

export class EditorBus {
  /** Active layer changed or layer list mutated. Carries new activeLayerId. */
  public readonly layerChanged = new Ferrsign1<string>();
  /** Preview iframe initialized (initial load or after scene reset). Carries activeLayerId. */
  public readonly previewInitialized = new Ferrsign1<string>();
  /** A layer element was deleted. Carries element id. */
  public readonly elementDeleted = new Ferrsign1<string>();
  /** Elements were added or reordered. */
  public readonly elementsChanged = new Ferrsign0();
  /** ExportTab is about to reset the preview - LayersTab should call initializePreview. */
  public readonly previewInitializing = new Ferrsign0();
  /** Full scene was loaded from JSON. All tabs should re-render. */
  public readonly sceneLoaded = new Ferrsign0();
  /** Asset list changed (add / replace / delete). */
  public readonly assetsChanged = new Ferrsign0();
}

export const EDITOR_BUS = new EditorBus();
