import type { FerrsignView2 } from "ferrsign";
import { Ferrsign2 } from "ferrsign";
import { MathUtils } from "three";

enum FieldState {
  VIEW = "view",
  HOVER = "hover",
  SCRUBBING = "scrubbing",
  EDIT = "edit",
}

interface Options {
  value: number;
  min: number;
  max: number;
  step: number;
  precision: number;
}

export class EUINumberControl {
  private readonly container: HTMLElement;
  private currentValue: number;
  private minValue: number;
  private maxValue: number;
  private stepValue: number;
  private precisionValue: number;

  private scrubStartX = 0;
  private scrubStartValue = 0;

  private readonly root: HTMLDivElement;
  private readonly decrementButton: HTMLButtonElement;
  private readonly display: HTMLSpanElement;
  private readonly incrementButton: HTMLButtonElement;
  private readonly input: HTMLInputElement;
  private currentState: FieldState = null!;

  private readonly signalValueChangedInternal = new Ferrsign2<number, number>();

  constructor(container: HTMLElement, options: Partial<Options> = {}) {
    this.container = container;
    this.currentValue = options.value ?? 0;
    this.minValue = options.min ?? -Infinity;
    this.maxValue = options.max ?? Infinity;
    this.stepValue = options.step ?? 1;
    this.precisionValue = options.precision ?? this.inferPrecision(this.stepValue);

    this.root = document.createElement("div");
    this.root.className = "blender-number-field";

    this.decrementButton = document.createElement("button");
    this.decrementButton.className = "blender-number-field__decrement";
    this.decrementButton.textContent = "\u25C0";
    this.decrementButton.tabIndex = -1;
    this.decrementButton.setAttribute("aria-label", "Decrease value");

    this.display = document.createElement("span");
    this.display.className = "blender-number-field__display";

    this.incrementButton = document.createElement("button");
    this.incrementButton.className = "blender-number-field__increment";
    this.incrementButton.textContent = "\u25B6";
    this.incrementButton.tabIndex = -1;
    this.incrementButton.setAttribute("aria-label", "Increase value");

    this.input = document.createElement("input");
    this.input.className = "blender-number-field__input";
    this.input.type = "number";

    this.root.appendChild(this.decrementButton);
    this.root.appendChild(this.display);
    this.root.appendChild(this.incrementButton);
    this.root.appendChild(this.input);
    this.container.appendChild(this.root);

    this.root.addEventListener("mouseenter", this.handleMouseEnter);
    this.root.addEventListener("mouseleave", this.handleMouseLeave);
    this.root.addEventListener("mousedown", this.handleMouseDown);
    this.input.addEventListener("keydown", this.handleInputKeyDown);
    this.input.addEventListener("blur", this.handleInputBlur);
    this.decrementButton.addEventListener("click", this.handleDecrementClick);
    this.incrementButton.addEventListener("click", this.handleIncrementClick);

    this.transitionTo(FieldState.VIEW);
    this.refreshDisplay();
  }

  public get signalValueChanged(): FerrsignView2<number, number> {
    return this.signalValueChangedInternal;
  }

  public get value(): number {
    return this.currentValue;
  }

  public get min(): number {
    return this.minValue;
  }

  public get max(): number {
    return this.maxValue;
  }

  public get step(): number {
    return this.stepValue;
  }

  public set value(value: number) {
    this.applyValue(value);
  }

  public set min(min: number) {
    this.minValue = min;
    this.applyValue(this.currentValue);
  }

  public set max(max: number) {
    this.maxValue = max;
    this.applyValue(this.currentValue);
  }

  public set step(step: number) {
    this.stepValue = step;
    this.precisionValue = this.inferPrecision(step);
    this.refreshDisplay();
  }

  public destroy(): void {
    this.unbindGlobalScrubEvents();
    this.root.removeEventListener("mouseenter", this.handleMouseEnter);
    this.root.removeEventListener("mouseleave", this.handleMouseLeave);
    this.root.removeEventListener("mousedown", this.handleMouseDown);
    this.input.removeEventListener("keydown", this.handleInputKeyDown);
    this.input.removeEventListener("blur", this.handleInputBlur);
    this.decrementButton.removeEventListener("click", this.handleDecrementClick);
    this.incrementButton.removeEventListener("click", this.handleIncrementClick);
    this.container.removeChild(this.root);
  }

