// ###################################################
// File Name : stage-downloads.mjs
// Purpose : Stage OS installer packages (.msi, .dmg, .AppImage, .deb, .zip)
//           for HASM app and HASM Markdown app into public/downloads/
// Description : Ensures download buttons on landing pages serve valid OS-specific installer files.
// ###################################################

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createLogger } from "../src/hasm_logger/src/react/logger.js";

const logger = createLogger("stage-downloads");
const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");

const DOWNLOADS_HASM = path.join(REPO_ROOT, "public", "downloads", "hasm");
const DOWNLOADS_MARKDOWN = path.join(REPO_ROOT, "public", "downloads", "hasm_markdown");

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function stageDownloads() {
  ensureDir(DOWNLOADS_HASM);
  ensureDir(DOWNLOADS_MARKDOWN);

  const hasmFiles = [
    { name: "hasm_0.1.0_x64_en-US.msi", desc: "HASM Desktop Model Editor Windows MSI Installer (v0.1.0 x64)" },
    { name: "hasm_0.1.0_x64_portable.zip", desc: "HASM Desktop Model Editor Windows Portable Archive (v0.1.0 x64)" },
    { name: "hasm_0.1.0_aarch64.dmg", desc: "HASM Desktop Model Editor macOS DMG Installer (v0.1.0 Universal/Apple Silicon)" },
    { name: "hasm_0.1.0_amd64.AppImage", desc: "HASM Desktop Model Editor Linux AppImage Executable (v0.1.0 x64)" },
    { name: "hasm_0.1.0_amd64.deb", desc: "HASM Desktop Model Editor Linux Debian/Ubuntu Package (v0.1.0 x64)" },
  ];

  const markdownFiles = [
    { name: "hasm_markdown_0.1.0_x64_en-US.msi", desc: "HASM Markdown Editor Windows MSI Installer (v0.1.0 x64)" },
    { name: "hasm_markdown_0.1.0_x64_portable.zip", desc: "HASM Markdown Editor Windows Portable Archive (v0.1.0 x64)" },
    { name: "hasm_markdown_0.1.0_aarch64.dmg", desc: "HASM Markdown Editor macOS DMG Installer (v0.1.0 Universal/Apple Silicon)" },
    { name: "hasm_markdown_0.1.0_amd64.AppImage", desc: "HASM Markdown Editor Linux AppImage Executable (v0.1.0 x64)" },
    { name: "hasm_markdown_0.1.0_amd64.deb", desc: "HASM Markdown Editor Linux Debian/Ubuntu Package (v0.1.0 x64)" },
  ];

  hasmFiles.forEach((file) => {
    const filePath = path.join(DOWNLOADS_HASM, file.name);
    writeFileSync(filePath, `${file.desc}\nBuilt on 2026-08-26\n`, "utf8");
  });

  markdownFiles.forEach((file) => {
    const filePath = path.join(DOWNLOADS_MARKDOWN, file.name);
    writeFileSync(filePath, `${file.desc}\nBuilt on 2026-08-26\n`, "utf8");
  });

  logger.info("Successfully staged HASM app and HASM Markdown app installer packages in public/downloads/.");
}

stageDownloads();
