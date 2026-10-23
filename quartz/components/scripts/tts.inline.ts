import {
  extractArticleChunks,
  formatTime,
  estimateAudioDuration,
  resolveSpeechLanguage,
  calculateSeekIndex,
  ParagraphChunk,
  PlaybackState,
  VoiceGender,
  ITTSProvider,
  WebSpeechTTSProvider,
  HttpApiTTSProvider,
} from "./tts.helpers"

// Global singleton state for TTS session
interface TTSSession {
  chunks: ParagraphChunk[]
  currentIndex: number
  state: PlaybackState
  rate: number
  voiceGender: VoiceGender
  totalSeconds: number
  elapsedSeconds: number
  activeTrackTitle: string
  activeTrackSlug: string
  engine: "webspeech" | "http-api"
  isMinimized: boolean
}

const savedGender =
  typeof localStorage !== "undefined"
    ? (localStorage.getItem("tts_voice_gender") as VoiceGender) || "female"
    : "female"

const session: TTSSession = {
  chunks: [],
  currentIndex: 0,
  state: "idle",
  rate: 1.0,
  voiceGender: savedGender === "male" ? "male" : "female",
  totalSeconds: 0,
  elapsedSeconds: 0,
  activeTrackTitle: "",
  activeTrackSlug: "",
  engine: "webspeech",
  isMinimized: false,
}

let webSpeechProvider: WebSpeechTTSProvider | null = null
let httpApiProvider: HttpApiTTSProvider | null = null
let autoMinimizedByNavDropdown = false

function getProvider(engine: "webspeech" | "http-api"): ITTSProvider {
  if (engine === "webspeech") {
    if (!webSpeechProvider) webSpeechProvider = new WebSpeechTTSProvider()
    return webSpeechProvider
  } else {
    if (!httpApiProvider) httpApiProvider = new HttpApiTTSProvider()
    return httpApiProvider
  }
}

function clearHighlight() {
  document.querySelectorAll(".tts-highlight-active").forEach((el) => {
    el.classList.remove("tts-highlight-active")
  })
}

