import path from "node:path"
import fs from "node:fs/promises"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..")

export const DEFAULT_INPUT_DIR = "C:/Users/havergal.samosir/Downloads/rabuanpics"
export const TARGET_OUTPUT_DIR = path.join(repoRoot, "content", "assets", "speakers")

export const PORTRAIT_CONFIGS = [
  // Session 07: Dr. Ric Roi (2026-10-14)
  {
    rawFile: "ric roi.jpeg",
    speakerName: "Dr. Ric Roi (Front)",
    targetFile: "Ric-Roi_Front_2026-10-14.webp",
  },
  {
    rawFile: "ric roi2.jpg",
    speakerName: "Dr. Ric Roi (Back)",
    targetFile: "Ric-Roi_Back_2026-10-14.webp",
  },

  // Session 06: Prof. Irwan Meilano (2026-09-30)
  {
    rawFile: "irwan meilano.jpg",
    speakerName: "Prof. Irwan Meilano (Front)",
    targetFile: "Irwan-Meilano_Front_2026-09-30.webp",
  },
  {
    rawFile: "irwan meilano2.jpg",
    speakerName: "Prof. Irwan Meilano (Back)",
    targetFile: "Irwan-Meilano_Back_2026-09-30.webp",
  },

  // Session 05: Prof. Edward Buckingham (2026-09-30)
  {
    rawFile: "Edward-Buckingham.jpg",
    speakerName: "Prof. Edward Buckingham (Front)",
    targetFile: "Edward-Buckingham_Front_2026-09-30.webp",
  },
  {
    rawFile: "edward-buckingham2.jpg",
    speakerName: "Prof. Edward Buckingham (Back)",
    targetFile: "Edward-Buckingham_Back_2026-09-30.webp",
  },

  // Session 04: Sahala Tua Paulus Situmorang (2026-09-23)
  {
    rawFile: "sahala.jpg",
    speakerName: "Sahala Tua Paulus Situmorang (Front)",
    targetFile: "Sahala-Situmorang_Front_2026-09-23.webp",
  },
  {
    rawFile: "sahala2.jpg",
    speakerName: "Sahala Tua Paulus Situmorang (Back)",
    targetFile: "Sahala-Situmorang_Back_2026-09-23.webp",
  },

  // Session 03: Dipl.-Ing. Syamsul Bachri Yusuf (2026-09-23)
  {
    rawFile: "syamsul bachri.jpg",
    speakerName: "Dipl.-Ing. Syamsul Bachri Yusuf (Front)",
    targetFile: "Syamsul-Bachri_Front_2026-09-23.webp",
  },
  {
    rawFile: "syamsul bachri2.jpg",
    speakerName: "Dipl.-Ing. Syamsul Bachri Yusuf (Back)",
    targetFile: "Syamsul-Bachri_Back_2026-09-23.webp",
  },

  // Session 02: Indayati Oetomo (2026-09-04)
  {
    rawFile: "indayati oetomo.jpg",
    speakerName: "Indayati Oetomo (Front)",
    targetFile: "Indayati-Oetomo_Front_2026-09-04.webp",
  },
  {
    rawFile: "indayati oetomo2.jpeg",
    speakerName: "Indayati Oetomo (Back)",
    targetFile: "Indayati-Oetomo_Back_2026-09-04.webp",
  },

  // Session 01: Agus Dwi Handaya (2026-09-02)
  {
    rawFile: "agus dwi handaya.jpg",
    speakerName: "Agus Dwi Handaya (Front)",
    targetFile: "Agus-Handaya_Front_2026-09-02.webp",
  },
  {
    rawFile: "adh2.jpg",
    speakerName: "Agus Dwi Handaya (Back)",
    targetFile: "Agus-Handaya_Back_2026-09-02.webp",
  },

  // Special Session: Presiden Prabowo Subianto - Taklimat Hambalang (2026-05-24)
  {
    rawFile: "prabowo-hambalang1.jpeg",
    speakerName: "Presiden Prabowo Subianto - Hambalang (Front)",
    targetFile: "Prabowo-Subianto_Front_2026-05-24.webp",
  },
  {
    rawFile: "prabowo-hambalang2.jpg",
    speakerName: "Presiden Prabowo Subianto - Hambalang (Back)",
    targetFile: "Prabowo-Subianto_Back_2026-05-24.webp",
  },

  // Special Session: Presiden Prabowo Subianto - KEM-PPKF RAPBN 2027 (2026-05-20)
  // Front = Raised Fist (prabowo-rapbn2), Back = Speech (prabowo-rapbn1)
  {
    rawFile: "prabowo-rapbn2.jpeg",
    speakerName: "Presiden Prabowo Subianto - RAPBN 2027 Raised Fist (Front)",
    targetFile: "Prabowo-Subianto_Front_2026-05-20.webp",
  },
  {
    rawFile: "prabowo-rapbn1.jpeg",
    speakerName: "Presiden Prabowo Subianto - RAPBN 2027 Podium Speech (Back)",
    targetFile: "Prabowo-Subianto_Back_2026-05-20.webp",
  },

  // Special Session: Marsma TNI Dr. Anton Pallaguna (2026-10-20)
  {
    rawFile: "anton-UPI.png",
    speakerName: "Marsma TNI Dr. Anton Pallaguna (Front)",
    targetFile: "Anton-Pallaguna_Front_2026-10-20.webp",
  },
  {
    rawFile: "anton-UPI2.jpg",
    speakerName: "Marsma TNI Dr. Anton Pallaguna (Back)",
    targetFile: "Anton-Pallaguna_Back_2026-10-20.webp",
  },
]

