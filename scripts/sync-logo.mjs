// ###################################################
// File Name : sync-logo.mjs
// Purpose : Sync generated hasm_logo submodule assets into the hasm-top app.
// Description : Copies the "hasm" logo variants from submodules/hasm_logo into
//               src/assets/logo and public/, so the top-level site always
//               ships whatever artwork currently lives in the hasm_logo
//               submodule. Runs automatically before dev/build via package.json.
// ###################################################

import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");

const LOGO_SOURCE_DIR = path.join(REPO_ROOT, "submodules", "hasm_logo", "logo", "hasm");
const LOGO_ASSETS_DIR = path.join(REPO_ROOT, "src", "assets", "logo");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");

const FAVICON_SOURCE = path.join(LOGO_SOURCE_DIR, "hasm_favicon.png");
const FAVICON_TARGET = path.join(PUBLIC_DIR, "favicon.png");

const LOGO_VARIANTS = [
  "hasm_logo_transparent.png",
  "hasm_logo_dark_bg.png",
  "hasm_logo_light_bg.png",
  "hasm_favicon.png",
];

if (!existsSync(LOGO_SOURCE_DIR)) {
  // Submodule not checked out; keep whatever was previously synced instead of blocking dev/build.
  console.warn(`[sync-logo] hasm_logo submodule not found at ${LOGO_SOURCE_DIR}; skipping logo sync.`);
  process.exit(0);
}

mkdirSync(LOGO_ASSETS_DIR, { recursive: true });
for (const fileName of LOGO_VARIANTS) {
  const source = path.join(LOGO_SOURCE_DIR, fileName);
  if (existsSync(source)) {
    copyFileSync(source, path.join(LOGO_ASSETS_DIR, fileName));
  }
}
if (existsSync(FAVICON_SOURCE)) {
  copyFileSync(FAVICON_SOURCE, FAVICON_TARGET);
}

console.log("[sync-logo] Synced hasm logo assets into src/assets/logo and public/favicon.png.");
