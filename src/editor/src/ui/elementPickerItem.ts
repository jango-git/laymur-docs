/**
 * Shared utilities for rendering element/layer items inside EUIElementPicker buttons.
 * Used by EUIConstraintCard, EUIConstraintAddForm, and EUIElementAddForm.
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
  } else if (item.elementType === "UIImage" && item.assetId !== undefined) {
    const url = getAssetUrl(item.assetId);
    if (url !== undefined) {
      const img = document.createElement("img");
      img.className = "picker-btn-thumb";
      img.src = url;
      wrapper.appendChild(img);
    } else {
      const thumb = document.createElement("div");
      thumb.className = "picker-btn-thumb picker-btn-thumb-ph";
      thumb.textContent = "□";
      wrapper.appendChild(thumb);
    }
  } else {
    const thumb = document.createElement("div");
    thumb.className = "picker-btn-thumb picker-btn-thumb-ph";
    thumb.textContent = "□";
    wrapper.appendChild(thumb);
  }

  const nameElement = document.createElement("span");
  nameElement.className = "picker-btn-name";
  nameElement.textContent = item.name;
  wrapper.appendChild(nameElement);

  return wrapper;
}

export function updateElementPickerButton(
  display: HTMLElement,
  id: string | null,
  elements: ElementState[],
  getAssetUrl: (id: string) => string | undefined,
): void {
  display.innerHTML = "";

  if (id === null) {
    const placeholder = document.createElement("span");
    placeholder.className = "picker-btn-placeholder";
    placeholder.textContent = "Click to select…";
    display.appendChild(placeholder);
    return;
  }

  if (id === "layer") {
    const thumb = document.createElement("div");
    thumb.className = "picker-btn-thumb picker-btn-thumb-ph";
    thumb.textContent = "⬡";
    display.appendChild(thumb);
    const nameElement = document.createElement("span");
    nameElement.className = "picker-btn-name";
    nameElement.textContent = "Layer";
    display.appendChild(nameElement);
    return;
  }

  const element = elements.find((e) => e.id === id);
  if (element === undefined) {
    const placeholder = document.createElement("span");
    placeholder.className = "picker-btn-placeholder";
    placeholder.textContent = "Unknown";
    display.appendChild(placeholder);
    return;
  }

  if (element.type === "UIImage") {
    const assetId = element.fieldValues["assetId"] as string | undefined;
    const url = assetId !== undefined ? getAssetUrl(assetId) : undefined;
    if (url !== undefined) {
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

  const nameElement = document.createElement("span");
  nameElement.className = "picker-btn-name";
  nameElement.textContent = element.name;
  display.appendChild(nameElement);
}