export async function processPortraits(
  inputDir = DEFAULT_INPUT_DIR,
  outputDir = TARGET_OUTPUT_DIR,
) {
  if (!existsSync(inputDir)) {
    throw new Error(`Input directory not found: ${inputDir}`)
  }

  await fs.mkdir(outputDir, { recursive: true })

  // Clean obsolete legacy files from previous naming convention
  const existingFiles = await fs.readdir(outputDir)
  const targetNames = new Set(PORTRAIT_CONFIGS.map((c) => c.targetFile))

  for (const file of existingFiles) {
    if (file.endsWith(".webp") && !targetNames.has(file)) {
      await fs.unlink(path.join(outputDir, file))
    }
  }

  const results = []

  for (const config of PORTRAIT_CONFIGS) {
    const inputPath = path.join(inputDir, config.rawFile)
    const outputPath = path.join(outputDir, config.targetFile)

    if (!existsSync(inputPath)) {
      throw new Error(`Raw portrait file not found: ${inputPath}`)
    }

    await sharp(inputPath)
      .resize(450, 600, {
        fit: "cover",
        position: "center",
      })
      .webp({
        quality: 85,
        effort: 6,
      })
      .toFile(outputPath)

    const stats = await fs.stat(outputPath)
    const meta = await sharp(outputPath).metadata()

    results.push({
      speaker: config.speakerName,
      file: config.targetFile,
      outputPath,
      dimensions: `${meta.width}x${meta.height}`,
      sizeKb: (stats.size / 1024).toFixed(1),
    })
  }

  return results
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const customInputDir = process.argv[2] || DEFAULT_INPUT_DIR
  console.log(`Processing Rabuan speaker portraits from: ${customInputDir}`)
  console.log(`Output directory: ${TARGET_OUTPUT_DIR}`)

  processPortraits(customInputDir)
    .then((results) => {
      console.log("\nSuccessfully generated portraits:")
      console.table(
        results.map((r) => ({
          Speaker: r.speaker,
          File: r.file,
          Format: "WebP",
          Dimensions: r.dimensions,
          "Size (KB)": `${r.sizeKb} KB`,
        })),
      )
    })
    .catch((err) => {
      console.error("\nError optimizing portraits:", err.message)
      process.exit(1)
    })
}
