# PixelMancer

A CLI tool to resize sprite images to multiple sizes.

## Installation

```bash
npm install -g pixelmancer
```

## Usage

```bash
pixelmancer <inputDir> [outputDir] [--optimize] [--sizes 32,64,128]
```

## Example

```bash
pixelmancer raw-sprites ./resized-sprites --sizes 32,64,128 --optimize
```

## Features
- Resize png images to multiple specified sizes.
- Optimize images using `imagemin` and `imagemin-pngquant`.
- Supports custom output directories and size configurations.
- Simple command-line interface.