import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import readingTime from "reading-time"
import styles from "./styles/tts.scss"

const TTSListenPill: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const text = fileData.text
  if (!text) return null

  // Calculate audio duration: ~150 words per minute
  const { words } = readingTime(text)
  if (words < 10) return null

  const minutes = Math.ceil(words / 150)
  const durationLabel = `${minutes} min audio`

  return (
    <div class={classNames(displayClass, "tts-track-selector-wrapper")}>
      <button
        type="button"
        class="tts-track-selector"
        aria-label={`Listen to article (${durationLabel})`}
        title="Listen to this article with Text-to-Speech"
      >
        <svg
          class="tts-pill-icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
        <span class="tts-pill-label">Listen to article</span>
        <span class="tts-pill-duration">{`\u00B7 ${durationLabel}`}</span>
      </button>
    </div>
  )
}

TTSListenPill.css = styles

export default (() => TTSListenPill) satisfies QuartzComponentConstructor
