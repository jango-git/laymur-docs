// Realtime local development orchestrator.
//
//   rollup  -w  ->  dist/index.js, dist/preview.js
//   postcss -w  ->  dist/index.css
//   watcher     ->  mirrors dist/ + static html/css into _site/
//   live-server ->  serves _site/ and live-reloads the browser on change
//
// Start with `npm run dev`. Everything rebuilds and the page reloads on save -
// no manual steps, no server restart. The production pipeline (`build:site`,
// used by GitHub Pages) is untouched.

import { spawn } from "node:child_process";
import { watch } from "node:fs";
import liveServer from "live-server";
import { copySite } from "./build-site.mjs";

const PORT = 3000;

// 1. Bundlers in watch mode, writing into dist/.
const children = [
  spawn("npx", ["rollup", "-c", "-w"], { stdio: "inherit", shell: true }),
  spawn("npx", ["postcss", "src/index.css", "-o", "dist/index.css", "-w"], {
    stdio: "inherit",
    shell: true,
  }),
];

// 2. Mirror build artifacts + static files into _site/ (debounced).
let timer;
function scheduleCopy() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      copySite();
    } catch (error) {
      console.error("[dev] copy to _site failed:", error);
    }
  }, 100);
}

copySite();

// dist/ is flat (rollup/postcss outputs sit directly in it) and the static
// sources are few, so non-recursive watches are enough and avoid platform
// differences in recursive fs.watch.
const WATCH_DIRS = ["dist", "src", "src/src/preview"];
for (const dir of WATCH_DIRS) {
  watch(dir, (_event, filename) => {
    if (filename && /\.(js|css|html)$/.test(filename)) {
      scheduleCopy();
    }
  });
}

// 3. Static server with live reload (watches _site/ by default).
liveServer.start({
  root: "_site",
  port: PORT,
  open: false,
  wait: 200,
  logLevel: 0,
});

console.log(`\n  ▶ Dev server running: http://localhost:${PORT}\n`);

function shutdown() {
  for (const child of children) {
    child.kill();
  }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
