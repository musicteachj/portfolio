import type { Page } from '@playwright/test'

/**
 * Records every scroll position from now on. A jump shows up as one event at the target;
 * a glide also leaves positions on the way.
 */
export const recordScrolls = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __scrolls: number[] }
    w.__scrolls = []
    addEventListener('scroll', () => w.__scrolls.push(Math.round(window.scrollY)), { passive: true })
  })

/** Recorded scroll positions strictly between lo and hi. */
export const scrollsBetween = (page: Page, lo: number, hi: number) =>
  page.evaluate(
    ([lo, hi]) => (window as unknown as { __scrolls: number[] }).__scrolls.filter((y) => y > lo && y < hi),
    [lo, hi],
  )

/**
 * Waits until the page has stopped scrolling: the offset stays the same for five
 * animation frames in a row. A smooth scroll moves the offset on every frame it runs.
 */
export const waitForScrollIdle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = window.scrollY
        let still = 0
        const tick = () => {
          still = window.scrollY === last ? still + 1 : 0
          last = window.scrollY
          if (still >= 5) resolve()
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
  )
