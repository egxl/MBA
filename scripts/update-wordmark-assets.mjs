import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const sourcePath =
  "C:/Users/havergal.samosir/.gemini/antigravity/brain/6df90701-ab1f-4a62-af41-a0891d2aea6f/.user_uploaded/media_1793865471583_041e5784.png"

const targetWidth = 1024
const targetHeight = 240

async function main() {
  console.log(`Processing wordmark from: ${sourcePath}`)

  // 1. Trim outer transparent padding
  const trimmed = sharp(sourcePath).trim()
  const { data, info } = await trimmed.raw().toBuffer({ resolveWithObject: true })
  console.log(`Trimmed active artwork: ${info.width}x${info.height}`)

  const pixelCount = info.width * info.height
  const blackData = Buffer.alloc(pixelCount * 4)
  const whiteData = Buffer.alloc(pixelCount * 4)

  // 2. Build crisp Black and White pixel buffers with normalized alpha
  for (let i = 0; i < data.length; i += 4) {
    const rawAlpha = data[i + 3]
    const alpha = Math.min(255, Math.round(rawAlpha * (255 / 254)))

    // Black mark: pure RGB 0,0,0
    blackData[i] = 0
    blackData[i + 1] = 0
    blackData[i + 2] = 0
    blackData[i + 3] = alpha

    // White mark: pure RGB 255,255,255
    whiteData[i] = 255
    whiteData[i + 1] = 255
    whiteData[i + 2] = 255
    whiteData[i + 3] = alpha
  }

  // 3. Symmetric padding to exact 1024x240 canvas
  const padLeft = Math.floor((targetWidth - info.width) / 2)
  const padRight = targetWidth - info.width - padLeft
  const padTop = Math.floor((targetHeight - info.height) / 2)
  const padBottom = targetHeight - info.height - padTop

  console.log(
    `Centering into ${targetWidth}x${targetHeight} with padding: L=${padLeft}, R=${padRight}, T=${padTop}, B=${padBottom}`,
  )

  const blackBuffer = await sharp(blackData, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extend({
      top: padTop,
      bottom: padBottom,
      left: padLeft,
      right: padRight,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer()

  const whiteBuffer = await sharp(whiteData, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extend({
      top: padTop,
      bottom: padBottom,
      left: padLeft,
      right: padRight,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer()

  console.log(`Generated Black PNG: ${blackBuffer.length} bytes`)
  console.log(`Generated White PNG: ${whiteBuffer.length} bytes`)

  // 4. Output targets
  const targets = [
    { file: "quartz/static/logo.png", buffer: blackBuffer },
    { file: "quartz/static/logo-dark.png", buffer: whiteBuffer },
    { file: "P3MD New Logo_Black.png", buffer: blackBuffer },
    { file: "P3MD New Logo_White.png", buffer: whiteBuffer },
    { file: "public/static/logo.png", buffer: blackBuffer },
    { file: "public/static/logo-dark.png", buffer: whiteBuffer },
  ]

  for (const { file, buffer } of targets) {
    const dir = path.dirname(file)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(file, buffer)
    console.log(`Updated ${file}`)
  }

  console.log("Wordmark update completed successfully.")
}

main().catch((err) => {
  console.error("Failed to update wordmark:", err)
  process.exit(1)
})
