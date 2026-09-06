// ###################################################
// File Name : stage-downloads.mjs
// Purpose : Stage OS installer packages (.msi, .dmg, .AppImage, .deb, .zip)
//           for HASM app and HASM Markdown app into public/downloads/
// Description : Copies Tauri bundle outputs into the static download directory when present.
// ###################################################

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createLogger } from "../src/hasm_logger/src/react/logger.js";

const logger = createLogger("stage-downloads");
const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");

const APPS = [
  {
    id: "hasm",
    name: "HASM app",
    bundleDir: path.join(REPO_ROOT, "submodules", "hasm", "src-tauri", "target", "release", "bundle"),
    downloadsDir: path.join(REPO_ROOT, "public", "downloads", "hasm"),
  },
  {
    id: "hasm_markdown",
    name: "HASM Markdown app",
    bundleDir: path.join(REPO_ROOT, "submodules", "hasm_markdown", "src-tauri", "target", "release", "bundle"),
    downloadsDir: path.join(REPO_ROOT, "public", "downloads", "hasm_markdown"),
  },
];

const INSTALLER_EXTENSIONS = new Set([".msi", ".exe", ".dmg", ".AppImage", ".deb", ".zip"]);
const MANIFEST_PATH = path.join(REPO_ROOT, "public", "downloads", "manifest.json");

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function getInstallerExtension(filePath) {
  if (filePath.endsWith(".AppImage")) {
    return ".AppImage";
  }

  return path.extname(filePath);
}

function findInstallerFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return findInstallerFiles(entryPath);
    }
    if (!entry.isFile()) {
      return [];
    }

    const extension = getInstallerExtension(entryPath);
    return INSTALLER_EXTENSIONS.has(extension) ? [entryPath] : [];
  });
}

function isPlaceholderFile(filePath) {
  if (statSync(filePath).size > 1024) {
    return false;
  }

  const preview = readFileSync(filePath, "utf8").slice(0, 256);
  return preview.includes("Built on 2026-08-26") || preview.includes("Installer (v0.1.0") || preview.includes("Package (v0.1.0");
}

function removePlaceholderInstallers(downloadsDir) {
  findInstallerFiles(downloadsDir).forEach((filePath) => {
    if (isPlaceholderFile(filePath)) {
      unlinkSync(filePath);
      logger.warn("Removed placeholder download file before staging real installers.", { filePath });
    }
  });
}

function listStagedInstallerFiles(downloadsDir) {
  return findInstallerFiles(downloadsDir)
    .filter((filePath) => {
      try {
        return statSync(filePath).size > 1024;
      } catch (error) {
        logger.warn("Skipping staged installer that could not be inspected.", { filePath, error: error.message });
        return false;
      }
    })
    .map((filePath) => path.basename(filePath))
    .sort((left, right) => left.localeCompare(right));
}

function copyInstallerFiles({ id, name, bundleDir, downloadsDir }) {
  ensureDir(downloadsDir);
  removePlaceholderInstallers(downloadsDir);

  const installerFiles = findInstallerFiles(bundleDir);
  if (installerFiles.length === 0) {
    logger.warn(`No Tauri bundle installers found for ${name}; keeping existing files in ${downloadsDir}.`, { bundleDir });
    return { id, copiedCount: 0, files: listStagedInstallerFiles(downloadsDir) };
  }

  installerFiles.forEach((sourcePath) => {
    const destinationPath = path.join(downloadsDir, path.basename(sourcePath));
    copyFileSync(sourcePath, destinationPath);
    const { size } = statSync(destinationPath);
    logger.info(`Staged ${name} installer.`, { sourcePath, destinationPath, size });
  });

  return { id, copiedCount: installerFiles.length, files: listStagedInstallerFiles(downloadsDir) };
}

function writeManifest(results) {
  const manifest = Object.fromEntries(results.map(({ id, files }) => [id, files]));
  ensureDir(path.dirname(MANIFEST_PATH));
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  logger.info("Wrote download manifest.", { manifestPath: MANIFEST_PATH, manifest });
}

function stageDownloads() {
  const results = APPS.map((app) => copyInstallerFiles(app));
  writeManifest(results);
  const copiedCount = results.reduce((count, result) => count + result.copiedCount, 0);
  logger.info(`Download staging finished with ${copiedCount} installer file(s) copied into public/downloads/.`);
}

stageDownloads();
