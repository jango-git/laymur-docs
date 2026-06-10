import { mkdirSync, rmSync, existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SITE = "_site";

export const COPY_MAP = [
  ["src/index.html", join(SITE, "index.html")],
  ["dist/index.css", join(SITE, "index.css")],
  ["dist/index.js", join(SITE, "index.js")],
  ["src/src/preview/preview.html", join(SITE, "preview.html")],
  ["src/src/preview/preview.css", join(SITE, "preview.css")],
  ["dist/preview.js", join(SITE, "preview.js")],
];

export function copySite() {
  mkdirSync(SITE, { recursive: true });
  for (const [from, to] of COPY_MAP) {
    if (existsSync(from)) copyFileSync(from, to);
  }
}

// CLI: full clean rebuild of _site/ (used by `npm run build:site`).
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (existsSync(SITE)) rmSync(SITE, { recursive: true });
  copySite();
  console.log("✓ Built _site/");
}
