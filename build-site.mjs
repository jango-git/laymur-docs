import { mkdirSync, rmSync, existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "_site";

if (existsSync(SITE)) rmSync(SITE, { recursive: true });
mkdirSync(SITE);

copyFileSync("src/index.html", join(SITE, "index.html"));
copyFileSync("dist/index.css", join(SITE, "index.css"));
copyFileSync("dist/index.js", join(SITE, "index.js"));
copyFileSync("src/src/preview/preview.html", join(SITE, "preview.html"));
copyFileSync("src/src/preview/preview.css", join(SITE, "preview.css"));
copyFileSync("dist/preview.js", join(SITE, "preview.js"));

console.log("✓ Built _site/");
