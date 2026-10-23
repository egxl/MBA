/**
 * Helper utilities and state management for Text-to-Speech (TTS)
 */

export interface ParagraphChunk {
  id: string
  index: number
  text: string
  wordCount: number
  element?: any
}

export interface AudioDuration {
  totalSeconds: number
  formatted: string
}

export type PlaybackState = "idle" | "loading" | "playing" | "paused" | "stopped"
export type VoiceGender = "female" | "male"

export interface ITTSProvider {
  name: "webspeech" | "http-api"
  speak(
    text: string,
    lang: string,
    rate: number,
    gender: VoiceGender,
    onEnd: () => void,
    onError: (err: any) => void,
  ): void
  pause(): void
  resume(): void
  stop(): void
  setRate(rate: number): void
}

/**
 * Format duration in seconds to MM:SS string
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00"
  const rounded = Math.floor(seconds)
  const mins = Math.floor(rounded / 60)
  const secs = rounded % 60
  const padMins = mins.toString().padStart(2, "0")
  const padSecs = secs.toString().padStart(2, "0")
  return `${padMins}:${padSecs}`
}

/**
 * Estimate spoken duration given a word count and reading rate
 * Typical speech rate is 150 words per minute
 */
export function estimateAudioDuration(words: number, wpm: number = 150): AudioDuration {
  if (words <= 0) return { totalSeconds: 0, formatted: "00:00" }
  const totalSeconds = Math.ceil((words / wpm) * 60)
  return {
    totalSeconds,
    formatted: formatTime(totalSeconds),
  }
}

/**
 * Count words in a string
 */
export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/**
 * Resolve language attribute from document or fallback to en-US
 */
export function resolveSpeechLanguage(langAttr?: string | null): string {
  if (!langAttr) return "en-US"
  const normalized = langAttr.trim().toLowerCase()
  if (normalized.startsWith("id")) return "id-ID"
  if (normalized.startsWith("en")) return "en-US"
  return langAttr
}

/**
 * Calculate which chunk index corresponds to a seek percentage (0 - 100)
 */
export function calculateSeekIndex(percent: number, totalChunks: number): number {
  if (totalChunks <= 0) return 0
  const clamped = Math.max(0, Math.min(100, percent))
  const rawIndex = Math.floor((clamped / 100) * totalChunks)
  return Math.max(0, Math.min(totalChunks - 1, rawIndex))
}

/**
 * Classify a voice as female or male based on standard voice names
 */
export function classifyVoiceGender(voice: { name: string }): VoiceGender {
  const name = voice.name.toLowerCase()
  const femaleKeywords = [
    "female",
    "zira",
    "jenny",
    "samantha",
    "victoria",
    "karen",
    "susan",
    "fiona",
    "damayanti",
    "gadis",
    "aria",
    "ava",
    "emma",
    "catherine",
    "lisa",
    "helena",
    "woman",
    "girl",
    "hazel",
    "moira",
    "tessa",
  ]
  const maleKeywords = [
    "male",
    "david",
    "mark",
    "alex",
    "george",
    "guy",
    "ardi",
    "daniel",
    "oliver",
    "james",
    "brian",
    "tom",
    "man",
    "boy",
    "richard",
    "fred",
    "lee",
  ]

  for (const kw of femaleKeywords) {
    if (name.includes(kw)) return "female"
  }
  for (const kw of maleKeywords) {
    if (name.includes(kw)) return "male"
  }
  // Default to female for voice synthesis if ambiguous
  return "female"
}

/**
 * Select the best voice matching language and requested gender
 */
export function selectVoice<T extends { name: string; lang: string; default?: boolean }>(
  voices: T[],
  lang: string,
  preferredGender: VoiceGender,
): T | null {
  if (!voices || voices.length === 0) return null

  const targetLang = lang.toLowerCase().replace("_", "-")
  const langPrefix = targetLang.split("-")[0]

  // 1. Same exact language + preferred gender
  const exactGender = voices.find(
    (v) =>
      v.lang.toLowerCase().replace("_", "-") === targetLang &&
      classifyVoiceGender(v) === preferredGender,
  )
  if (exactGender) return exactGender

  // 2. Same language prefix + preferred gender
  const prefixGender = voices.find(
    (v) =>
      v.lang.toLowerCase().replace("_", "-").startsWith(langPrefix) &&
      classifyVoiceGender(v) === preferredGender,
  )
  if (prefixGender) return prefixGender

  // 3. Exact language match (any gender)
  const exactAny = voices.find((v) => v.lang.toLowerCase().replace("_", "-") === targetLang)
  if (exactAny) return exactAny

  // 4. Language prefix match (any gender)
  const prefixAny = voices.find((v) =>
    v.lang.toLowerCase().replace("_", "-").startsWith(langPrefix),
  )
  if (prefixAny) return prefixAny

  // 5. Any voice of preferred gender
  const anyGender = voices.find((v) => classifyVoiceGender(v) === preferredGender)
  if (anyGender) return anyGender

  // 6. Default or first voice
  return voices.find((v) => v.default) || voices[0] || null
}

/**
 * Sanitize an element text for speech:
 * Removes markdown code blocks, equations, svg text, and internal anchors
 */