  private readonly handleMouseEnter = (): void => {
    if (this.currentState === FieldState.VIEW) {
      this.transitionTo(FieldState.HOVER);
    }
  };

  private readonly handleMouseLeave = (): void => {
    if (this.currentState === FieldState.HOVER) {
      this.transitionTo(FieldState.VIEW);
    }
  };

  private readonly handleMouseDown = (event: MouseEvent): void => {
    if (this.currentState !== FieldState.HOVER) {return;}

    const target = event.target as Node;
    if (this.decrementButton.contains(target) || this.incrementButton.contains(target)) {return;}

    event.preventDefault();
    this.scrubStartX = event.clientX;
    this.scrubStartValue = this.currentValue;

    this.bindGlobalScrubEvents();
  };

  private readonly handleDocumentMouseMove = (event: MouseEvent): void => {
    const deltaX = event.clientX - this.scrubStartX;

    if (this.currentState === FieldState.HOVER) {
      if (Math.abs(deltaX) > 3) {
        this.transitionTo(FieldState.SCRUBBING);
      }
    }

    if (this.currentState === FieldState.SCRUBBING) {
      const rawValue = this.scrubStartValue + deltaX * this.stepValue;
      this.applyValue(rawValue);
    }
  };

  private readonly handleDocumentMouseUp = (event: MouseEvent): void => {
    this.unbindGlobalScrubEvents();

    if (this.currentState === FieldState.HOVER) {
      this.transitionTo(FieldState.EDIT);
      return;
    }

    if (this.currentState === FieldState.SCRUBBING) {
      const elementUnderPointer = document.elementFromPoint(event.clientX, event.clientY);
      if (elementUnderPointer && this.root.contains(elementUnderPointer)) {
        this.transitionTo(FieldState.HOVER);
      } else {
        this.transitionTo(FieldState.VIEW);
      }
    }
  };

  private readonly handleInputKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      this.commitEdit();
    } else if (event.key === "Escape") {
      this.transitionTo(this.root.matches(":hover") ? FieldState.HOVER : FieldState.VIEW);
    }
  };

  private readonly handleInputBlur = (): void => {
    if (this.currentState === FieldState.EDIT) {
      this.commitEdit();
    }
  };

  private readonly handleDecrementClick = (event: MouseEvent): void => {
    event.stopPropagation();
    this.applyValue(this.currentValue - this.stepValue);
  };

  private readonly handleIncrementClick = (event: MouseEvent): void => {
    event.stopPropagation();
    this.applyValue(this.currentValue + this.stepValue);
  };

  private bindGlobalScrubEvents(): void {
    document.addEventListener("mousemove", this.handleDocumentMouseMove);
    document.addEventListener("mouseup", this.handleDocumentMouseUp);
  }

  private unbindGlobalScrubEvents(): void {
    document.removeEventListener("mousemove", this.handleDocumentMouseMove);
    document.removeEventListener("mouseup", this.handleDocumentMouseUp);
  }

  private transitionTo(nextState: FieldState): void {
    if (this.currentState === nextState) {
      return;
    }

    this.currentState = nextState;
    this.root.dataset.state = nextState;

    if (nextState === FieldState.EDIT) {
      this.input.value = String(this.currentValue);
      requestAnimationFrame(() => {
        this.input.focus();
        this.input.select();
      });
    }

    if (nextState === FieldState.SCRUBBING) {
      document.body.classList.add("blender-scrubbing");
    } else {
      document.body.classList.remove("blender-scrubbing");
    }
  }

  private commitEdit(): void {
    const parsedValue = parseFloat(this.input.value);
    if (isNaN(parsedValue)) {
      throw new Error("BlenderLikeNumberField: invalid number");
    }
    this.applyValue(parsedValue);
    this.transitionTo(this.root.matches(":hover") ? FieldState.HOVER : FieldState.VIEW);
  }

  private applyValue(value: number): void {
    if (value === this.currentValue) {
      return;
    }

    const previousValue = this.currentValue;
    this.currentValue = MathUtils.clamp(value, this.minValue, this.maxValue);
    this.refreshDisplay();
    this.signalValueChangedInternal.emit(this.currentValue, previousValue);
  }

  private refreshDisplay(): void {
    this.display.textContent = this.currentValue.toFixed(this.precisionValue);
  }

  private inferPrecision(step: number): number {
    const text = step.toString();
    const dotIndex = text.indexOf(".");
    return dotIndex === -1 ? 0 : text.length - dotIndex - 1;
  }
}
