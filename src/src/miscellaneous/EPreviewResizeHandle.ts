const MIN_WIDTH = 240;
const MIN_HEIGHT = 160;

export class EPreviewResizeHandle {
  private readonly container: HTMLElement;
  private readonly frame: HTMLIFrameElement;
  private readonly viewport: HTMLElement;

  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;

  constructor(
    container: HTMLElement,
    frame: HTMLIFrameElement,
    viewport: HTMLElement,
    handle: HTMLElement,
  ) {
    this.container = container;
    this.frame = frame;
    this.viewport = viewport;

    handle.addEventListener("mousedown", this.onMouseDown);
  }

  private readonly onMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.container.offsetWidth;
    this.startHeight = this.container.offsetHeight;
    this.frame.style.pointerEvents = "none";

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp, { once: true });
  };

  private readonly onMouseMove = (event: MouseEvent): void => {
    const maxWidth = this.viewport.clientWidth;
    const maxHeight = this.viewport.clientHeight;
    this.container.style.width = `${Math.max(MIN_WIDTH, Math.min(maxWidth, this.startWidth + (event.clientX - this.startX) * 2))}px`;
    this.container.style.height = `${Math.max(MIN_HEIGHT, Math.min(maxHeight, this.startHeight + (event.clientY - this.startY) * 2))}px`;
  };

  private readonly onMouseUp = (): void => {
    this.frame.style.pointerEvents = "";
    document.removeEventListener("mousemove", this.onMouseMove);
  };
}
