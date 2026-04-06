import { cpSync, mkdirSync, rmSync, existsSync, readdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "_site";

// 1. Clean
if (existsSync(SITE)) rmSync(SITE, { recursive: true });
mkdirSync(SITE);

// 2. Root index.html
copyFileSync("index.html", join(SITE, "index.html"));

// 3. Copy non-TS static files from src subdirectories
function copyStaticFiles(sourceDirectory, destinationDirectory) {
  cpSync(sourceDirectory, destinationDirectory, {
    recursive: true,
    filter: (src) => !src.endsWith(".ts"),
  });
}

copyStaticFiles("src/editor", join(SITE, "editor"));
// copyStaticFiles("src/examples", join(SITE, "examples"));

// 4. Copy JS bundles into js/ subdirectories
function copyBundles(distDirectory, destinationDirectory) {
  mkdirSync(destinationDirectory, { recursive: true });
  for (const file of readdirSync(distDirectory)) {
    if (file.endsWith(".js")) {
      copyFileSync(join(distDirectory, file), join(destinationDirectory, file));
    }
  }
}

copyBundles("dist/editor", join(SITE, "editor", "js"));
// copyBundles("dist/examples", join(SITE, "examples", "js"));

console.log("✓ Built _site/");
