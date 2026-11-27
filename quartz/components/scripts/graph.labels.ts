export interface LabelCandidate {
  id: string
  x: number
  y: number
  width: number
  height: number
  priority: number
  pinned?: boolean
}

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

export function getLabelScale(baseScale: number, zoomK: number): number {
  const safeBase = baseScale > 0 ? baseScale : 1
  const safeZoom = Math.max(zoomK, 0.2)
  return 1 / (safeBase * Math.pow(safeZoom, 0.85))
}

export function truncateLabel(text: string, maxLen = 36): string {
  if (text.length <= maxLen) return text
  return `${text.slice(0, Math.max(maxLen - 1, 1)).trimEnd()}…`
}

function toBox(c: LabelCandidate): Box {
  // Matches Pixi Text anchor { x: 0.5, y: 1.2 } above node center
  return {
    left: c.x - c.width / 2,
    right: c.x + c.width / 2,
    top: c.y - c.height * 1.2,
    bottom: c.y - c.height * 0.2,
  }
}

export function cullOverlappingLabels(
  candidates: LabelCandidate[],
  viewport: { width: number; height: number },
  padding = 4,
): Set<string> {
  const sorted = [...candidates].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1
    return b.priority - a.priority
  })

  const accepted = new Set<string>()
  const placed: Box[] = []

  // shortcut: linear AABB scan over visible candidates, upgrade to spatial grid if node count exceeds ~2,000
  for (const candidate of sorted) {
    const box = toBox(candidate)
    if (candidate.pinned) {
      accepted.add(candidate.id)
      placed.push(box)
      continue
    }

    if (box.right < 0 || box.left > viewport.width || box.bottom < 0 || box.top > viewport.height) {
      continue
    }

    const overlaps = placed.some(
      (p) =>
        !(
          box.right + padding <= p.left ||
          box.left - padding >= p.right ||
          box.bottom + padding <= p.top ||
          box.top - padding >= p.bottom
        ),
    )
    if (!overlaps) {
      accepted.add(candidate.id)
      placed.push(box)
    }
  }

  return accepted
}
