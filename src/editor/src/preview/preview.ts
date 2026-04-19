import { Clock, WebGLRenderer } from "three";
import type { EAnyBridgeMessage } from "../bridge/types";
import { getLayerContextActive } from "./miscellaneous";
import { receiveMessage } from "./receiving";

const CLOCK = new Clock();
const CANVAS = document.getElementById("canvas") as HTMLCanvasElement;
const RENDERER = new WebGLRenderer({ canvas: CANVAS, antialias: true, alpha: true });
RENDERER.setPixelRatio(window.devicePixelRatio);
RENDERER.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", () => RENDERER.setSize(window.innerWidth, window.innerHeight));
window.addEventListener(
  "message",
  (event): void => void receiveMessage(event as MessageEvent<EAnyBridgeMessage>),
);

function animate(): void {
  requestAnimationFrame(animate);

  const activeLayer = getLayerContextActive()?.layer;
  if (activeLayer) {
    activeLayer.render(RENDERER, CLOCK.getDelta());
  }
}

animate();