export function sanitizeTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ") // code fences
    .replace(/`[^`]+`/g, " ") // inline code
    .replace(/\$\$[\s\S]*?\$\$/g, " ") // display math
    .replace(/\$[^\$]+\$/g, " ") // inline math
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // markdown links -> link text
    .replace(/[#*_\~]/g, "") // markdown symbols
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Extract paragraph chunks from an article DOM element
 */
export function extractArticleChunks(articleEl: HTMLElement | null): ParagraphChunk[] {
  if (!articleEl) return []

  // Select readable narrative elements: paragraphs, headings, blockquotes, list items
  const candidates = articleEl.querySelectorAll<HTMLElement>(
    "p, h1, h2, h3, h4, h5, h6, blockquote, li",
  )
  const chunks: ParagraphChunk[] = []
  let index = 0

  candidates.forEach((el) => {
    // Skip parent elements if they contain child paragraphs or headings to avoid duplicates
    if (el.tagName === "BLOCKQUOTE" || el.tagName === "LI") {
      if (el.querySelector("p, h1, h2, h3, h4, h5, h6, li")) {
        return
      }
    }

    // Skip if inside code blocks, math wrappers, table of contents, or popovers
    if (
      el.closest("pre") ||
      el.closest("code") ||
      el.closest(".katex") ||
      el.closest(".katex-html") ||
      el.closest(".toc") ||
      el.closest(".popover") ||
      el.closest(".transclude")
    ) {
      return
    }

    // Skip empty or trivial elements
    const rawText = el.innerText || el.textContent || ""
    const clean = sanitizeTextForSpeech(rawText)
    const wordCount = countWords(clean)

    if (wordCount < 2) return

    chunks.push({
      id: `tts-chunk-${index}`,
      index,
      text: clean,
      wordCount,
      element: el,
    })
    index++
  })

  return chunks
}

/**
 * Web Speech API Provider (Browser Native)
 * Hardened against Chromium cancel race, 15-second hang, and garbage collection bugs.
 */
export class WebSpeechTTSProvider implements ITTSProvider {
  name: "webspeech" = "webspeech"
  private synth: SpeechSynthesis | null = null
  private keepAliveTimer: any = null

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.synth?.getVoices()
        }
      }
    }
  }

  private startKeepAlive(): void {
    this.stopKeepAlive()
    if (!this.synth) return
    this.keepAliveTimer = setInterval(() => {
      if (!this.synth || !this.synth.speaking) {
        this.stopKeepAlive()
        return
      }
      this.synth.pause()
      this.synth.resume()
    }, 10000)
  }

  private stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer)
      this.keepAliveTimer = null
    }
  }

  speak(
    text: string,
    lang: string,
    rate: number,
    gender: VoiceGender,
    onEnd: () => void,
    onError: (err: any) => void,
  ): void {
    if (!this.synth) {
      onError(new Error("Web Speech Synthesis API not supported in this browser"))
      return
    }

    // Ensure synth is resumed if previously paused
    if (this.synth.paused) {
      this.synth.resume()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = Math.max(0.5, Math.min(2.5, rate))

    const voices = this.synth.getVoices()
    const chosenVoice = selectVoice(voices, lang, gender)
    if (chosenVoice) {
      utterance.voice = chosenVoice
      utterance.lang = chosenVoice.lang
    } else {
      utterance.lang = lang
    }

    utterance.onend = () => {
      this.stopKeepAlive()
      if (typeof window !== "undefined") {
        ;(window as any).__tts_utterance = null
      }
      onEnd()
    }

    utterance.onerror = (e) => {
      this.stopKeepAlive()
      if (typeof window !== "undefined") {
        ;(window as any).__tts_utterance = null
      }
      // Cancel / interrupt events are expected when skipping or stopping
      if (e.error === "canceled" || e.error === "interrupted") return
      onError(e)
    }

    // Keep global reference to prevent Chromium garbage collection abort
    if (typeof window !== "undefined") {
      ;(window as any).__tts_utterance = utterance
    }

    this.startKeepAlive()
    this.synth.speak(utterance)
  }

  pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause()
    }
  }

  resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume()
    }
  }

  stop(): void {
    this.stopKeepAlive()
    if (this.synth) {
      this.synth.cancel()
    }
    if (typeof window !== "undefined") {
      ;(window as any).__tts_utterance = null
    }
  }

  setRate(_rate: number): void {
    // Rate applies to subsequent utterances
  }
}

/**
 * Free HTTP Audio TTS Provider (Fallback)
 */
export class HttpApiTTSProvider implements ITTSProvider {
  name: "http-api" = "http-api"
  private currentAudio: HTMLAudioElement | null = null

  speak(
    text: string,
    lang: string,
    rate: number,
    _gender: VoiceGender,
    onEnd: () => void,
    onError: (err: any) => void,
  ): void {
    this.stop()

    const shortLang = lang.split("-")[0] || "en"
    const truncated = text.length > 180 ? text.substring(0, 177) + "..." : text
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
      shortLang,
    )}&q=${encodeURIComponent(truncated)}`

    try {
      const audio = new Audio()
      ;(audio as any).referrerPolicy = "no-referrer"
      audio.src = url
      audio.playbackRate = Math.max(0.5, Math.min(2.0, rate))

      audio.onended = () => {
        this.currentAudio = null
        onEnd()
      }
      audio.onerror = (e) => {
        this.currentAudio = null
        onError(e)
      }
      this.currentAudio = audio
      audio.play().catch(onError)
    } catch (err) {
      onError(err)
    }
  }

  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause()
    }
  }

  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(() => {})
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
  }

  setRate(rate: number): void {
    if (this.currentAudio) {
      this.currentAudio.playbackRate = Math.max(0.5, Math.min(2.0, rate))
    }
  }
}