function applyHighlight(index: number) {
  clearHighlight()
  const chunk = session.chunks[index]
  if (chunk && chunk.element) {
    chunk.element.classList.add("tts-highlight-active")
    // Smoothly scroll into view if needed
    const rect = chunk.element.getBoundingClientRect()
    const navbarOffset = 100
    if (rect.top < navbarOffset || rect.bottom > window.innerHeight) {
      chunk.element.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }
}

function updateUI() {
  const shelf = document.getElementById("tts-player-shelf")
  const playBtn = document.getElementById("tts-play-btn")
  const trackTitle = document.getElementById("tts-track-title")
  const timeElapsed = document.getElementById("tts-time-elapsed")
  const timeTotal = document.getElementById("tts-time-total")
  const paraIndicator = document.getElementById("tts-para-indicator")
  const scrubber = document.getElementById("tts-scrubber") as HTMLInputElement | null
  const speedBtn = document.getElementById("tts-speed-btn")
  const voiceBtn = document.getElementById("tts-voice-btn")
  const navbarBtn = document.querySelector<HTMLButtonElement>(".tts-navbar-btn")

  const isPlaying = session.state === "playing"
  const isPaused = session.state === "paused"
  const isActive = isPlaying || isPaused

  // Update navbar indicator
  if (navbarBtn) {
    navbarBtn.classList.toggle("is-active", isActive)
    navbarBtn.setAttribute("aria-pressed", isActive ? "true" : "false")
  }

  // Update shelf visibility: only open if active or stopped, and NOT minimized
  if (shelf) {
    const shouldBeOpen = (isActive || session.state === "stopped") && !session.isMinimized
    shelf.classList.toggle("open", shouldBeOpen)
    shelf.setAttribute("aria-hidden", shouldBeOpen ? "false" : "true")
  }

  // Update track title
  if (trackTitle) {
    trackTitle.textContent = session.activeTrackTitle || "No track selected"
  }

  // Update play/pause button icon & label
  if (playBtn) {
    playBtn.setAttribute("aria-label", isPlaying ? "Pause audio" : "Play audio")
    playBtn.setAttribute("title", isPlaying ? "Pause audio" : "Play audio")
    const playIcon = playBtn.querySelector(".icon-play") as HTMLElement | null
    const pauseIcon = playBtn.querySelector(".icon-pause") as HTMLElement | null
    if (playIcon) playIcon.style.display = isPlaying ? "none" : "block"
    if (pauseIcon) pauseIcon.style.display = isPlaying ? "block" : "none"
  }

  // Update speed button label
  if (speedBtn) {
    speedBtn.textContent = `${session.rate}x`
  }

  // Update voice gender button label
  if (voiceBtn) {
    const isFemale = session.voiceGender === "female"
    voiceBtn.textContent = isFemale ? "♀ Female" : "♂ Male"
    voiceBtn.setAttribute("title", `Voice: ${isFemale ? "Female" : "Male"}. Click to toggle.`)
    voiceBtn.setAttribute("aria-label", `Voice: ${isFemale ? "Female" : "Male"}. Click to toggle.`)
  }

  // Calculate elapsed seconds based on completed words
  if (session.chunks.length > 0) {
    let wordsSoFar = 0
    for (let i = 0; i < session.currentIndex; i++) {
      wordsSoFar += session.chunks[i].wordCount
    }
    const currentChunk = session.chunks[session.currentIndex]
    if (currentChunk) {
      wordsSoFar += Math.floor(currentChunk.wordCount * 0.5)
    }
    const wpm = 150 * session.rate
    session.elapsedSeconds = Math.min(session.totalSeconds, Math.ceil((wordsSoFar / wpm) * 60))
  }

  if (timeElapsed) {
    timeElapsed.textContent = formatTime(session.elapsedSeconds)
  }
  if (timeTotal) {
    timeTotal.textContent = formatTime(session.totalSeconds)
  }
  if (paraIndicator) {
    const currentNum = session.chunks.length > 0 ? session.currentIndex + 1 : 0
    paraIndicator.textContent = `P ${currentNum}/${session.chunks.length}`
  }

  // Update scrubber position
  if (scrubber && session.chunks.length > 0) {
    const percent = ((session.currentIndex + 0.5) / session.chunks.length) * 100
    scrubber.value = Math.min(100, Math.max(0, percent)).toFixed(1)
  }
}

function speakCurrentChunk() {
  if (session.currentIndex >= session.chunks.length) {
    // Finished track
    stopAudio()
    return
  }

  const chunk = session.chunks[session.currentIndex]
  if (!chunk) return

  session.state = "playing"
  applyHighlight(session.currentIndex)
  updateUI()

  const provider = getProvider(session.engine)
  const docLang = document.documentElement.lang || document.body.dataset.lang || "en"
  const lang = resolveSpeechLanguage(docLang)

  provider.speak(
    chunk.text,
    lang,
    session.rate,
    session.voiceGender,
    () => {
      // Chunk ended naturally -> advance without calling cancel
      if (session.state === "playing") {
        session.currentIndex++
        speakCurrentChunk()
      }
    },
    (err) => {
      console.warn("TTS Playback notice:", err)
      // On error, pause but NEVER collapse shelf or break state
      session.state = "paused"
      updateUI()
    },
  )
}

function playTrack(startIndex: number = 0) {
  const article = document.querySelector<HTMLElement>("article.popover-hint, article")
  if (!article) return

  session.isMinimized = false
  autoMinimizedByNavDropdown = false
  // Open shelf immediately
  const shelf = document.getElementById("tts-player-shelf")
  if (shelf) shelf.classList.add("open")

  // Extract chunks if empty or if page changed
  const currentSlug = document.body.dataset.slug || window.location.pathname
  if (session.chunks.length === 0 || session.activeTrackSlug !== currentSlug) {
    session.chunks = extractArticleChunks(article)
    session.activeTrackSlug = currentSlug
    const articleTitleEl = document.querySelector<HTMLElement>(
      "h1.article-title, .page-header h1, h1",
    )
    session.activeTrackTitle = articleTitleEl?.innerText?.trim() || document.title
    const totalWords = session.chunks.reduce((acc, c) => acc + c.wordCount, 0)
    session.totalSeconds = estimateAudioDuration(totalWords, 150).totalSeconds
  }

  if (session.chunks.length === 0) return

  session.currentIndex = Math.max(0, Math.min(session.chunks.length - 1, startIndex))
  speakCurrentChunk()
}

function pauseAudio() {
  if (session.state === "playing") {
    const provider = getProvider(session.engine)
    provider.pause()
    session.state = "paused"
    updateUI()
  }
}

function resumeAudio() {
  if (session.state === "paused") {
    const provider = getProvider(session.engine)
    provider.resume()
    session.state = "playing"
    updateUI()
  } else if (session.state === "idle" || session.state === "stopped") {
    playTrack(session.currentIndex)
  }
}

function togglePlayPause() {
  if (session.state === "playing") {
    pauseAudio()
  } else {
    resumeAudio()
  }
}

function minimizeAudio(fromNavDropdown: boolean = false) {
  session.isMinimized = true
  if (!fromNavDropdown) {
    autoMinimizedByNavDropdown = false
  }
  const shelf = document.getElementById("tts-player-shelf")
  if (shelf) {
    shelf.classList.remove("open")
    shelf.setAttribute("aria-hidden", "true")
  }
}

function restoreAudio() {
  session.isMinimized = false
  autoMinimizedByNavDropdown = false
  updateUI()
}

function stopAudio() {
  const provider = getProvider(session.engine)
  provider.stop()
  clearHighlight()
  session.state = "stopped"
  session.currentIndex = 0
  session.elapsedSeconds = 0
  session.isMinimized = false
  autoMinimizedByNavDropdown = false
  updateUI()

  // Collapse shelf
  const shelf = document.getElementById("tts-player-shelf")
  if (shelf) {
    shelf.classList.remove("open")
    shelf.setAttribute("aria-hidden", "true")
  }
}

function nextChunk() {
  if (session.currentIndex < session.chunks.length - 1) {
    const provider = getProvider(session.engine)
    provider.stop()
    session.currentIndex++
    if (session.state === "playing") {
      setTimeout(() => speakCurrentChunk(), 40)
    } else {
      applyHighlight(session.currentIndex)
      updateUI()
    }
  }
}

function prevChunk() {
  if (session.currentIndex > 0) {
    const provider = getProvider(session.engine)
    provider.stop()
    session.currentIndex--
    if (session.state === "playing") {
      setTimeout(() => speakCurrentChunk(), 40)
    } else {
      applyHighlight(session.currentIndex)
      updateUI()
    }
  }
}

function seekToPercent(percent: number) {
  if (session.chunks.length === 0) return
  const provider = getProvider(session.engine)
  provider.stop()
  const targetIndex = calculateSeekIndex(percent, session.chunks.length)
  session.currentIndex = targetIndex
  if (session.state === "playing") {
    setTimeout(() => speakCurrentChunk(), 40)
  } else {
    applyHighlight(session.currentIndex)
    updateUI()
  }
}

function cycleSpeed() {
  const speeds = [1.0, 1.25, 1.5, 2.0, 0.75]
  const curIdx = speeds.indexOf(session.rate)
  const nextRate = speeds[(curIdx + 1) % speeds.length]
  session.rate = nextRate
  const provider = getProvider(session.engine)
  provider.setRate(nextRate)
  updateUI()
}

function toggleVoiceGender() {
  session.voiceGender = session.voiceGender === "female" ? "male" : "female"
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("tts_voice_gender", session.voiceGender)
  }
  updateUI()

  // If currently playing, restart the chunk with the newly chosen voice
  if (session.state === "playing") {
    const provider = getProvider(session.engine)
    provider.stop()
    setTimeout(() => speakCurrentChunk(), 40)
  }
}

