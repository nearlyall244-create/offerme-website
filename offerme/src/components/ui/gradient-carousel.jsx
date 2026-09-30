import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/* Original 3D coverflow-style carousel.
 * - cards are positioned from a circular index offset, so the strip never ends
 * - perspective + rotateY + z-recession do the depth; the stage measures itself
 *   with a ResizeObserver so card metrics recompute per breakpoint
 * - the stage is transparent: no fill, no wash, no counter
 */

/* `cardRatio` shrinks the cards while `pad` grows by the same amount, so the
 * stage keeps its height and the extra space becomes padding around the strip. */
const LAYOUTS = [
  { min: 0, cardRatio: 0.66, gap: 12, depth: 160, rotation: 20, pad: 56 },
  { min: 640, cardRatio: 0.33, gap: 16, depth: 200, rotation: 26, pad: 67 },
  { min: 1024, cardRatio: 0.23, gap: 20, depth: 240, rotation: 28, pad: 81 },
]

function pickLayout(width) {
  let layout = LAYOUTS[0]
  for (const candidate of LAYOUTS) {
    if (width >= candidate.min) layout = candidate
  }
  return layout
}

export function GradientCarousel({
  images = [],
  initialIndex = 0,
  cardAspectRatio = 16 / 10,
  label = 'Image carousel',
  autoplay = true,
  autoplayInterval = 1000,
  onChange,
  className,
  children,
  ...props
}) {
  const slides = React.useMemo(
    () =>
      (images || []).map((image) =>
        typeof image === 'string' ? { src: image, alt: '' } : image,
      ),
    [images],
  )

  const count = slides.length
  const [index, setIndex] = React.useState(() => {
    if (!count) return 0
    return ((initialIndex % count) + count) % count
  })
  const [width, setWidth] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const [dragX, setDragX] = React.useState(0)

  // derived, not synchronised in an effect: survives the images array changing
  const activeIndex = count === 0 ? 0 : ((index % count) + count) % count

  const rootRef = React.useRef(null)
  const pointer = React.useRef({ id: null, startX: 0, startY: 0, moved: false, decided: false })
  const suppressClick = React.useRef(false)
  const onChangeRef = React.useRef(onChange)
  const firstRun = React.useRef(true)

  React.useEffect(() => {
    onChangeRef.current = onChange
  })

  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    onChangeRef.current?.(activeIndex)
  }, [activeIndex])

  React.useLayoutEffect(() => {
    const node = rootRef.current
    if (!node) return undefined
    const measure = () => setWidth(node.clientWidth || 0)
    measure()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const layout = React.useMemo(() => pickLayout(width || 1024), [width])
  const cardWidth = Math.max(1, Math.round((width || 1024) * layout.cardRatio))
  const cardHeight = Math.max(1, Math.round(cardWidth / cardAspectRatio))
  const stageHeight = cardHeight + layout.pad
  const step = cardWidth + layout.gap

  const go = React.useCallback(
    (next) => {
      setIndex((current) => {
        if (count === 0) return current
        return ((next % count) + count) % count
      })
      setDragX(0)
    },
    [count],
  )

  /* Forward means the strip travels LEFT → RIGHT: the card sitting on the left
   * slides into the centre, the centre card slides right, and the next image
   * enters from the left edge. Because `offsetOf` is circular, stepping from
   * image 6 back to image 1 is just another index step — no reset, no jump. */
  const goForward = React.useCallback(() => go(activeIndex - 1), [go, activeIndex])
  const goBackward = React.useCallback(() => go(activeIndex + 1), [go, activeIndex])

  // Autoplay pauses only while the user is dragging; the effect re-runs on
  // every index change (auto or manual), so the timer restarts cleanly.
  React.useEffect(() => {
    if (!autoplay || count < 2 || dragging) return undefined
    const timer = setTimeout(goForward, autoplayInterval)
    return () => clearTimeout(timer)
  }, [autoplay, autoplayInterval, count, dragging, goForward])

  const handleKeyDown = (event) => {
    if (count < 2) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goBackward()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      goForward()
    } else if (event.key === 'Home') {
      event.preventDefault()
      go(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      go(count - 1)
    }
  }

  const handlePointerDown = (event) => {
    if (count < 2) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    pointer.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      decided: false,
    }
    suppressClick.current = false
    setDragging(true)
    setDragX(0)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const state = pointer.current
    if (state.id !== event.pointerId) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    if (!state.decided) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      state.decided = true
      // let the page scroll when the gesture starts vertically
      if (Math.abs(dy) > Math.abs(dx)) {
        state.id = null
        setDragging(false)
        return
      }
    }
    state.moved = true
    setDragX(dx * 0.9)
  }

  const endPointer = (event) => {
    const state = pointer.current
    if (state.id !== event.pointerId) return
    const dx = event.clientX - state.startX
    pointer.current = { id: null, startX: 0, startY: 0, moved: false, decided: false }
    setDragging(false)
    setDragX(0)
    suppressClick.current = state.moved
    if (state.moved && Math.abs(dx) > Math.min(90, step * 0.18)) {
      go(activeIndex + (dx < 0 ? 1 : -1))
    }
  }

  const handleCardClick = (target) => {
    if (suppressClick.current) return
    if (target !== activeIndex) go(target)
  }

  const offsetOf = (i) => {
    if (count < 2) return 0
    let offset = (i - activeIndex) % count
    if (offset > count / 2) offset -= count
    if (offset < -count / 2) offset += count
    return offset
  }

  const showNav = count > 1

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={showNav ? 0 : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative isolate select-none overflow-hidden rounded-2xl outline-none',
        className,
      )}
      {...props}
    >
      <div
        className="relative touch-pan-y"
        style={{
          height: stageHeight,
          perspective: `${layout.depth * 5}px`,
          perspectiveOrigin: '50% 50%',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        {slides.map((slide, i) => {
          const offset = offsetOf(i)
          const abs = Math.abs(offset)
          const isActive = i === activeIndex
          const hidden = width > 0 && abs * step - cardWidth / 2 >= width / 2
          const x = offset * step + (dragging ? dragX : 0)
          const z = -abs * layout.depth
          const rotate = offset * layout.rotation
          const scale = 1 - Math.min(abs, 3) * 0.07

          return (
            <div
              key={`${slide.src}-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!isActive}
              onClick={() => handleCardClick(i)}
              className={cn(
                'absolute left-1/2 top-1/2 cursor-grab overflow-hidden rounded-xl ring-1 ring-white/15 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)]',
                dragging && 'cursor-grabbing',
                hidden && 'pointer-events-none opacity-0',
              )}
              style={{
                width: cardWidth,
                height: cardHeight,
                transform: `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${rotate}deg) scale(${scale})`,
                opacity: hidden ? 0 : isActive ? 1 : Math.max(0.4, 1 - abs * 0.24),
                zIndex: 30 - abs * 4,
                transitionProperty: 'transform, opacity',
                transitionDuration: dragging ? '0ms' : '400ms',
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                pointerEvents: hidden ? 'none' : 'auto',
              }}
            >
              <img
                src={slide.src}
                alt={slide.alt || ''}
                draggable={false}
                loading={isActive ? 'eager' : 'lazy'}
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>
          )
        })}
      </div>

      {showNav && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={goBackward}
            className={cn(
              'absolute left-3 top-1/2 z-40 grid size-9 -translate-y-1/2 place-items-center rounded-full',
              'border border-white/25 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/60',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              'md:size-10',
            )}
          >
            <ChevronLeft className="size-4 md:size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={goForward}
            className={cn(
              'absolute right-3 top-1/2 z-40 grid size-9 -translate-y-1/2 place-items-center rounded-full',
              'border border-white/25 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/60',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              'md:size-10',
            )}
          >
            <ChevronRight className="size-4 md:size-5" aria-hidden />
          </button>
        </>
      )}

      {children}
    </div>
  )
}

export default GradientCarousel
