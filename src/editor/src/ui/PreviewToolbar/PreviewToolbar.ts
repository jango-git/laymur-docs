import type { DebugFilters } from "../../bridge/messages";
import type { PreviewBridge } from "../../bridge/PreviewBridge";

const DEBUG_FILTER_KEYS: (keyof DebugFilters)[] = [
  "showAspect",
  "showWidth",
  "showHeight",
  "showHorizontalDistance",
  "showVerticalDistance",
  "showHorizontalInterpolation",
  "showVerticalInterpolation",
];

const PRESETS: { label: string; w: number; h: number; active?: boolean }[] = [
  { label: "Fill", w: 0, h: 0 },
  { label: "Phone", w: 390, h: 844, active: true },
  { label: "Tablet", w: 768, h: 1024 },
];

const DEBUG_FILTERS_META: { key: keyof DebugFilters; label: string }[] = [
  { key: "showAspect", label: "Aspect" },
  { key: "showWidth", label: "Width" },
  { key: "showHeight", label: "Height" },
  { key: "showHorizontalDistance", label: "H.Dist" },
  { key: "showVerticalDistance", label: "V.Dist" },
  { key: "showHorizontalInterpolation", label: "H.Int" },
  { key: "showVerticalInterpolation", label: "V.Int" },
];

export class PreviewToolbar {
  private activeLayerId: string | null = null;
  private readonly filters: DebugFilters = {};

  constructor(
    private readonly bridge: PreviewBridge,
    toolbarEl: HTMLElement,
    previewWrapper: HTMLElement,
    previewStage: HTMLElement,
    previewFrame: HTMLIFrameElement,
  ) {
    const { presetButtons, sizeLabel, filterBtns, toggleBtn } = this.render(toolbarEl);
    this.setupPresets(presetButtons, sizeLabel, previewWrapper, previewStage, previewFrame);
    this.setupDebugFilters(filterBtns, toggleBtn);
  }

  public setActiveLayer(layerId: string): void {
    this.activeLayerId = layerId;
    this.bridge.setLayerDebug(layerId, { ...this.filters });
  }

  private render(toolbarEl: HTMLElement): {
    presetButtons: HTMLElement[];
    sizeLabel: HTMLElement;
    filterBtns: HTMLElement[];
    toggleBtn: HTMLElement;
  } {
    const presetsContainer = document.createElement("div");
    presetsContainer.id = "preview-presets";

    const presetButtons: HTMLElement[] = [];
    for (const preset of PRESETS) {
      const btn = document.createElement("button");
      btn.className = "preset-btn" + (preset.active === true ? " active" : "");
      btn.dataset.w = String(preset.w);
      btn.dataset.h = String(preset.h);
      btn.textContent = preset.label;
      presetsContainer.appendChild(btn);
      presetButtons.push(btn);
    }
    toolbarEl.appendChild(presetsContainer);

    const sizeLabel = document.createElement("span");
    sizeLabel.id = "preview-size-label";
    toolbarEl.appendChild(sizeLabel);

    const themeToggle = document.createElement("div");
    themeToggle.className = "theme-toggle";

    const darkDot = document.createElement("button");
    darkDot.className = "theme-dot theme-dot-dark active";
    darkDot.title = "Dark";

    const lightDot = document.createElement("button");
    lightDot.className = "theme-dot theme-dot-light";
    lightDot.title = "Light";

    darkDot.addEventListener("click", () => {
      document.documentElement.removeAttribute("data-theme");
      darkDot.classList.add("active");
      lightDot.classList.remove("active");
      this.bridge.setTheme("dark");
    });
    lightDot.addEventListener("click", () => {
      document.documentElement.setAttribute("data-theme", "light");
      lightDot.classList.add("active");
      darkDot.classList.remove("active");
      this.bridge.setTheme("light");
    });

    themeToggle.appendChild(darkDot);
    themeToggle.appendChild(lightDot);
    toolbarEl.appendChild(themeToggle);

    const debugFilters = document.createElement("div");
    debugFilters.id = "debug-filters";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "debug-toggle-btn";
    toggleBtn.id = "debug-toggle";
    toggleBtn.textContent = "Debug";
    debugFilters.appendChild(toggleBtn);

    const filterBtns: HTMLElement[] = [];
    for (const { key, label } of DEBUG_FILTERS_META) {
      const btn = document.createElement("button");
      btn.className = "debug-filter-btn";
      btn.dataset.filter = key;
      btn.textContent = label;
      debugFilters.appendChild(btn);
      filterBtns.push(btn);
    }

    toolbarEl.appendChild(debugFilters);

    return { presetButtons, sizeLabel, filterBtns, toggleBtn };
  }

