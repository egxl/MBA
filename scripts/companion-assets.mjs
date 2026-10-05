import { readFile, readdir, writeFile } from "node:fs/promises"
import { fileURLToPath, pathToFileURL } from "node:url"

const REQUIRED_IDS = ["mk1", "mk2", "mk3", "mk4", "mk5", "mk6", "peoplemath", "alp"]
const REQUIRED_FIELDS = [
  "id",
  "title",
  "code",
  "companion",
  "action",
  "meaning",
  "file",
  "background",
]
const DANGEROUS_TAGS = ["script", "foreignObject", "image", "iframe", "object", "embed"]

export function validateSvgSource(source, filename, approvedPalette) {
  const errors = []
  const fail = (message) => errors.push(`${filename}: ${message}`)

  if (!/<svg\b[^>]*\bxmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/i.test(source)) {
    fail("missing the SVG xmlns declaration")
  }
  if (!/<svg\b[^>]*\bviewBox=["']0\s+0\s+200\s+150["']/i.test(source)) {
    fail('viewBox must be "0 0 200 150"')
  }
  const strokeWidths = [...source.matchAll(/stroke-width=["']([^"']+)["']/g)].map(
    (match) => match[1],
  )
  if (!strokeWidths.includes("3")) {
    fail('must use the shared structural stroke-width="3"')
  }
  for (const width of new Set(strokeWidths)) {
    if (width !== "3") fail(`stroke-width="${width}" is outside the shared family grammar`)
  }

  for (const tag of DANGEROUS_TAGS) {
    if (new RegExp(`<${tag}\\b`, "i").test(source)) fail(`disallowed <${tag}> element`)
  }
  if (/\bid\s*=/i.test(source)) fail("id attributes are not allowed because assets may be inlined")
  if (
    /\b(?:href|src)\s*=\s*["'](?:https?:|\/\/|data:)/i.test(source) ||
    /url\(\s*["']?(?:https?:|\/\/|data:)/i.test(source)
  ) {
    fail("external or embedded resource references are not allowed")
  }

  const allowed = new Set(approvedPalette.map((color) => color.toLowerCase()))
  const colors = new Set(
    source.match(/#[0-9a-f]{6}\b/gi)?.map((color) => color.toLowerCase()) ?? [],
  )
  for (const color of colors) {
    if (!allowed.has(color)) fail(`color ${color} is outside the approved companion palette`)
  }

  return errors
}

export async function validateCompanionAssets(repoRootUrl) {
  const repoRoot = new URL("./", repoRootUrl)
  const manifestUrl = new URL("content/assets/characters/manifest.json", repoRoot)
  const assetDirUrl = new URL("content/assets/characters/", repoRoot)
  const homepageUrl = new URL("content/index.md", repoRoot)
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"))
  const homepage = await readFile(homepageUrl, "utf8")
  const errors = []
  const assets = manifest.assets ?? []

  if (manifest.version !== 1) errors.push("manifest: unsupported or missing version")
  if (manifest.viewBox !== "0 0 200 150") errors.push('manifest: viewBox must be "0 0 200 150"')
  if (!Array.isArray(manifest.palette) || manifest.palette.length === 0) {
    errors.push("manifest: palette must be a non-empty array")
  }
  if (assets.length !== REQUIRED_IDS.length) {
    errors.push(`manifest: expected ${REQUIRED_IDS.length} assets, found ${assets.length}`)
  }

  const ids = assets.map((asset) => asset.id)
  if (new Set(ids).size !== ids.length) errors.push("manifest: asset ids must be unique")
  if (JSON.stringify(ids) !== JSON.stringify(REQUIRED_IDS)) {
    errors.push(`manifest: assets must be ordered ${REQUIRED_IDS.join(", ")}`)
  }

  const files = assets.map((asset) => asset.file)
  if (new Set(files).size !== files.length) errors.push("manifest: asset filenames must be unique")
  const diskFiles = (await readdir(assetDirUrl)).filter((file) => file.endsWith(".svg")).sort()
  const manifestFiles = [...files].sort()
  if (JSON.stringify(diskFiles) !== JSON.stringify(manifestFiles)) {
    errors.push("manifest: SVG files on disk must exactly match the manifest")
  }

  for (const asset of assets) {
    for (const field of REQUIRED_FIELDS) {
      if (typeof asset[field] !== "string" || asset[field].trim() === "") {
        errors.push(`${asset.id ?? "unknown"}: missing required field ${field}`)
      }
    }
    if (!/^#[0-9a-f]{6}$/i.test(asset.background ?? "")) {
      errors.push(`${asset.id ?? "unknown"}: background must be a six-digit hex color`)
    }

    try {
      const source = await readFile(new URL(asset.file, assetDirUrl), "utf8")
      errors.push(...validateSvgSource(source, asset.file, manifest.palette ?? []))
    } catch (error) {
      errors.push(`${asset.file}: ${error.code === "ENOENT" ? "file is missing" : error.message}`)
    }

    const escapedFile = asset.file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const referencePattern = new RegExp(
      `<img\\s+src=["']assets/characters/${escapedFile}["'][^>]*alt=["']["'][^>]*aria-hidden=["']true["'][^>]*>`,
      "g",
    )
    const references = homepage.match(referencePattern) ?? []
    if (references.length !== 1) {
      errors.push(`${asset.file}: homepage must contain exactly one decorative image reference`)
    }
  }

  return { assets, errors, manifest }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function renderReviewHtml(assets) {
  const cards = assets
    .map(
      (asset) => `
        <article style="--card:${escapeHtml(asset.background)}">
          <header><span>${escapeHtml(asset.action)}</span><h2>${escapeHtml(asset.companion)}</h2></header>
          <section class="course-card">
            <div><h3>${escapeHtml(asset.title)}</h3><b>${escapeHtml(asset.code)}</b></div>
            <img src="../../content/assets/characters/${encodeURIComponent(asset.file)}" alt="" />
          </section>
          <p><strong>${escapeHtml(asset.meaning)}</strong></p>
          <div class="tests">
            <div class="preview mono"><small>Monochrome</small><img src="../../content/assets/characters/${encodeURIComponent(asset.file)}" alt="" /></div>
            <div class="preview mobile"><small>120 × 110</small><img src="../../content/assets/characters/${encodeURIComponent(asset.file)}" alt="" /></div>
          </div>
        </article>`,
    )
    .join("\n")

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Fieldwork Companions — Generated Review</title>
<style>
:root{color-scheme:light dark;--paper:#f3efe5;--ink:#172536;--muted:#626b70;--line:#c9c1b1}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Georgia,serif}main{width:min(1380px,calc(100% - 32px));margin:auto;padding:40px 0 56px}.intro{display:grid;grid-template-columns:1.3fr .7fr;gap:32px;align-items:end;padding-bottom:22px;border-bottom:1px solid var(--line)}h1{max-width:820px;margin:0;font-size:clamp(36px,5vw,64px);font-weight:500;line-height:1}.intro p,article p{font-family:Arial,sans-serif;color:var(--muted);line-height:1.5}.family{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:26px}article{padding:12px;border:1px solid var(--line)}article header{min-height:50px}article header span,small,b{font:700 9px ui-monospace,monospace;text-transform:uppercase;letter-spacing:.1em}article header span{color:#315f98}h2{margin:5px 0 0;font-size:19px;font-weight:500}.course-card{min-height:250px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;border-radius:10px;background:var(--card);color:#fff}.course-card h3{max-width:16ch;margin:0;font:700 24px/1.08 Arial,sans-serif}.course-card b{display:block;margin-top:8px}.course-card>img{width:min(82%,210px);height:130px;align-self:center;object-fit:contain}article>p{min-height:54px;margin:12px 2px 10px;font-size:12px}.tests{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding-top:10px;border-top:1px solid var(--line)}.preview{position:relative;min-height:80px;display:grid;place-items:center;background:#e7e1d6;overflow:hidden}.preview small{position:absolute;left:6px;top:5px}.preview img{width:106px;height:76px;object-fit:contain}.preview.mono img{filter:grayscale(1) contrast(1.2)}.preview.mobile{background:var(--card)}.preview.mobile small{color:#fff}@media(max-width:1100px){.family{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){main{width:min(100% - 20px,420px)}.intro,.family{grid-template-columns:1fr}article>p{min-height:0}}@media(prefers-color-scheme:dark){:root{--paper:#1d201f;--ink:#eee8dc;--muted:#b7b1a7;--line:#504d47}article{background:#242726}.preview{background:#d9d4ca}}
</style></head><body><main><section class="intro"><h1>Fieldwork Companions — Generated Review</h1><p>Generated from the production manifest and SVG files. Do not edit this review board by hand.</p></section><section class="family">${cards}</section></main></body></html>\n`
}

async function runCli() {
  const command = process.argv[2] ?? "check"
  const repoRoot = new URL("../", import.meta.url)
  const report = await validateCompanionAssets(repoRoot)
  if (report.errors.length > 0) {
    console.error(`Companion validation failed (${report.errors.length}):`)
    for (const error of report.errors) console.error(`- ${error}`)
    process.exitCode = 1
    return
  }

  if (command === "check") {
    console.log(`Validated ${report.assets.length} companion SVG assets and homepage references.`)
    return
  }
  if (command === "review") {
    const outputUrl = new URL(
      ".agents/design-explorations/fieldwork-companions-review.generated.html",
      repoRoot,
    )
    await writeFile(outputUrl, renderReviewHtml(report.assets), "utf8")
    console.log(`Generated ${fileURLToPath(outputUrl)}`)
    return
  }

  console.error(`Unknown command: ${command}. Use "check" or "review".`)
  process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await runCli()
