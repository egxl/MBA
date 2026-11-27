import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { portalI18n } from "../i18n/portal"
// @ts-ignore
import ttsScript from "./scripts/tts.inline"
import styles from "./styles/tts.scss"

const TTSPlayer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
  const p = portalI18n(cfg.locale)
  return (
    <>
      <button
        type="button"
        class={classNames(displayClass, "tts-navbar-btn")}
        aria-label={p.tts.togglePlayerAria}
        title={p.tts.listenPageTitle}
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
        <div
          id="tts-player-shelf"
          class="tts-player-shelf"
          aria-hidden="true"
          data-no-track={p.tts.noTrackSelected}
          data-play-label={p.tts.playAudio}
          data-pause-label={p.tts.pauseAudio}
          data-female-label={p.tts.femaleLabel}
          data-male-label={p.tts.maleLabel}
          data-female-title={p.tts.femaleTitle}
          data-male-title={p.tts.maleTitle}
        >
          <div class="tts-shelf-row-top">
            <div class="tts-transport">
              <button
                type="button"
                id="tts-prev-btn"
                aria-label={p.tts.prevParagraph}
                title={p.tts.prevParagraph}
              >
                <svg viewBox="0 0 24 24">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </button>
              <button
                type="button"
                id="tts-play-btn"
                aria-label={p.tts.playAudio}
                title={p.tts.playAudio}
              >
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
                aria-label={p.tts.nextParagraph}
                title={p.tts.nextParagraph}
              >
                <svg viewBox="0 0 24 24">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>
            </div>

            <div class="tts-track-info">
              <span class="tts-now-playing-label">{p.tts.nowPlaying}</span>
              <span id="tts-track-title">{p.tts.selectArticle}</span>
            </div>

            <div class="tts-shelf-actions">
              <button
                type="button"
                id="tts-voice-btn"
                class="tts-badge-btn"
                title={p.tts.femaleTitle}
              >
                {p.tts.femaleLabel}
              </button>
              <button
                type="button"
                id="tts-speed-btn"
                class="tts-badge-btn"
                title={p.tts.speedTitle}
              >
                1.0x
              </button>
              <button
                type="button"
                id="tts-minimize-btn"
                class="tts-action-icon-btn"
                aria-label={p.tts.minimizeAria}
                title={p.tts.minimizeTitle}
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
                aria-label={p.tts.closeStopTitle}
                title={p.tts.closeStopTitle}
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
                aria-label={p.tts.scrubberAria}
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
