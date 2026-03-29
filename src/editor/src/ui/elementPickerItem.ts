/**
 * Shared utilities for rendering element/layer items inside EUIElementPicker buttons.
 * Used by EUIConstraintCardFieldDriven, EUIConstraintAddForm, and EUIElementAddForm.
 */

import type { ElementState } from "../types";

export interface ElementPickerItem {
  id: string;
  name: string;
  elementType: string | null;
  assetId?: string;
}

export function buildElementPickerItems(
  elements: ElementState[],
  noLayer = false,
): ElementPickerItem[] {
  const items: ElementPickerItem[] = [];
  if (!noLayer) {
    items.push({ id: "layer", name: "Layer", elementType: null });
  }
  for (const el of elements) {
    items.push({
      id: el.id,
      name: el.name,
      elementType: el.type,
      assetId: el.fieldValues["assetId"] as string | undefined,
    });
  }
  return items;
}

export function renderElementPickerItem(
  item: ElementPickerItem,
  getAssetUrl: (id: string) => string | undefined,
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "picker-item-content";

  if (item.elementType === null) {
    const thumb = document.createElement("div");
    thumb.className = "picker-btn-thumb picker-btn-thumb-ph";
    thumb.textContent = "⬡";
    wrapper.appendChild(thumb);
  } else if (item.elementType === "UIImage" && item.assetId) {
    const url = getAssetUrl(item.assetId);
    const thumb = document.createElement(url ? "img" : "div");
    thumb.className = "picker-btn-thumb" + (url ? "" : " picker-btn-thumb-ph");
    if (url && thumb instanceof HTMLImageElement) {
      thumb.src = url;
    } else {
      (thumb as HTMLDivElement).textContent = "□";
    }
    wrapper.appendChild(thumb);
  } else {
    const thumb = document.createElement("div");
    thumb.className = "picker-btn-thumb picker-btn-thumb-ph";
    thumb.textContent = "□";
    wrapper.appendChild(thumb);
  }

  const name = document.createElement("span");
  name.className = "picker-btn-name";
  name.textContent = item.name;
  wrapper.appendChild(name);

  return wrapper;
}

export function updateElementPickerButton(
  display: HTMLElement,
  id: string | null,
  elements: ElementState[],
  getAssetUrl: (id: string) => string | undefined,
): void {
  display.innerHTML = "";

  if (!id) {
    const ph = document.createElement("span");
    ph.className = "picker-btn-placeholder";
    ph.textContent = "Click to select…";
    display.appendChild(ph);
    return;
  }

  if (id === "layer") {
    const thumb = document.createElement("div");
    thumb.className = "picker-btn-thumb picker-btn-thumb-ph";
    thumb.textContent = "⬡";
    display.appendChild(thumb);
    const name = document.createElement("span");
    name.className = "picker-btn-name";
    name.textContent = "Layer";
    display.appendChild(name);
    return;
  }

  const element = elements.find((e) => e.id === id);
  if (!element) {
    const ph = document.createElement("span");
    ph.className = "picker-btn-placeholder";
    ph.textContent = "Unknown";
    display.appendChild(ph);
    return;
  }

  if (element.type === "UIImage") {
    const assetId = element.fieldValues["assetId"] as string | undefined;
    const url = assetId ? getAssetUrl(assetId) : undefined;
    if (url) {
      const img = document.createElement("img");
      img.src = url;
      img.className = "picker-btn-thumb";
      display.appendChild(img);
    } else {
      const thumb = document.createElement("div");
      thumb.className = "picker-btn-thumb picker-btn-thumb-ph";
      thumb.textContent = "□";
      display.appendChild(thumb);
    }
  } else {
    const thumb = document.createElement("div");
    thumb.className = "picker-btn-thumb picker-btn-thumb-ph";
    thumb.textContent = "□";
    display.appendChild(thumb);
  }

  const name = document.createElement("span");
  name.className = "picker-btn-name";
  name.textContent = element.name;
  display.appendChild(name);
}
