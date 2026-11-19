import type { Page } from '@playwright/test'

/**
 * Waits until Nuxt has finished hydrating. Before that, a NuxtLink is a plain link and a
 * click does a full page load, so tests of client-side navigation must wait for this.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const w = window as unknown as { useNuxtApp?: () => { isHydrating?: boolean } }
    try {
      return w.useNuxtApp?.().isHydrating === false
    } catch {
      return false
    }
  })
}
