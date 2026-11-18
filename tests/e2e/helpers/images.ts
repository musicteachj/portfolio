import type { Locator } from '@playwright/test'

export type Pick = { src: number; css: number; url: string }

/**
 * Scrolls each matched image into view (so a lazy one loads), then reads the width of the
 * source the browser picked (the IPX size modifier s_<W>x<H> in currentSrc; 0 when absent)
 * and the rendered CSS width.
 */
export async function picksFor(images: Locator): Promise<Pick[]> {
  const picks: Pick[] = []
  for (let i = 0; i < (await images.count()); i++) {
    await images.nth(i).scrollIntoViewIfNeeded()
    picks.push(
      await images.nth(i).evaluate(async (img: HTMLImageElement) => {
        if (!img.complete || !img.currentSrc) await new Promise((r) => img.addEventListener('load', r, { once: true }))
        const m = /s_(\d+)x\d+/.exec(img.currentSrc)
        return { src: Number(m?.[1] ?? 0), css: img.getBoundingClientRect().width, url: img.currentSrc }
      }),
    )
  }
  return picks
}

/** Asserts the picked source covers 0.95x the rendered need, or is the original file. */
export function sharpEnough(pick: Pick, dpr: number, sourceWidth: number): { got: number; need: number } {
  return { got: Math.min(pick.src, sourceWidth), need: Math.min(0.95 * pick.css * dpr, sourceWidth) }
}
