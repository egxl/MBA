import test, { describe, beforeEach } from "node:test"
import assert from "node:assert"
import { FileTrieNode } from "./fileTrie"
import { FullSlug } from "./path"

interface TestData {
  title: string
  slug: string
  filePath: string
}

describe("FileTrie", () => {
  let trie: FileTrieNode<TestData>

  beforeEach(() => {
    trie = new FileTrieNode<TestData>([])
  })

  describe("constructor", () => {
    test("should create an empty trie", () => {
      assert.deepStrictEqual(trie.children, [])
      assert.strictEqual(trie.slug, "")
      assert.strictEqual(trie.displayName, "")
      assert.strictEqual(trie.data, null)
    })

    test("should set displayName from data title", () => {
      const data = {
        title: "Test Title",
        slug: "test",
        filePath: "test.md",
      }

      trie.add(data)
      assert.strictEqual(trie.children[0].displayName, "Test Title")
    })

    test("should be able to set displayName", () => {
      const data = {
        title: "Test Title",
        slug: "test",
        filePath: "test.md",
      }

      trie.add(data)
      trie.children[0].displayName = "Modified"
      assert.strictEqual(trie.children[0].displayName, "Modified")
    })
  })

  describe("add", () => {
    test("should add a file at root level", () => {
      const data = {
        title: "Test",
        slug: "test",
        filePath: "test.md",
      }

      trie.add(data)
      assert.strictEqual(trie.children.length, 1)
      assert.strictEqual(trie.children[0].slug, "test")
      assert.strictEqual(trie.children[0].data, data)
    })

    test("should handle index files", () => {
      const data = {
        title: "Index",
        slug: "index",
        filePath: "index.md",
      }

      trie.add(data)
      assert.strictEqual(trie.data, data)
      assert.strictEqual(trie.children.length, 0)
    })

    test("should add nested files", () => {
      const data1 = {
        title: "Nested",
        slug: "folder/test",
        filePath: "folder/test.md",
      }

      const data2 = {
        title: "Really nested index",
        slug: "a/b/c/index",
        filePath: "a/b/c/index.md",
      }

      trie.add(data1)
      trie.add(data2)
      assert.strictEqual(trie.children.length, 2)
      assert.strictEqual(trie.children[0].slug, "folder/index")
      assert.strictEqual(trie.children[0].children.length, 1)
      assert.strictEqual(trie.children[0].children[0].slug, "folder/test")
      assert.strictEqual(trie.children[0].children[0].data, data1)

      assert.strictEqual(trie.children[1].slug, "a/index")
      assert.strictEqual(trie.children[1].children.length, 1)
      assert.strictEqual(trie.children[1].data, null)

      assert.strictEqual(trie.children[1].children[0].slug, "a/b/index")
      assert.strictEqual(trie.children[1].children[0].children.length, 1)
      assert.strictEqual(trie.children[1].children[0].data, null)

      assert.strictEqual(trie.children[1].children[0].children[0].slug, "a/b/c/index")
      assert.strictEqual(trie.children[1].children[0].children[0].data, data2)
      assert.strictEqual(trie.children[1].children[0].children[0].children.length, 0)
    })
  })

  describe("filter", () => {
    test("should filter nodes based on condition", () => {
      const data1 = { title: "Test1", slug: "test1", filePath: "test1.md" }
      const data2 = { title: "Test2", slug: "test2", filePath: "test2.md" }

      trie.add(data1)
      trie.add(data2)

      trie.filter((node) => node.slug !== "test1")
      assert.strictEqual(trie.children.length, 1)
      assert.strictEqual(trie.children[0].slug, "test2")
    })
  })

  describe("map", () => {
    test("should apply function to all nodes", () => {
      const data1 = { title: "Test1", slug: "test1", filePath: "test1.md" }
      const data2 = { title: "Test2", slug: "test2", filePath: "test2.md" }

      trie.add(data1)
      trie.add(data2)

      trie.map((node) => {
        if (node.data) {
          node.data.title = "Modified"
        }
      })

      assert.strictEqual(trie.children[0].displayName, "Modified")
      assert.strictEqual(trie.children[1].displayName, "Modified")
    })

    test("map over folders should work", () => {
      const data1 = { title: "Test1", slug: "test1", filePath: "test1.md" }
      const data2 = {
        title: "Test2",
        slug: "a/b-with-space/test2",
        filePath: "a/b with space/test2.md",
      }

      trie.add(data1)
      trie.add(data2)

      trie.map((node) => {
        if (node.isFolder) {
          node.displayName = `Folder: ${node.displayName}`
        } else {
          node.displayName = `File: ${node.displayName}`
        }
      })

      assert.strictEqual(trie.children[0].displayName, "File: Test1")
      assert.strictEqual(trie.children[1].displayName, "Folder: a")
      assert.strictEqual(trie.children[1].children[0].displayName, "Folder: b with space")
      assert.strictEqual(trie.children[1].children[0].children[0].displayName, "File: Test2")
    })
  })

  describe("entries", () => {
    test("should return all entries", () => {
      const data1 = { title: "Test1", slug: "test1", filePath: "test1.md" }
      const data2 = {
        title: "Test2",
        slug: "a/b-with-space/test2",
        filePath: "a/b with space/test2.md",
      }

      trie.add(data1)
      trie.add(data2)

      const entries = trie.entries()
      assert.deepStrictEqual(
        entries.map(([path, node]) => [path, node.data]),
        [
          ["index", trie.data],
          ["test1", data1],
          ["a/index", null],
          ["a/b-with-space/index", null],
          ["a/b-with-space/test2", data2],
        ],
      )
    })
  })

  describe("fromEntries", () => {
    test("nested", () => {
      const trie = FileTrieNode.fromEntries([
        ["index" as FullSlug, { title: "Root", slug: "index", filePath: "index.md" }],
        [
          "folder/file1" as FullSlug,
          { title: "File 1", slug: "folder/file1", filePath: "folder/file1.md" },
        ],
        [
          "folder/index" as FullSlug,
          { title: "Folder Index", slug: "folder/index", filePath: "folder/index.md" },
        ],
        [
          "folder/file2" as FullSlug,
          { title: "File 2", slug: "folder/file2", filePath: "folder/file2.md" },
        ],
        [
          "folder/folder2/index" as FullSlug,
          {
            title: "Subfolder Index",
            slug: "folder/folder2/index",
            filePath: "folder/folder2/index.md",
          },
        ],
      ])

      assert.strictEqual(trie.children.length, 1)
      assert.strictEqual(trie.children[0].slug, "folder/index")
      assert.strictEqual(trie.children[0].children.length, 3)
      assert.strictEqual(trie.children[0].children[0].slug, "folder/file1")
      assert.strictEqual(trie.children[0].children[1].slug, "folder/file2")
      assert.strictEqual(trie.children[0].children[2].slug, "folder/folder2/index")
      assert.strictEqual(trie.children[0].children[2].children.length, 0)
    })
  })

  describe("findNode", () => {
    test("should find root node with empty path", () => {
      const data = { title: "Root", slug: "index", filePath: "index.md" }
      trie.add(data)
      const found = trie.findNode([])
      assert.strictEqual(found, trie)
    })

    test("should find node at first level", () => {
      const data = { title: "Test", slug: "test", filePath: "test.md" }
      trie.add(data)
      const found = trie.findNode(["test"])
      assert.strictEqual(found?.data, data)
    })

    test("should find nested node", () => {
      const data = {
        title: "Nested",
        slug: "folder/subfolder/test",
        filePath: "folder/subfolder/test.md",
      }
      trie.add(data)
      const found = trie.findNode(["folder", "subfolder", "test"])
      assert.strictEqual(found?.data, data)

      // should find the folder and subfolder indexes too
      assert.strictEqual(
        trie.findNode(["folder", "subfolder", "index"]),
        trie.children[0].children[0],
      )
      assert.strictEqual(trie.findNode(["folder", "index"]), trie.children[0])
    })

    test("should return undefined for non-existent path", () => {
      const data = { title: "Test", slug: "test", filePath: "test.md" }
      trie.add(data)
      const found = trie.findNode(["nonexistent"])
      assert.strictEqual(found, undefined)
    })

    test("should return undefined for partial path", () => {
      const data = {
        title: "Nested",
        slug: "folder/subfolder/test",
        filePath: "folder/subfolder/test.md",
      }
      trie.add(data)
      const found = trie.findNode(["folder"])
      assert.strictEqual(found?.data, null)
    })
  })

  describe("getFolderPaths", () => {
    test("should return all folder paths", () => {
      const data1 = {
        title: "Root",
        slug: "index",
        filePath: "index.md",
      }
      const data2 = {
        title: "Test",
        slug: "folder/subfolder/test",
        filePath: "folder/subfolder/test.md",
      }
      const data3 = {
        title: "Folder Index",
        slug: "abc/index",
        filePath: "abc/index.md",
      }

      trie.add(data1)
      trie.add(data2)
      trie.add(data3)
      const paths = trie.getFolderPaths()

      assert.deepStrictEqual(paths, [
        "index",
        "folder/index",
        "folder/subfolder/index",
        "abc/index",
      ])
    })
  })

  describe("sort", () => {
    test("should sort nodes according to sort function", () => {
      const data1 = { title: "A", slug: "a", filePath: "a.md" }
      const data2 = { title: "B", slug: "b", filePath: "b.md" }
      const data3 = { title: "C", slug: "c", filePath: "c.md" }

      trie.add(data3)
      trie.add(data1)
      trie.add(data2)

      trie.sort((a, b) => a.slug.localeCompare(b.slug))
      assert.deepStrictEqual(
        trie.children.map((n) => n.slug),
        ["a", "b", "c"],
      )
    })

    test("should enforce natural alphanumeric sorting with numeric collation", () => {
      const naturalSortFn = (a: any, b: any) => {
        // Prioritize courses/ at the root level of the explorer tree
        if (a.slugSegment === "courses" && b.slugSegment !== "courses") {
          return -1
        }
        if (b.slugSegment === "courses" && a.slugSegment !== "courses") {
          return 1
        }

        if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
          const cmp = a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
          if (cmp !== 0) return cmp
          return a.slugSegment.localeCompare(b.slugSegment, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
        return !a.isFolder && b.isFolder ? 1 : -1
      }

      // Add other root folders alongside courses to test root-level prioritization
      const mockEntries: [any, any][] = [
        ["about", { title: "About Us", slug: "about", filePath: "about.md" }],
        [
          "resources/guides",
          { title: "Study Guides", slug: "resources/guides", filePath: "resources/guides.md" },
        ],
        [
          "courses/mk10-advanced-strategy/index",
          {
            title: "MK 10: Advanced Strategy",
            slug: "courses/mk10-advanced-strategy/index",
            filePath: "courses/mk10-advanced-strategy/index.md",
          },
        ],
        [
          "courses/mk2-financial-management/index",
          {
            title: "MK 2: Financial Management",
            slug: "courses/mk2-financial-management/index",
            filePath: "courses/mk2-financial-management/index.md",
          },
        ],
        [
          "courses/mk1-organizational-behavior/index",
          {
            title: "MK 1: Organizational Behavior",
            slug: "courses/mk1-organizational-behavior/index",
            filePath: "courses/mk1-organizational-behavior/index.md",
          },
        ],
        [
          "courses/mk1-organizational-behavior/week-10/index",
          {
            title: "Week 10: Capstone",
            slug: "courses/mk1-organizational-behavior/week-10/index",
            filePath: "courses/mk1-organizational-behavior/week-10/index.md",
          },
        ],
        [
          "courses/mk1-organizational-behavior/week-02/index",
          {
            title: "Week 02: Teams",
            slug: "courses/mk1-organizational-behavior/week-02/index",
            filePath: "courses/mk1-organizational-behavior/week-02/index.md",
          },
        ],
        [
          "courses/mk1-organizational-behavior/week-01/index",
          {
            title: "Week 01: Intro",
            slug: "courses/mk1-organizational-behavior/week-01/index",
            filePath: "courses/mk1-organizational-behavior/week-01/index.md",
          },
        ],
        [
          "courses/mk1-organizational-behavior/week-01/quiz-10-review",
          {
            title: "Quiz 10 Review",
            slug: "courses/mk1-organizational-behavior/week-01/quiz-10-review",
            filePath: "courses/mk1-organizational-behavior/week-01/quiz-10-review.md",
          },
        ],
        [
          "courses/mk1-organizational-behavior/week-01/quiz-02-review",
          {
            title: "Quiz 02 Review",
            slug: "courses/mk1-organizational-behavior/week-01/quiz-02-review",
            filePath: "courses/mk1-organizational-behavior/week-01/quiz-02-review.md",
          },
        ],
        [
          "courses/mk1-organizational-behavior/week-01/quiz-01-review",
          {
            title: "Quiz 01 Review",
            slug: "courses/mk1-organizational-behavior/week-01/quiz-01-review",
            filePath: "courses/mk1-organizational-behavior/week-01/quiz-01-review.md",
          },
        ],
      ]

      const testTrie = FileTrieNode.fromEntries(mockEntries)
      testTrie.sort(naturalSortFn)

      // Verify courses/ is prioritized at the root level ahead of other folders
      assert.strictEqual(testTrie.children[0].slugSegment, "courses")

      const coursesNode = testTrie.children.find((c) => c.slugSegment === "courses")!
      assert.deepStrictEqual(
        coursesNode.children.map((c) => c.displayName),
        ["MK 1: Organizational Behavior", "MK 2: Financial Management", "MK 10: Advanced Strategy"],
      )

      const mk1Node = coursesNode.children.find(
        (c) => c.slugSegment === "mk1-organizational-behavior",
      )!
      assert.deepStrictEqual(
        mk1Node.children.map((c) => c.displayName),
        ["Week 01: Intro", "Week 02: Teams", "Week 10: Capstone"],
      )

      const week1Node = mk1Node.children.find((c) => c.slugSegment === "week-01")!
      assert.deepStrictEqual(
        week1Node.children.map((c) => c.displayName),
        ["Quiz 01 Review", "Quiz 02 Review", "Quiz 10 Review"],
      )
    })
  })

  describe("pathToNode", () => {
    test("should return root node for empty path", () => {
      const data = { title: "Root", slug: "index", filePath: "index.md" }
      trie.add(data)
      const path = trie.ancestryChain([])
      assert.deepStrictEqual(path, [trie])
    })

    test("should return root node for index path", () => {
      const data = { title: "Root", slug: "index", filePath: "index.md" }
      trie.add(data)
      const path = trie.ancestryChain(["index"])
      assert.deepStrictEqual(path, [trie])
    })

    test("should return path to first level node", () => {
      const data = { title: "Test", slug: "test", filePath: "test.md" }
      trie.add(data)
      const path = trie.ancestryChain(["test"])
      assert.deepStrictEqual(path, [trie, trie.children[0]])
    })

    test("should return path to nested node", () => {
      const data = {
        title: "Nested",
        slug: "folder/subfolder/test",
        filePath: "folder/subfolder/test.md",
      }
      trie.add(data)
      const path = trie.ancestryChain(["folder", "subfolder", "test"])
      assert.deepStrictEqual(path, [
        trie,
        trie.children[0],
        trie.children[0].children[0],
        trie.children[0].children[0].children[0],
      ])
    })

    test("should return undefined for non-existent path", () => {
      const data = { title: "Test", slug: "test", filePath: "test.md" }
      trie.add(data)
      const path = trie.ancestryChain(["nonexistent"])
      assert.strictEqual(path, undefined)
    })

    test("should return file data for intermediate folders", () => {
      const data1 = {
        title: "Root",
        slug: "index",
        filePath: "index.md",
      }
      const data2 = {
        title: "Test",
        slug: "folder/subfolder/test",
        filePath: "folder/subfolder/test.md",
      }
      const data3 = {
        title: "Folder Index",
        slug: "folder/index",
        filePath: "folder/index.md",
      }

      trie.add(data1)
      trie.add(data2)
      trie.add(data3)
      const path = trie.ancestryChain(["folder", "subfolder"])
      assert.deepStrictEqual(path, [trie, trie.children[0], trie.children[0].children[0]])
      assert.strictEqual(path[1].data, data3)
    })

    test("should return path for partial path", () => {
      const data = {
        title: "Nested",
        slug: "folder/subfolder/test",
        filePath: "folder/subfolder/test.md",
      }
      trie.add(data)
      const path = trie.ancestryChain(["folder"])
      assert.deepStrictEqual(path, [trie, trie.children[0]])
    })
  })
})
