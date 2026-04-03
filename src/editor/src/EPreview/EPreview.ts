import { Clock, WebGLRenderer } from "three";
import type { EMessage } from "../EBridge/EBridge.Messages";
import { receiveMessage } from "./EPreview.Handling";
import { getLayerContextActive } from "./EPreview.Internal";

const CLOCK = new Clock();
const CANVAS = document.getElementById("canvas") as HTMLCanvasElement;
const RENDERER = new WebGLRenderer({ canvas: CANVAS, antialias: true, alpha: true });
RENDERER.setPixelRatio(window.devicePixelRatio);
RENDERER.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", () => RENDERER.setSize(window.innerWidth, window.innerHeight));
window.addEventListener(
  "message",
  (event): void => void receiveMessage(event as MessageEvent<EMessage>),
);

function animate(): void {
  requestAnimationFrame(animate);

  const activeLayer = getLayerContextActive()?.layer;
  if (activeLayer) {
    activeLayer.render(RENDERER, CLOCK.getDelta());
  }
}

animate();
