import test from "node:test"
import assert from "node:assert/strict"
import { pLimit } from "./aggregate-cohort-submissions.mjs"

test("pLimit executes all items within concurrency limit", async () => {
  let active = 0
  let maxActive = 0
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  const results = await pLimit(items, 3, async (item) => {
    active++
    maxActive = Math.max(maxActive, active)
    await new Promise((resolve) => setTimeout(resolve, 10))
    active--
    return item * 2
  })

  assert.equal(results.length, 10)
  assert.deepEqual(results, [2, 4, 6, 8, 10, 12, 14, 16, 18, 20])
  assert.ok(maxActive <= 3, `Max active concurrency ${maxActive} should be <= 3`)
})

test("MIND ID regex matches holding and major operating subsidiaries", () => {
  const mindIdPattern =
    /(?:mind[\s_-]*id|mineral\s*industri|bukit\s*asam|ptba|antam|aneka\s*tambang|timah|inalum|asahan\s*alumin|vale|freeport)/i

  assert.ok(mindIdPattern.test("PT Mineral Industri Indonesia (Persero) | MIND ID"))
  assert.ok(mindIdPattern.test("PT Bukit Asam (Persero) Tbk."))
  assert.ok(mindIdPattern.test("PTBA"))
  assert.ok(mindIdPattern.test("PT Aneka Tambang Tbk"))
  assert.ok(mindIdPattern.test("PT Timah Tbk"))
  assert.ok(mindIdPattern.test("PT Inalum"))
  assert.ok(mindIdPattern.test("PT Vale Indonesia Tbk"))
  assert.ok(!mindIdPattern.test("PT Kereta Api Indonesia"))
  assert.ok(!mindIdPattern.test("PT Bank Mandiri (Persero) Tbk"))
})
