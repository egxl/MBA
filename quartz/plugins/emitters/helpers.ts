import path from "path"
import fs from "fs"
import { BuildCtx } from "../../util/ctx"
import { FilePath, FullSlug, joinSegments } from "../../util/path"
import { Readable } from "stream"

type WriteOptions = {
  ctx: BuildCtx
  slug: FullSlug
  ext: `.${string}` | ""
  content: string | Buffer | Readable
}

export const write = async ({ ctx, slug, ext, content }: WriteOptions): Promise<FilePath> => {
  const pathToPage = joinSegments(ctx.argv.output, slug + ext) as FilePath
  const dir = path.dirname(pathToPage)

  let retries = 10
  while (retries > 0) {
    try {
      await fs.promises.mkdir(dir, { recursive: true })
      await fs.promises.writeFile(pathToPage, content)
      break
    } catch (err: any) {
      if (
        (err?.code === "EPERM" || err?.code === "ENOENT" || err?.code === "EBUSY") &&
        retries > 1
      ) {
        retries--
        await new Promise((r) => setTimeout(r, 100))
      } else {
        throw err
      }
    }
  }
  return pathToPage
}