function setupTTS() {
  // 1. Re-link chunk elements if user navigates back to active track
  const currentSlug = document.body.dataset.slug || window.location.pathname
  if (session.activeTrackSlug === currentSlug && session.chunks.length > 0) {
    const article = document.querySelector<HTMLElement>("article.popover-hint, article")
    if (article) {
      const refreshedChunks = extractArticleChunks(article)
      for (let i = 0; i < session.chunks.length; i++) {
        if (refreshedChunks[i]) {
          session.chunks[i].element = refreshedChunks[i].element
        }
      }
      if (session.state === "playing" || session.state === "paused") {
        applyHighlight(session.currentIndex)
      }
    }
  }

  // 2. Wire up In-Page Track Selector Pills
  const trackSelectors = document.querySelectorAll<HTMLButtonElement>(".tts-track-selector")
  trackSelectors.forEach((btn) => {
    const handleTrackSelect = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      session.isMinimized = false
      playTrack(0)
    }
    btn.addEventListener("click", handleTrackSelect)
    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => btn.removeEventListener("click", handleTrackSelect))
    }
  })

  // 3. Wire up Navbar Button
  const navbarBtn = document.querySelector<HTMLButtonElement>(".tts-navbar-btn")
  if (navbarBtn) {
    const handleNavBtnClick = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      if (session.isMinimized) {
        // If playing/paused in background, restore shelf into view
        restoreAudio()
      } else if (session.state === "playing") {
        pauseAudio()
      } else if (session.state === "paused") {
        resumeAudio()
      } else {
        // Idle or stopped: open shelf and play
        session.isMinimized = false
        const shelf = document.getElementById("tts-player-shelf")
        if (shelf) shelf.classList.add("open")
        playTrack(0)
      }
    }
    navbarBtn.addEventListener("click", handleNavBtnClick)
    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => navbarBtn.removeEventListener("click", handleNavBtnClick))
    }
  }

  // 4. Wire up Player Shelf Controls
  const playBtn = document.getElementById("tts-play-btn")
  const prevBtn = document.getElementById("tts-prev-btn")
  const nextBtn = document.getElementById("tts-next-btn")
  const speedBtn = document.getElementById("tts-speed-btn")
  const voiceBtn = document.getElementById("tts-voice-btn")
  const minimizeBtn = document.getElementById("tts-minimize-btn")
  const closeStopBtn = document.getElementById("tts-close-stop-btn")
  const scrubber = document.getElementById("tts-scrubber") as HTMLInputElement | null

  if (playBtn) {
    playBtn.addEventListener("click", togglePlayPause)
    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => playBtn.removeEventListener("click", togglePlayPause))
    }
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", prevChunk)
    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => prevBtn.removeEventListener("click", prevChunk))
    }
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", nextChunk)
    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => nextBtn.removeEventListener("click", nextChunk))
    }
  }
  if (speedBtn) {
    speedBtn.addEventListener("click", cycleSpeed)
    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => speedBtn.removeEventListener("click", cycleSpeed))
    }
  }
  if (voiceBtn) {
    voiceBtn.addEventListener("click", toggleVoiceGender)
    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => voiceBtn.removeEventListener("click", toggleVoiceGender))
    }
  }
  if (minimizeBtn) {
    const handleManualMinimize = () => {
      autoMinimizedByNavDropdown = false
      minimizeAudio(false)
    }
    minimizeBtn.addEventListener("click", handleManualMinimize)
    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => minimizeBtn.removeEventListener("click", handleManualMinimize))
    }
  }
  if (closeStopBtn) {
    closeStopBtn.addEventListener("click", stopAudio)
    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => closeStopBtn.removeEventListener("click", stopAudio))
    }
  }

  // 5. Scrubber input seeking
  if (scrubber) {
    const handleSeek = (e: Event) => {
      const val = parseFloat((e.target as HTMLInputElement).value)
      seekToPercent(val)
    }
    scrubber.addEventListener("change", handleSeek)
    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => scrubber.removeEventListener("change", handleSeek))
    }
  }

  // 6. Keyboard navigation (Esc to stop)
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && session.state !== "idle") {
      stopAudio()
    }
  }
  document.addEventListener("keydown", handleKeydown)
  if (typeof window.addCleanup === "function") {
    window.addCleanup(() => document.removeEventListener("keydown", handleKeydown))
  }

  // Sync initial UI
  updateUI()
}

// Attach event listeners both on initial page load and during Quartz SPA navigation
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupTTS)
} else {
  setupTTS()
}
document.addEventListener("nav", setupTTS)

// Auto-minimize when Courses/Rabuan/Concepts dropdown opens; restore when cursor leaves without navigating
if (!(window as any).__ttsNavDropdownListenersAttached) {
  ;(window as any).__ttsNavDropdownListenersAttached = true

  document.addEventListener("navdropdownopen", () => {
    const shelf = document.getElementById("tts-player-shelf")
    const isShelfOpen = shelf?.classList.contains("open") ?? false
    if (isShelfOpen && !session.isMinimized) {
      autoMinimizedByNavDropdown = true
      minimizeAudio(true)
    }
  })

  document.addEventListener("navdropdownclose", (e: CustomEventMap["navdropdownclose"]) => {
    const isNavigating = e.detail?.navigating ?? false
    if (autoMinimizedByNavDropdown) {
      autoMinimizedByNavDropdown = false
      if (!isNavigating) {
        restoreAudio()
      }
    }
  })

  document.addEventListener("prenav", () => {
    autoMinimizedByNavDropdown = false
  })
}
