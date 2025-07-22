#!/usr/bin/env node
import fs from "fs";
import sharp from "sharp";
import path from "path";
import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";

const args = process.argv.slice(2);
const inputDir = args[0];
const outputDir = args[1] || "./output-images";
const optimize = args.includes("--optimize") || args.includes("-o");
let sizes = [32, 64, 128];
const sizeFlagIndex = args.findIndex((arg) => arg.startsWith("--sizes"));
if (sizeFlagIndex !== -1) {
  const sizeArgs = args[sizeFlagIndex + 1];
  if (!sizeArgs) {
    console.error("Please provide sizes after --sizes flag.");
    process.exit(1);
  }
  sizes = sizeArgs
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n));
}

if (!inputDir) {
  console.error(
    "Usage: pixelmancer <inputDir> [outputDir] [--optimize] [--sizes 32,64,128]"
  );
  process.exit(1);
}

async function optimizeImage(filePath) {
  const optimized = await imagemin([filePath], {
    destination: path.dirname(filePath),
    plugins: [
      imageminPngquant({
        quality: [0.7, 0.9],
      }),
    ],
  });

  if (optimized.length) {
    console.log(`✔ Optimized ${path.basename(filePath)}`);
  }
}

async function processImage(inputPath, relativePath) {
  const baseName = path.basename(relativePath);

  for (const size of sizes) {
    const outPath = path.join(
      outputDir,
      `${size}x${size}`,
      path.dirname(relativePath)
    );

    await fs.promises.mkdir(outPath, { recursive: true });

    const outputFile = path.join(outPath, baseName);
    await sharp(inputPath)
      .resize(size, size, { fit: "cover" })
      .toFile(outputFile);

    console.log(`✔ Resized ${relativePath} -> ${size}x${size}`);

    if (optimize) {
      await optimizeImage(outputFile);
    }
  }
}

async function processDirectory(dir, baseDir = "") {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath, relativePath);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      await processImage(fullPath, relativePath);
    }
  }
}

(async () => {
  console.log(`Processing sprites from: ${inputDir}`);
  console.log(`Target sizes: ${sizes.join(", ")} px`);
  await processDirectory(inputDir);
  console.log(`All sprites resized.`);
  if (optimize) console.log(`Optimization applied with pngquant.`);
})();
