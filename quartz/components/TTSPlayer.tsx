import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import ttsScript from "./scripts/tts.inline"
import styles from "./styles/tts.scss"

const TTSPlayer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <>
      <button
        type="button"
        class={classNames(displayClass, "tts-navbar-btn")}
        aria-label="Toggle Text-to-Speech Player"
        title="Listen to page (Text-to-Speech)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path class="tts-icon-wave" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path class="tts-icon-wave" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      </button>

      <div class="tts-shelf-wrapper" aria-live="polite">
        <div id="tts-player-shelf" class="tts-player-shelf" aria-hidden="true">
          <div class="tts-shelf-row-top">
            <div class="tts-transport">
              <button
                type="button"
                id="tts-prev-btn"
                aria-label="Previous paragraph"
                title="Previous paragraph"
              >
                <svg viewBox="0 0 24 24">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </button>
              <button type="button" id="tts-play-btn" aria-label="Play audio" title="Play audio">
                <svg class="icon-play" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <svg class="icon-pause" viewBox="0 0 24 24" style="display: none;">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              </button>
              <button
                type="button"
                id="tts-next-btn"
                aria-label="Next paragraph"
                title="Next paragraph"
              >
                <svg viewBox="0 0 24 24">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>
            </div>

            <div class="tts-track-info">
              <span class="tts-now-playing-label">Now Playing</span>
              <span id="tts-track-title">Select an article to listen</span>
            </div>

            <div class="tts-shelf-actions">
              <button
                type="button"
                id="tts-voice-btn"
                class="tts-badge-btn"
                title="Voice: Female. Click to toggle between Female and Male."
              >
                ♀ Female
              </button>
              <button
                type="button"
                id="tts-speed-btn"
                class="tts-badge-btn"
                title="Playback speed. Click to change."
              >
                1.0x
              </button>
              <button
                type="button"
                id="tts-minimize-btn"
                class="tts-action-icon-btn"
                aria-label="Minimize player"
                title="Minimize player (keep listening in background)"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  fill="none"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <button
                type="button"
                id="tts-close-stop-btn"
                class="tts-action-icon-btn tts-close-stop-btn"
                aria-label="Stop playback and close player"
                title="Stop playback and close player"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  fill="none"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div class="tts-shelf-row-bottom">
            <span id="tts-time-elapsed">00:00</span>
            <div class="tts-scrubber-container">
              <input
                type="range"
                id="tts-scrubber"
                min="0"
                max="100"
                step="0.5"
                value="0"
                aria-label="Audio scrubber"
              />
            </div>
            <span id="tts-time-total">00:00</span>
            <span id="tts-para-indicator">P 0/0</span>
          </div>
        </div>
      </div>
    </>
  )
}

TTSPlayer.beforeDOMLoaded = ttsScript
TTSPlayer.css = styles

export default (() => TTSPlayer) satisfies QuartzComponentConstructor
