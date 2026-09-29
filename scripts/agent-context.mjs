#!/usr/bin/env node

import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const run = (command, args) => {
  try {
    return execFileSync(command, args, { cwd: root, encoding: "utf8" }).trim()
  } catch {
    return "unavailable"
  }
}

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
const topLevel = readdirSync(root, { withFileTypes: true })
  .filter(
    (entry) =>
      !entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "public",
  )
  .map((entry) => `${entry.isDirectory() ? "dir " : "file"} ${entry.name}`)

console.log("# MBA agent context")
console.log(`root: ${root}`)
console.log(`branch: ${run("git", ["branch", "--show-current"])}`)
console.log(`status:\n${run("git", ["status", "--short"]) || "clean"}`)
console.log("\n## Commands")
for (const [name, command] of Object.entries(packageJson.scripts ?? {}))
  console.log(`- npm run ${name}: ${command}`)
console.log("\n## Top-level map")
console.log(topLevel.join("\n"))
console.log("\n## Agent state")
for (const file of ["AGENTS.md", ".agents/project-context.md", ".agents/current-task.md"]) {
  console.log(`- ${file}: ${existsSync(join(root, file)) ? "present" : "missing"}`)
}