  private setupPresets(
    presetButtons: HTMLElement[],
    previewSizeLabel: HTMLElement,
    previewWrapper: HTMLElement,
    previewStage: HTMLElement,
    previewFrame: HTMLIFrameElement,
  ): void {
    let isSwapped = false;

    const applySize = (w: number, h: number): void => {
      const stageRect = previewStage.getBoundingClientRect();
      const maxW = stageRect.width - 4;
      const maxH = stageRect.height - 4;

      if (maxW > 0 && maxH > 0 && (w > maxW || h > maxH)) {
        const scale = Math.min(maxW / w, maxH / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      previewWrapper.classList.add("framed");
      previewWrapper.style.width = w + "px";
      previewWrapper.style.height = h + "px";
      previewSizeLabel.textContent = w + " × " + h;
    };

    presetButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const wasActive = btn.classList.contains("active");
        presetButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const w = parseInt(btn.dataset.w ?? "0", 10);
        const h = parseInt(btn.dataset.h ?? "0", 10);
        if (w === 0 && h === 0) {
          previewWrapper.classList.remove("framed");
          previewWrapper.style.width = "";
          previewWrapper.style.height = "";
          previewSizeLabel.textContent = "";
          isSwapped = false;
        } else {
          if (wasActive) {
            isSwapped = !isSwapped;
          } else {
            isSwapped = false;
          }
          applySize(isSwapped ? h : w, isSwapped ? w : h);
        }
      });

      if (btn.classList.contains("active")) {
        requestAnimationFrame(() => btn.dispatchEvent(new MouseEvent("click")));
      }
    });

    let resizing = false;
    let resizeStart: { x: number; y: number; w: number; h: number } | null = null;

    const resizeHandle = document.getElementById("preview-resize-handle");
    resizeHandle?.addEventListener("mousedown", (e) => {
      e.preventDefault();
      resizing = true;
      resizeStart = {
        x: e.clientX,
        y: e.clientY,
        w: previewWrapper.offsetWidth,
        h: previewWrapper.offsetHeight,
      };
      document.body.style.cursor = "se-resize";
      document.body.style.userSelect = "none";
      previewFrame.style.pointerEvents = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!resizing || !resizeStart) {
        return;
      }
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;
      const stageRect = previewStage.getBoundingClientRect();
      const newW = Math.max(160, Math.min(resizeStart.w + dx * 2, stageRect.width - 4));
      const newH = Math.max(120, Math.min(resizeStart.h + dy * 2, stageRect.height - 4));
      previewWrapper.style.width = newW + "px";
      previewWrapper.style.height = newH + "px";
      previewSizeLabel.textContent = Math.round(newW) + " × " + Math.round(newH);
    });

    document.addEventListener("mouseup", () => {
      if (!resizing) {
        return;
      }
      resizing = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      previewFrame.style.pointerEvents = "";
    });
  }

  private setupDebugFilters(filterBtns: HTMLElement[], toggleBtn: HTMLElement): void {
    filterBtns.forEach((btn) => {
      const key = btn.dataset.filter as keyof DebugFilters;
      btn.addEventListener("click", () => {
        const newValue = !(this.filters[key] ?? false);
        this.filters[key] = newValue;
        btn.classList.toggle("active", newValue);
        this.syncToggleButton(toggleBtn);
        if (this.activeLayerId !== null) {
          this.bridge.setLayerDebug(this.activeLayerId, { [key]: newValue });
        }
      });
    });

    toggleBtn.addEventListener("click", () => {
      const anyOn = DEBUG_FILTER_KEYS.some((k) => this.filters[k] === true);
      const nextValue = !anyOn;
      for (const key of DEBUG_FILTER_KEYS) {
        this.filters[key] = nextValue;
      }
      filterBtns.forEach((btn) => {
        const key = btn.dataset.filter as keyof DebugFilters;
        btn.classList.toggle("active", this.filters[key] === true);
      });
      this.syncToggleButton(toggleBtn);
      if (this.activeLayerId !== null) {
        this.bridge.setLayerDebug(this.activeLayerId, { ...this.filters });
      }
    });
  }

  private syncToggleButton(toggleBtn: HTMLElement): void {
    const anyOn = DEBUG_FILTER_KEYS.some((k) => this.filters[k] === true);
    toggleBtn.classList.toggle("active", anyOn);
  }
}
