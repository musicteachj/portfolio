import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

/** Waits for running animations (axe reads mid-fade opacity as a contrast failure), then checks axe. */
export async function expectNoSeriousAxe(page: Page): Promise<void> {
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))))
  const r = await new AxeBuilder({ page }).analyze()
  expect(r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([])
}
