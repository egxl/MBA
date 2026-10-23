import test, { describe } from "node:test"
import assert from "node:assert/strict"
import {
  formatTime,
  estimateAudioDuration,
  countWords,
  resolveSpeechLanguage,
  calculateSeekIndex,
  sanitizeTextForSpeech,
  extractArticleChunks,
  classifyVoiceGender,
  selectVoice,
} from "./tts.helpers"

describe("TTS Helpers", () => {
  describe("formatTime", () => {
    test("formats 0 seconds to 00:00", () => {
      assert.equal(formatTime(0), "00:00")
    })

    test("formats seconds under a minute", () => {
      assert.equal(formatTime(45), "00:45")
    })

    test("formats minutes and seconds", () => {
      assert.equal(formatTime(125), "02:05")
      assert.equal(formatTime(3599), "59:59")
    })

    test("handles negative or invalid seconds gracefully", () => {
      assert.equal(formatTime(-10), "00:00")
      assert.equal(formatTime(NaN), "00:00")
    })
  })

  describe("countWords", () => {
    test("counts words in typical sentences", () => {
      assert.equal(countWords("The quick brown fox jumps"), 5)
    })

    test("handles extra whitespaces and empty strings", () => {
      assert.equal(countWords(""), 0)
      assert.equal(countWords("   "), 0)
      assert.equal(countWords("  one   two  three  "), 3)
    })
  })

  describe("estimateAudioDuration", () => {
    test("estimates duration at default 150 wpm", () => {
      // 150 words = 60 seconds -> 01:00
      const duration = estimateAudioDuration(150, 150)
      assert.equal(duration.totalSeconds, 60)
      assert.equal(duration.formatted, "01:00")
    })

    test("estimates duration for 300 words", () => {
      const duration = estimateAudioDuration(300, 150)
      assert.equal(duration.totalSeconds, 120)
      assert.equal(duration.formatted, "02:00")
    })

    test("returns 00:00 for empty or zero words", () => {
      assert.equal(estimateAudioDuration(0).formatted, "00:00")
      assert.equal(estimateAudioDuration(-5).formatted, "00:00")
    })
  })

  describe("resolveSpeechLanguage", () => {
    test("maps Indonesian lang tags to id-ID", () => {
      assert.equal(resolveSpeechLanguage("id"), "id-ID")
      assert.equal(resolveSpeechLanguage("id-ID"), "id-ID")
    })

    test("maps English lang tags to en-US", () => {
      assert.equal(resolveSpeechLanguage("en"), "en-US")
      assert.equal(resolveSpeechLanguage("en-US"), "en-US")
      assert.equal(resolveSpeechLanguage("en-GB"), "en-US")
    })

    test("falls back to en-US for empty/null input", () => {
      assert.equal(resolveSpeechLanguage(null), "en-US")
      assert.equal(resolveSpeechLanguage(undefined), "en-US")
      assert.equal(resolveSpeechLanguage(""), "en-US")
    })
  })

  describe("calculateSeekIndex", () => {
    test("calculates accurate chunk index based on percentage", () => {
      const total = 10
      assert.equal(calculateSeekIndex(0, total), 0)
      assert.equal(calculateSeekIndex(50, total), 5)
      assert.equal(calculateSeekIndex(99, total), 9)
      assert.equal(calculateSeekIndex(100, total), 9)
    })

    test("clamps percentage bounds [0, 100]", () => {
      const total = 5
      assert.equal(calculateSeekIndex(-10, total), 0)
      assert.equal(calculateSeekIndex(150, total), 4)
    })

    test("handles zero total chunks", () => {
      assert.equal(calculateSeekIndex(50, 0), 0)
    })
  })

  describe("sanitizeTextForSpeech", () => {
    test("strips markdown code blocks and inline code", () => {
      const input = "Here is code ```const x = 10;``` and inline `let y = 20` to test."
      const clean = sanitizeTextForSpeech(input)
      assert.equal(clean.includes("const x"), false)
      assert.equal(clean.includes("let y"), false)
      assert.equal(clean.includes("Here is code"), true)
      assert.equal(clean.includes("to test."), true)
    })

    test("strips math expressions", () => {
      const input = "Formula $$E = mc^2$$ and inline $W = Fd$ is physics."
      const clean = sanitizeTextForSpeech(input)
      assert.equal(clean.includes("mc^2"), false)
      assert.equal(clean.includes("Fd"), false)
      assert.equal(clean.includes("Formula"), true)
      assert.equal(clean.includes("is physics."), true)
    })

    test("simplifies markdown links to link text", () => {
      const input = "Read the [Operations Guide](https://example.com/guide) for details."
      const clean = sanitizeTextForSpeech(input)
      assert.equal(clean, "Read the Operations Guide for details.")
    })
  })

  describe("extractArticleChunks", () => {
    test("handles null element safely", () => {
      assert.deepEqual(extractArticleChunks(null), [])
    })

    test("filters out elements without sufficient words", () => {
      const mockArticle = {
        querySelectorAll: () => [
          {
            tagName: "P",
            innerText: "A",
            querySelector: () => null,
            closest: () => null,
          },
          {
            tagName: "P",
            innerText: "This is a valid sentence with enough words to read.",
            querySelector: () => null,
            closest: () => null,
          },
        ],
      } as unknown as HTMLElement

      const chunks = extractArticleChunks(mockArticle)
      assert.equal(chunks.length, 1)
      assert.equal(chunks[0].text, "This is a valid sentence with enough words to read.")
    })

    test("skips elements inside pre and katex", () => {
      const mockArticle = {
        querySelectorAll: () => [
          {
            tagName: "P",
            innerText: "Normal paragraph text to read.",
            querySelector: () => null,
            closest: () => null,
          },
          {
            tagName: "P",
            innerText: "Code content to skip.",
            querySelector: () => null,
            closest: (sel: string) => (sel === "pre" ? {} : null),
          },
        ],
      } as unknown as HTMLElement

      const chunks = extractArticleChunks(mockArticle)
      assert.equal(chunks.length, 1)
      assert.equal(chunks[0].text, "Normal paragraph text to read.")
    })
  })

  describe("classifyVoiceGender", () => {
    test("identifies female voices by name", () => {
      assert.equal(classifyVoiceGender({ name: "Microsoft Zira - English" }), "female")
      assert.equal(classifyVoiceGender({ name: "Samantha" }), "female")
      assert.equal(classifyVoiceGender({ name: "Google UK English Female" }), "female")
      assert.equal(
        classifyVoiceGender({ name: "Microsoft Gadis Online (Natural) - Indonesian" }),
        "female",
      )
    })

    test("identifies male voices by name", () => {
      assert.equal(classifyVoiceGender({ name: "Microsoft David - English" }), "male")
      assert.equal(classifyVoiceGender({ name: "Alex" }), "male")
      assert.equal(classifyVoiceGender({ name: "Google UK English Male" }), "male")
      assert.equal(
        classifyVoiceGender({ name: "Microsoft Ardi Online (Natural) - Indonesian" }),
        "male",
      )
    })
  })

  describe("selectVoice", () => {
    const mockVoices = [
      { name: "Microsoft David", lang: "en-US", default: true },
      { name: "Microsoft Zira", lang: "en-US", default: false },
      { name: "Microsoft Gadis", lang: "id-ID", default: false },
      { name: "Microsoft Ardi", lang: "id-ID", default: false },
    ]

    test("selects female voice when preferred", () => {
      const voice = selectVoice(mockVoices, "en-US", "female")
      assert.equal(voice?.name, "Microsoft Zira")
    })

    test("selects male voice when preferred", () => {
      const voice = selectVoice(mockVoices, "en-US", "male")
      assert.equal(voice?.name, "Microsoft David")
    })

    test("selects language-matching female voice for Indonesian", () => {
      const voice = selectVoice(mockVoices, "id-ID", "female")
      assert.equal(voice?.name, "Microsoft Gadis")
    })

    test("selects language-matching male voice for Indonesian", () => {
      const voice = selectVoice(mockVoices, "id-ID", "male")
      assert.equal(voice?.name, "Microsoft Ardi")
    })

    test("handles empty voices array gracefully", () => {
      assert.equal(selectVoice([], "en-US", "female"), null)
    })
  })
})
